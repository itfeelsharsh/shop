/**
 * Razorpay Data Proxy — Cloudflare Pages Function
 * 
 * Securely proxies request to Razorpay REST API endpoints:
 * - Payments: GET /v1/payments
 * - Orders: GET /v1/orders
 * - Refunds: GET /v1/refunds
 * - Settlements: GET /v1/settlements
 * - Customers: GET /v1/customers
 * - Invoices: GET /v1/invoices
 * - Disputes: GET /v1/disputes
 * 
 * Supports CORS so the admin panel can query it.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCORSHeaders(),
    });
  }

  // Only allow GET requests
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: getCORSHeaders(),
    });
  }

  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return new Response(
      JSON.stringify({ error: "Razorpay keys not configured on backend" }),
      {
        status: 500,
        headers: getCORSHeaders(),
      }
    );
  }

  // Extract query parameters
  const type = url.searchParams.get("type"); // e.g. payments, orders, refunds, settlements, customers, invoices, disputes
  
  if (!type) {
    return new Response(
      JSON.stringify({ error: "Missing required query parameter: type" }),
      {
        status: 400,
        headers: getCORSHeaders(),
      }
    );
  }

  const validTypes = ["payments", "orders", "refunds", "settlements", "customers", "invoices", "disputes"];
  if (!validTypes.includes(type)) {
    return new Response(
      JSON.stringify({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }),
      {
        status: 400,
        headers: getCORSHeaders(),
      }
    );
  }

  try {
    // Reconstruct the search params to forward to Razorpay (like count, skip, from, to, etc.)
    const razorpayParams = new URLSearchParams();
    for (const [key, val] of url.searchParams.entries()) {
      if (key !== "type") {
        razorpayParams.append(key, val);
      }
    }

    const authHeader = `Basic ${btoa(`${keyId}:${keySecret}`)}`;
    const razorpayUrl = `https://api.razorpay.com/v1/${type}${razorpayParams.toString() ? `?${razorpayParams.toString()}` : ""}`;

    console.log(`[Razorpay Proxy] Fetching from: ${razorpayUrl}`);
    const razorpayResponse = await fetch(razorpayUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error(`[Razorpay Proxy] API error for ${type}:`, errorText);
      return new Response(
        JSON.stringify({ error: `Razorpay API error: ${errorText}` }),
        {
          status: razorpayResponse.status,
          headers: getCORSHeaders(),
        }
      );
    }

    const data = await razorpayResponse.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: getCORSHeaders(),
    });
  } catch (err) {
    console.error(`[Razorpay Proxy] Exception in fetching ${type}:`, err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      {
        status: 500,
        headers: getCORSHeaders(),
      }
    );
  }
}

function getCORSHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  };
}
