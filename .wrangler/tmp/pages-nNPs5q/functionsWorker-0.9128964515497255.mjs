var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/razorpay/create-order.js
async function onRequestPost(context) {
  const { request, env } = context;
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return Response.json(
      { error: "Razorpay keys not configured", code: "KEYS_MISSING" },
      { status: 500 }
    );
  }
  try {
    const payload = await request.json();
    const { amount, currency = "INR", orderId } = payload;
    if (!amount || amount <= 0) {
      return Response.json(
        { error: "Invalid amount", code: "INVALID_AMOUNT" },
        { status: 400 }
      );
    }
    const receipt = orderId || `rcpt_${Math.random().toString(36).substring(2, 15)}`;
    const authHeader = `Basic ${btoa(`${keyId}:${keySecret}`)}`;
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        // Convert to paise
        currency,
        receipt
      })
    });
    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("[Razorpay] API error:", errorText);
      return Response.json(
        { error: `Razorpay API error: ${errorText}`, code: "RAZORPAY_ERROR" },
        { status: razorpayResponse.status }
      );
    }
    const order = await razorpayResponse.json();
    return Response.json({
      ...order,
      keyId
    });
  } catch (err) {
    console.error("[Razorpay] Exception in create-order:", err);
    return Response.json(
      { error: err.message || "Internal Server Error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
__name(onRequestPost, "onRequestPost");

// api/razorpay/verify-payment.js
async function computeHmacSha256(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(computeHmacSha256, "computeHmacSha256");
async function updateOrderInFirestore(env, orderId, paymentId) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY;
    if (!projectId || !apiKey) {
      console.error("[Razorpay Verify] Missing Firebase configuration");
      return false;
    }
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?updateMask.fieldPaths=payment.status&updateMask.fieldPaths=payment.transactionId&key=${apiKey}`;
    const response = await fetch(firestoreUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          payment: {
            mapValue: {
              fields: {
                status: { stringValue: "Paid" },
                transactionId: { stringValue: paymentId }
              }
            }
          }
        }
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Razorpay Verify] Firestore API error (global order): ${response.status}`, errorText);
    } else {
      console.log(`[Razorpay Verify] \u2705 Global order ${orderId} payment status updated to Paid`);
    }
    try {
      const getUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?key=${apiKey}`;
      const getRes = await fetch(getUrl);
      if (getRes.ok) {
        const orderData = await getRes.json();
        const userId = orderData.fields?.userId?.stringValue;
        if (userId) {
          const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}:runQuery?key=${apiKey}`;
          const queryRes = await fetch(queryUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              structuredQuery: {
                from: [{ collectionId: "orders" }],
                where: {
                  fieldFilter: {
                    field: { fieldPath: "globalOrderId" },
                    op: "EQUAL",
                    value: { stringValue: orderId }
                  }
                }
              }
            })
          });
          if (queryRes.ok) {
            const queryResults = await queryRes.json();
            for (const result of queryResults) {
              if (result.document && result.document.name) {
                const userOrderDocPath = result.document.name;
                const updateUrl = `https://firestore.googleapis.com/${userOrderDocPath}?updateMask.fieldPaths=payment.status&updateMask.fieldPaths=payment.transactionId&key=${apiKey}`;
                const patchRes = await fetch(updateUrl, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    fields: {
                      payment: {
                        mapValue: {
                          fields: {
                            status: { stringValue: "Paid" },
                            transactionId: { stringValue: paymentId }
                          }
                        }
                      }
                    }
                  })
                });
                if (patchRes.ok) {
                  console.log(`[Razorpay Verify] \u2705 User order document updated for user ${userId}`);
                } else {
                  console.error(`[Razorpay Verify] Failed to update user order document: ${patchRes.status}`);
                }
              }
            }
          }
        }
      }
    } catch (innerErr) {
      console.error("[Razorpay Verify] Error updating user subcollection order:", innerErr);
    }
    return true;
  } catch (error) {
    console.error("[Razorpay Verify] Error updating Firestore:", error);
    return false;
  }
}
__name(updateOrderInFirestore, "updateOrderInFirestore");
async function onRequestPost2(context) {
  const { request, env } = context;
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return Response.json(
      { error: "Razorpay Key Secret is not configured", code: "CONFIG_MISSING" },
      { status: 500 }
    );
  }
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { error: "Missing required payment verification parameters", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }
    const expectedSignature = await computeHmacSha256(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      keySecret
    );
    if (expectedSignature !== razorpay_signature) {
      console.warn("[Razorpay Verify] Signature mismatch \u2014 verification failed");
      return Response.json(
        { error: "Payment verification failed. Invalid signature.", verified: false },
        { status: 400 }
      );
    }
    let pgData = { razorpay_order_id, razorpay_payment_id, razorpay_signature };
    try {
      if (keyId && keySecret) {
        const paymentRes = await fetch(
          `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
          {
            headers: {
              Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`
            }
          }
        );
        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          pgData = { ...pgData, ...paymentData };
        }
      }
    } catch (_) {
    }
    if (orderId) {
      await updateOrderInFirestore(env, orderId, razorpay_payment_id);
    }
    return Response.json({ verified: true, pgData });
  } catch (err) {
    console.error("[Razorpay Verify] Exception:", err);
    return Response.json(
      { error: err.message || "Internal Server Error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
__name(onRequestPost2, "onRequestPost");

// api/send-email.js
async function onRequest(context) {
  const { request, env } = context;
  const startTime = Date.now();
  console.log(`[Email Function] Incoming ${request.method} request to ${request.url}`);
  console.log(`[Email Function] Request headers:`, Object.fromEntries(request.headers.entries()));
  if (request.method === "OPTIONS") {
    console.log("[Email Function] Handling CORS preflight request");
    return handleCORS();
  }
  if (request.method !== "POST") {
    console.log(`[Email Function] Method ${request.method} not allowed`);
    return new Response(JSON.stringify({
      error: { message: "Method not allowed", code: "METHOD_NOT_ALLOWED" }
    }), {
      status: 405,
      headers: getCORSHeaders()
    });
  }
  try {
    let body;
    try {
      const rawBody = await request.text();
      console.log(`[Email Function] Raw request body length: ${rawBody.length}`);
      body = JSON.parse(rawBody);
      console.log(`[Email Function] Parsed request body:`, {
        to: body.to,
        subject: body.subject,
        hasHtml: !!body.html,
        htmlLength: body.html?.length || 0,
        from: body.from
      });
    } catch (parseError) {
      console.error("[Email Function] Failed to parse request body:", parseError);
      return new Response(JSON.stringify({
        error: { message: "Invalid JSON in request body", code: "INVALID_JSON" }
      }), {
        status: 400,
        headers: getCORSHeaders()
      });
    }
    const missingFields = [];
    if (!body.to) missingFields.push("to");
    if (!body.subject) missingFields.push("subject");
    if (!body.html) missingFields.push("html");
    if (missingFields.length > 0) {
      console.error(`[Email Function] Missing required fields: ${missingFields.join(", ")}`);
      return new Response(JSON.stringify({
        error: {
          message: `Missing required fields: ${missingFields.join(", ")}`,
          code: "MISSING_FIELDS",
          missingFields
        }
      }), {
        status: 400,
        headers: getCORSHeaders()
      });
    }
    console.log("[Email Function] Environment variables check:");
    console.log("- RESEND_API_KEY exists:", !!env.RESEND_API_KEY);
    console.log("- RESEND_API_KEY length:", env.RESEND_API_KEY?.length || 0);
    console.log("- RESEND_API_KEY starts with re_:", env.RESEND_API_KEY?.startsWith("re_") || false);
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[Email Function] RESEND_API_KEY environment variable not found");
      return new Response(JSON.stringify({
        error: {
          message: "Server configuration error: Missing API key",
          code: "MISSING_API_KEY"
        }
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
    if (!apiKey.startsWith("re_")) {
      console.error("[Email Function] Invalid API key format - should start with re_");
      return new Response(JSON.stringify({
        error: {
          message: "Server configuration error: Invalid API key format",
          code: "INVALID_API_KEY_FORMAT"
        }
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
    const defaultFrom = "KamiKoto <hello@mailer.kamikoto.click>";
    const emailPayload = {
      from: body.from || defaultFrom,
      to: Array.isArray(body.to) ? body.to : [body.to],
      // Ensure to is an array
      subject: body.subject,
      html: body.html,
      // Add other optional fields if provided
      ...body.cc && { cc: Array.isArray(body.cc) ? body.cc : [body.cc] },
      ...body.bcc && { bcc: Array.isArray(body.bcc) ? body.bcc : [body.bcc] },
      ...body.reply_to && { reply_to: body.reply_to }
    };
    console.log("[Email Function] Prepared email payload:");
    console.log("- From:", emailPayload.from);
    console.log("- To:", emailPayload.to);
    console.log("- Subject:", emailPayload.subject);
    console.log("- HTML length:", emailPayload.html.length);
    console.log("- Has CC:", !!emailPayload.cc);
    console.log("- Has BCC:", !!emailPayload.bcc);
    console.log("- Has Reply-To:", !!emailPayload.reply_to);
    console.log("[Email Function] Calling Resend API...");
    const resendStartTime = Date.now();
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "User-Agent": "KamiKoto-Shop/1.0.0"
      },
      body: JSON.stringify(emailPayload)
    });
    const resendDuration = Date.now() - resendStartTime;
    console.log(`[Email Function] Resend API response received in ${resendDuration}ms`);
    console.log(`[Email Function] Resend response status: ${resendResponse.status}`);
    console.log(`[Email Function] Resend response headers:`, Object.fromEntries(resendResponse.headers.entries()));
    let data;
    try {
      const responseText = await resendResponse.text();
      console.log(`[Email Function] Resend response body length: ${responseText.length}`);
      data = JSON.parse(responseText);
      console.log("[Email Function] Resend response data:", data);
    } catch (parseError) {
      console.error("[Email Function] Failed to parse Resend response:", parseError);
      return new Response(JSON.stringify({
        error: {
          message: "Failed to parse response from email service",
          code: "RESPONSE_PARSE_ERROR"
        }
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
    const totalDuration = Date.now() - startTime;
    console.log(`[Email Function] Total request duration: ${totalDuration}ms`);
    if (resendResponse.ok) {
      console.log(`[Email Function] \u2705 Email sent successfully! ID: ${data.id}`);
    } else {
      console.error(`[Email Function] \u274C Email sending failed:`, data);
    }
    return new Response(JSON.stringify({
      ...data,
      // Add debugging metadata in development
      ...{
        debug: {
          duration: totalDuration,
          resendDuration,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      }
    }), {
      status: resendResponse.status,
      headers: getCORSHeaders()
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`[Email Function] \u274C Unexpected error after ${totalDuration}ms:`, error);
    console.error("[Email Function] Error stack:", error.stack);
    return new Response(JSON.stringify({
      error: {
        message: error.message || "Internal server error",
        code: "INTERNAL_ERROR",
        ...{
          stack: error.stack,
          duration: totalDuration
        }
      }
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}
__name(onRequest, "onRequest");
function handleCORS() {
  console.log("[Email Function] Sending CORS preflight response");
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}
__name(handleCORS, "handleCORS");
function getCORSHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    // In production, replace with your domain
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache"
  };
}
__name(getCORSHeaders, "getCORSHeaders");

// api/send-notification.js
async function onRequest2(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCORSHeaders2()
    });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: { message: "Method not allowed" } }), {
      status: 405,
      headers: getCORSHeaders2()
    });
  }
  try {
    const body = await request.json();
    const { tokens, notification, data } = body;
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return new Response(JSON.stringify({ error: { message: "No tokens provided" } }), {
        status: 400,
        headers: getCORSHeaders2()
      });
    }
    if (!notification || !notification.title || !notification.body) {
      return new Response(JSON.stringify({ error: { message: "Notification title and body are required" } }), {
        status: 400,
        headers: getCORSHeaders2()
      });
    }
    const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ error: { message: "Server configuration error: Missing Service Account Key" } }), {
        status: 500,
        headers: getCORSHeaders2()
      });
    }
    const serviceAccount = JSON.parse(serviceAccountJson);
    const accessToken = await getGoogleAuthToken(serviceAccount);
    const projectId = serviceAccount.project_id;
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    const results = [];
    const maxTokens = 100;
    const tokensToSend = tokens.slice(0, maxTokens);
    for (const token of tokensToSend) {
      const message = {
        message: {
          token,
          notification: {
            title: notification.title,
            body: notification.body
          },
          data: data || {},
          android: {
            priority: "high",
            notification: {
              click_action: data?.link || "/"
            }
          },
          webpush: {
            headers: {
              Urgency: "high"
            },
            notification: {
              icon: notification.icon || "/logo192.png",
              click_action: data?.link || "/"
            }
          }
        }
      };
      const response = await fetch(fcmUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
      });
      const result = await response.json();
      results.push({ token: token.substring(0, 10) + "...", success: response.ok, result });
    }
    return new Response(JSON.stringify({
      success: true,
      count: results.filter((r) => r.success).length,
      details: results
    }), {
      status: 200,
      headers: getCORSHeaders2()
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      status: 500,
      headers: getCORSHeaders2()
    });
  }
}
__name(onRequest2, "onRequest");
async function getGoogleAuthToken(serviceAccount) {
  const { client_email, private_key } = serviceAccount;
  const header = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1e3);
  const claimSet = b64(JSON.stringify({
    iss: client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  }));
  const signature = await sign(header + "." + claimSet, private_key);
  const jwt = header + "." + claimSet + "." + signature;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const data = await response.json();
  if (data.error) throw new Error(`OAuth error: ${data.error_description || data.error}`);
  return data.access_token;
}
__name(getGoogleAuthToken, "getGoogleAuthToken");
function b64(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(b64, "b64");
async function sign(data, privateKey) {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKey.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }
  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(data)
  );
  return b64(String.fromCharCode(...new Uint8Array(signature)));
}
__name(sign, "sign");
function getCORSHeaders2() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };
}
__name(getCORSHeaders2, "getCORSHeaders");

// _middleware.js
function isBot(userAgent) {
  if (!userAgent) return false;
  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "crawling",
    "facebookexternalhit",
    "facebookcatalog",
    "twitterbot",
    "twitter",
    "linkedinbot",
    "linkedin",
    "discordbot",
    "discord",
    "slackbot",
    "slack",
    "telegrambot",
    "telegram",
    "whatsapp",
    "whatsappbot",
    "pinterest",
    "pinterestbot",
    "skype",
    "skypebot",
    "redditbot",
    "reddit",
    "googlebot",
    "google",
    "bingbot",
    "bing",
    "yandexbot",
    "yandex",
    "baiduspider",
    "baidu",
    "duckduckbot",
    "duckduckgo",
    "slurp",
    "yahoo",
    "embedly",
    "quora",
    "outbrain",
    "flipboard",
    "tumblr",
    "bitly",
    "instapaper",
    "pocket",
    "developers.google.com/+/web/snippet",
    "vkshare",
    "w3c_validator",
    "applebot",
    "rogerbot",
    "semrushbot",
    "dotbot",
    "ahrefsbot",
    "screaming frog",
    "mediapartners-google",
    "adsbot-google"
  ];
  const ua = userAgent.toLowerCase();
  return botPatterns.some((pattern) => ua.includes(pattern));
}
__name(isBot, "isBot");
async function fetchProductData(productId, env) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY;
    if (!projectId || !apiKey) {
      console.error("[SEO Middleware] Missing Firebase configuration");
      return null;
    }
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${productId}`;
    const response = await fetch(`${firestoreUrl}?key=${apiKey}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      id: productId,
      name: data.fields?.name?.stringValue || "",
      description: data.fields?.description?.stringValue || "",
      price: Number(data.fields?.price?.integerValue || data.fields?.price?.doubleValue || 0),
      mrp: Number(data.fields?.mrp?.integerValue || data.fields?.mrp?.doubleValue || 0),
      image: data.fields?.image?.stringValue || "",
      brand: data.fields?.brand?.stringValue || "KamiKoto",
      type: data.fields?.type?.stringValue || "Stationery",
      stock: Number(data.fields?.stock?.integerValue || 0)
    };
  } catch (error) {
    console.error("[SEO Middleware] Error fetching product:", error);
    return null;
  }
}
__name(fetchProductData, "fetchProductData");
async function fetchRatingStats(productId, env) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY;
    const firestoreQueryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: "reviews" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "productId" },
            op: "EQUAL",
            value: { stringValue: productId }
          }
        }
      }
    };
    const response = await fetch(firestoreQueryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryBody)
    });
    if (!response.ok) return { average: 0, total: 0 };
    const results = await response.json();
    const reviews = results.filter((r) => r.document).map((r) => ({
      rating: Number(r.document.fields.rating.integerValue || 0)
    }));
    if (reviews.length === 0) return { average: 0, total: 0 };
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = totalRating / reviews.length;
    return {
      average: parseFloat(average.toFixed(1)),
      total: reviews.length
    };
  } catch (error) {
    console.error("[SEO Middleware] Error fetching ratings:", error);
    return { average: 0, total: 0 };
  }
}
__name(fetchRatingStats, "fetchRatingStats");
function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(price);
}
__name(formatPrice, "formatPrice");
function generateJsonLd(product, rating, url) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image],
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "INR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "KamiKoto"
      }
    }
  };
  if (rating.total > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": rating.average,
      "reviewCount": rating.total,
      "bestRating": "5",
      "worstRating": "1"
    };
  }
  return `<script type="application/ld+json">${JSON.stringify(schema)}<\/script>`;
}
__name(generateJsonLd, "generateJsonLd");
function generateMetaTags(product, rating, url) {
  const priceFormatted = formatPrice(product.price);
  const mrpFormatted = product.mrp > product.price ? formatPrice(product.mrp) : null;
  const discountPercent = product.mrp > product.price ? Math.round((product.mrp - product.price) / product.mrp * 100) : null;
  const title = `${product.name} | KamiKoto - Premium Stationery`;
  const metaDesc = product.description.substring(0, 160) + (product.description.length > 160 ? "..." : "");
  const embedTitle = `${product.name} - \u20B9${priceFormatted}${discountPercent ? ` (${discountPercent}% OFF)` : ""}`;
  return `
    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${metaDesc}">
    <link rel="canonical" href="${url}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${embedTitle}">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:image" content="${product.image}">
    <meta property="og:image:alt" content="${product.name}">
    <meta property="og:site_name" content="KamiKoto">
    <meta property="og:locale" content="en_IN">

    <!-- Product Specific Tags (Discord & Catalog) -->
    <meta property="product:brand" content="${product.brand}">
    <meta property="product:price:amount" content="${product.price}">
    <meta property="product:price:currency" content="INR">
    <meta property="product:availability" content="${product.stock > 0 ? "in stock" : "out of stock"}">
    <meta property="product:condition" content="new">
    <meta property="product:category" content="${product.type}">
    ${mrpFormatted ? `<meta property="product:price:standard_amount" content="${product.mrp}">` : ""}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${embedTitle}">
    <meta name="twitter:description" content="${metaDesc}">
    <meta name="twitter:image" content="${product.image}">
    <meta name="twitter:label1" content="Price">
    <meta name="twitter:data1" content="\u20B9${priceFormatted}${mrpFormatted ? ` (MRP: \u20B9${mrpFormatted})` : ""}">
    <meta name="twitter:label2" content="Rating">
    <meta name="twitter:data2" content="${rating.total > 0 ? `${rating.average} / 5 (${rating.total} reviews)` : "No reviews yet"}">

    <!-- Theme & Enhancements -->
    <meta name="theme-color" content="#000000">
    <meta name="apple-mobile-web-app-title" content="KamiKoto">
    <meta property="og:rich_attachment" content="true">
  `;
}
__name(generateMetaTags, "generateMetaTags");
async function onRequest3(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get("User-Agent") || "";
  const productMatch = url.pathname.match(/^\/product\/([^\/]+)$/);
  if (productMatch && isBot(userAgent)) {
    const productId = productMatch[1];
    const [product, rating] = await Promise.all([
      fetchProductData(productId, env),
      fetchRatingStats(productId, env)
    ]);
    if (product) {
      const response = await next();
      let html = await response.text();
      html = html.replace(/<title>.*?<\/title>/i, "");
      html = html.replace(/<meta[^>]+data-react-helmet="true"[^>]*>/gi, "");
      html = html.replace(/<meta property="og:[^>]+>/gi, "");
      html = html.replace(/<meta name="twitter:[^>]+>/gi, "");
      const metaTags = generateMetaTags(product, rating, request.url);
      const jsonLd = generateJsonLd(product, rating, request.url);
      html = html.replace("</head>", `${metaTags}
${jsonLd}
</head>`);
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }
  }
  return next();
}
__name(onRequest3, "onRequest");

// ../.wrangler/tmp/pages-nNPs5q/functionsRoutes-0.24641532887347517.mjs
var routes = [
  {
    routePath: "/api/razorpay/create-order",
    mountPath: "/api/razorpay",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/razorpay/verify-payment",
    mountPath: "/api/razorpay",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/send-email",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/send-notification",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest3],
    modules: []
  }
];

// ../../../../.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-iQYIYE/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-iQYIYE/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.9128964515497255.mjs.map
