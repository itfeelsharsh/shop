/**
 * Cloudflare Function to handle email sending via Resend API
 * This acts as a server-side proxy to avoid CORS issues when calling Resend API directly from the client
 * 
 * Enhanced with comprehensive logging and debugging for production troubleshooting
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} env - Environment variables 
 * @param {Object} ctx - Execution context
 * @returns {Response} - JSON response with the result of the email operation
 */
export async function onRequest(context) {
  const { request, env } = context;
  const startTime = Date.now();
  
  // Log incoming request for debugging
  console.log(`[Email Function] Incoming ${request.method} request to ${request.url}`);
  console.log(`[Email Function] Request headers:`, Object.fromEntries(request.headers.entries()));
  
  // Check if this is a preflight OPTIONS request and handle CORS
  if (request.method === 'OPTIONS') {
    console.log('[Email Function] Handling CORS preflight request');
    return handleCORS();
  }
  
  // Only allow POST requests for email sending
  if (request.method !== 'POST') {
    console.log(`[Email Function] Method ${request.method} not allowed`);
    return new Response(JSON.stringify({ 
      error: { message: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' } 
    }), {
      status: 405,
      headers: getCORSHeaders()
    });
  }

  try {
    // Parse request body with error handling
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
      console.error('[Email Function] Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: { message: 'Invalid JSON in request body', code: 'INVALID_JSON' } 
      }), {
        status: 400,
        headers: getCORSHeaders()
      });
    }
    
    // Validate required fields with detailed error messages
    const missingFields = [];
    if (!body.to) missingFields.push('to');
    if (!body.subject) missingFields.push('subject');
    if (!body.html) missingFields.push('html');
    
    if (missingFields.length > 0) {
      console.error(`[Email Function] Missing required fields: ${missingFields.join(', ')}`);
      return new Response(JSON.stringify({ 
        error: { 
          message: `Missing required fields: ${missingFields.join(', ')}`, 
          code: 'MISSING_FIELDS',
          missingFields: missingFields
        } 
      }), {
        status: 400,
        headers: getCORSHeaders()
      });
    }
    
    // Check environment variables
    console.log('[Email Function] Environment variables check:');
    console.log('- RESEND_API_KEY exists:', !!env.RESEND_API_KEY);
    console.log('- RESEND_API_KEY length:', env.RESEND_API_KEY?.length || 0);
    console.log('- RESEND_API_KEY starts with re_:', env.RESEND_API_KEY?.startsWith('re_') || false);
    
    // Get API key from environment variables
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Email Function] RESEND_API_KEY environment variable not found');
      return new Response(JSON.stringify({ 
        error: { 
          message: 'Server configuration error: Missing API key', 
          code: 'MISSING_API_KEY'
        } 
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
    
    if (!apiKey.startsWith('re_')) {
      console.error('[Email Function] Invalid API key format - should start with re_');
      return new Response(JSON.stringify({ 
        error: { 
          message: 'Server configuration error: Invalid API key format', 
          code: 'INVALID_API_KEY_FORMAT'
        } 
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
    
    // Prepare email payload with validation
    const defaultFrom = 'KamiKoto <noreply@kamikoto.nsl>';
    const emailPayload = {
      from: body.from || defaultFrom,
      to: Array.isArray(body.to) ? body.to : [body.to], // Ensure to is an array
      subject: body.subject,
      html: body.html,
      // Add other optional fields if provided
      ...(body.cc && { cc: Array.isArray(body.cc) ? body.cc : [body.cc] }),
      ...(body.bcc && { bcc: Array.isArray(body.bcc) ? body.bcc : [body.bcc] }),
      ...(body.reply_to && { reply_to: body.reply_to })
    };
    
    console.log('[Email Function] Prepared email payload:');
    console.log('- From:', emailPayload.from);
    console.log('- To:', emailPayload.to);
    console.log('- Subject:', emailPayload.subject);
    console.log('- HTML length:', emailPayload.html.length);
    console.log('- Has CC:', !!emailPayload.cc);
    console.log('- Has BCC:', !!emailPayload.bcc);
    console.log('- Has Reply-To:', !!emailPayload.reply_to);
    
    // Call Resend API with detailed logging
    console.log('[Email Function] Calling Resend API...');
    const resendStartTime = Date.now();
    
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'KamiKoto-Shop/1.0.0'
      },
      body: JSON.stringify(emailPayload)
    });
    
    const resendDuration = Date.now() - resendStartTime;
    console.log(`[Email Function] Resend API response received in ${resendDuration}ms`);
    console.log(`[Email Function] Resend response status: ${resendResponse.status}`);
    console.log(`[Email Function] Resend response headers:`, Object.fromEntries(resendResponse.headers.entries()));
    
    // Parse Resend API response
    let data;
    try {
      const responseText = await resendResponse.text();
      console.log(`[Email Function] Resend response body length: ${responseText.length}`);
      data = JSON.parse(responseText);
      console.log('[Email Function] Resend response data:', data);
    } catch (parseError) {
      console.error('[Email Function] Failed to parse Resend response:', parseError);
      return new Response(JSON.stringify({ 
        error: { 
          message: 'Failed to parse response from email service', 
          code: 'RESPONSE_PARSE_ERROR'
        } 
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
    
    const totalDuration = Date.now() - startTime;
    console.log(`[Email Function] Total request duration: ${totalDuration}ms`);
    
    // Log success or failure
    if (resendResponse.ok) {
      console.log(`[Email Function] ✅ Email sent successfully! ID: ${data.id}`);
    } else {
      console.error(`[Email Function] ❌ Email sending failed:`, data);
    }
    
    // Return response with CORS headers and additional metadata
    return new Response(JSON.stringify({
      ...data,
      // Add debugging metadata in development
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          duration: totalDuration,
          resendDuration: resendDuration,
          timestamp: new Date().toISOString()
        }
      })
    }), {
      status: resendResponse.status,
      headers: getCORSHeaders()
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`[Email Function] ❌ Unexpected error after ${totalDuration}ms:`, error);
    console.error('[Email Function] Error stack:', error.stack);
    
    // Handle errors with detailed information
    return new Response(JSON.stringify({ 
      error: { 
        message: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          duration: totalDuration
        })
      } 
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
  console.log('[Email Function] Sending CORS preflight response');
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}

/**
 * Get CORS headers for responses
 * Enhanced with more permissive settings for development
 * @returns {Object} - Headers object with CORS settings
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',  // In production, replace with your domain
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };
} 