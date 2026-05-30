/**
 * Razorpay Create Order — Cloudflare Pages Function
 * 
 * Creates a Razorpay order via the Razorpay REST API.
 * Returns the order details + keyId so the client can open the checkout popup.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  const keyId = env.RAZORPAY_KEY_ID?.trim();
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return Response.json(
      { error: 'Razorpay keys not configured', code: 'KEYS_MISSING' },
      { status: 500 }
    );
  }

  try {
    const payload = await request.json();
    const { amount, currency = 'INR', orderId, notes } = payload;

    if (!amount || amount <= 0) {
      return Response.json(
        { error: 'Invalid amount', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    const receipt = orderId || `rcpt_${Math.random().toString(36).substring(2, 15)}`;

    // Base64 encode credentials for Basic Auth
    const authHeader = `Basic ${btoa(`${keyId}:${keySecret}`)}`;

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100), // Convert to paise
        currency,
        receipt,
        notes,
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('[Razorpay] API error:', errorText);

      let errorMessage = `Razorpay API error: ${errorText}`;
      try {
        const errorObj = JSON.parse(errorText);
        if (errorObj && errorObj.error && errorObj.error.description) {
          errorMessage = errorObj.error.description;
        } else if (errorObj && errorObj.description) {
          errorMessage = errorObj.description;
        }
      } catch (e) {
        // Fall back to original error text if not valid JSON
      }

      return Response.json(
        { error: errorMessage, code: 'RAZORPAY_ERROR' },
        { status: razorpayResponse.status }
      );
    }

    const order = await razorpayResponse.json();

    return Response.json({
      ...order,
      keyId,
    });
  } catch (err) {
    console.error('[Razorpay] Exception in create-order:', err);
    return Response.json(
      { error: err.message || 'Internal Server Error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
