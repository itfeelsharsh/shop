/**
 * Razorpay Verify Payment — Cloudflare Pages Function
 * 
 * Verifies the Razorpay payment signature using HMAC SHA-256 (Web Crypto API).
 * On success, updates the order status in Firestore via REST API.
 */

/**
 * Compute HMAC-SHA256 using the Web Crypto API (works in Workers & modern runtimes)
 */
async function computeHmacSha256(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Update the order document in Firestore with payment details via REST API
 */
async function updateOrderInFirestore(env, orderId, paymentId) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      console.error('[Razorpay Verify] Missing Firebase configuration');
      return false;
    }

    // 1. Update Global Order document
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?updateMask.fieldPaths=payment.status&updateMask.fieldPaths=payment.transactionId&key=${apiKey}`;

    const response = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          payment: {
            mapValue: {
              fields: {
                status: { stringValue: 'Paid' },
                transactionId: { stringValue: paymentId },
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Razorpay Verify] Firestore API error (global order): ${response.status}`, errorText);
    } else {
      console.log(`[Razorpay Verify] ✅ Global order ${orderId} payment status updated to Paid`);
    }

    // 2. Fetch global order to find userId and update user-specific order document
    try {
      const getUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?key=${apiKey}`;
      const getRes = await fetch(getUrl);
      if (getRes.ok) {
        const orderData = await getRes.json();
        const userId = orderData.fields?.userId?.stringValue;

        if (userId) {
          // Query users/{userId}/orders to find the document with matching globalOrderId
          const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}:runQuery?key=${apiKey}`;
          const queryRes = await fetch(queryUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              structuredQuery: {
                from: [{ collectionId: 'orders' }],
                where: {
                  fieldFilter: {
                    field: { fieldPath: 'globalOrderId' },
                    op: 'EQUAL',
                    value: { stringValue: orderId }
                  }
                }
              }
            })
          });

          if (queryRes.ok) {
            const queryResults = await queryRes.json();
            // runQuery returns an array of search results
            for (const result of queryResults) {
              if (result.document && result.document.name) {
                const userOrderDocPath = result.document.name;
                const updateUrl = `https://firestore.googleapis.com/${userOrderDocPath}?updateMask.fieldPaths=payment.status&updateMask.fieldPaths=payment.transactionId&key=${apiKey}`;
                
                const patchRes = await fetch(updateUrl, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    fields: {
                      payment: {
                        mapValue: {
                          fields: {
                            status: { stringValue: 'Paid' },
                            transactionId: { stringValue: paymentId },
                          },
                        },
                      },
                    },
                  })
                });

                if (patchRes.ok) {
                  console.log(`[Razorpay Verify] ✅ User order document updated for user ${userId}`);
                } else {
                  console.error(`[Razorpay Verify] Failed to update user order document: ${patchRes.status}`);
                }
              }
            }
          }
        }
      }
    } catch (innerErr) {
      console.error('[Razorpay Verify] Error updating user subcollection order:', innerErr);
    }

    return true;
  } catch (error) {
    console.error('[Razorpay Verify] Error updating Firestore:', error);
    return false;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return Response.json(
      { error: 'Razorpay Key Secret is not configured', code: 'CONFIG_MISSING' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { error: 'Missing required payment verification parameters', code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    // Verify signature: HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
    const expectedSignature = await computeHmacSha256(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      keySecret
    );

    if (expectedSignature !== razorpay_signature) {
      console.warn('[Razorpay Verify] Signature mismatch — verification failed');
      return Response.json(
        { error: 'Payment verification failed. Invalid signature.', verified: false },
        { status: 400 }
      );
    }

    // Signature valid — fetch payment details from Razorpay
    let pgData = { razorpay_order_id, razorpay_payment_id, razorpay_signature };

    try {
      if (keyId && keySecret) {
        const paymentRes = await fetch(
          `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
          {
            headers: {
              Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
            },
          }
        );
        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          pgData = { ...pgData, ...paymentData };
        }
      }
    } catch (_) {
      // Non-critical — signature already verified
    }

    // Update Firestore order status
    if (orderId) {
      await updateOrderInFirestore(env, orderId, razorpay_payment_id);
    }

    return Response.json({ verified: true, pgData });
  } catch (err) {
    console.error('[Razorpay Verify] Exception:', err);
    return Response.json(
      { error: err.message || 'Internal Server Error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
