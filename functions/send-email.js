/**
 * Cloudflare Function to handle email sending via Resend API
 * This acts as a server-side proxy to avoid CORS issues when calling Resend API directly from the client
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} env - Environment variables 
 * @param {Object} ctx - Execution context
 * @returns {Response} - JSON response with the result of the email operation
 */
export async function onRequest(context) {
  const { request, env } = context;
  
  // Check if this is a preflight OPTIONS request and handle CORS
  if (request.method === 'OPTIONS') {
    return handleCORS();
  }
  
  // Only allow POST requests for email sending
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ 
      error: { message: 'Method not allowed' } 
    }), {
      status: 405,
      headers: getCORSHeaders()
    });
  }
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.to || !body.subject || !body.html) {
      return new Response(JSON.stringify({ 
        error: { message: 'Missing required fields: to, subject, html' } 
      }), {
        status: 400,
        headers: getCORSHeaders()
      });
    }
    
    // Get API key from environment variables
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: { message: 'Server configuration error: Missing API key' } 
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
    
    // Prepare email payload
    const emailPayload = {
      from: body.from || 'KamiKoto <onboarding@resend.dev>', // Default from address
      to: body.to,
      subject: body.subject,
      html: body.html,
      // Add other optional fields if provided
      ...(body.cc && { cc: body.cc }),
      ...(body.bcc && { bcc: body.bcc }),
      ...(body.reply_to && { reply_to: body.reply_to })
    };
    
    // Call Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(emailPayload)
    });
    
    // Parse Resend API response
    const data = await resendResponse.json();
    
    // Return response with CORS headers
    return new Response(JSON.stringify(data), {
      status: resendResponse.status,
      headers: getCORSHeaders()
    });
  } catch (error) {
    // Handle errors
    return new Response(JSON.stringify({ 
      error: { message: error.message || 'Internal server error' } 
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

/**
 * Handle CORS preflight requests
 * @returns {Response} - Preflight response with CORS headers
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}

/**
 * Get CORS headers for responses
 * @returns {Object} - Headers object with CORS settings
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',  // Or specify your domain: 'https://kamikoto.pages.dev'
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
} 