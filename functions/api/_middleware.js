/**
 * Cloudflare Pages Middleware to enforce Firebase App Check on API routes.
 * Intercepts all non-OPTIONS requests to /api/* and verifies the X-Firebase-AppCheck header.
 */

let cachedJwks = null;
let cachedJwksExpiry = 0;

/**
 * Fetch and cache Firebase App Check public keys (JWKS)
 */
async function getJwk(kid) {
  const now = Date.now();
  if (!cachedJwks || now > cachedJwksExpiry) {
    console.log('[App Check Middleware] Fetching public keys from Firebase...');
    const response = await fetch('https://firebaseappcheck.googleapis.com/v1/jwks');
    if (response.ok) {
      const data = await response.json();
      cachedJwks = data.keys;
      // Cache public keys for 6 hours
      cachedJwksExpiry = now + 6 * 60 * 60 * 1000;
    } else {
      console.error('[App Check Middleware] Failed to fetch JWKS from Firebase');
    }
  }

  if (cachedJwks) {
    return cachedJwks.find(key => key.kid === kid);
  }
  return null;
}

/**
 * Verifies the App Check token JWT using Web Crypto APIs
 */
async function verifyAppCheckToken(token, projectId, projectNumber) {
  if (!token) return { isValid: false, reason: 'Missing token' };

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, reason: 'Invalid JWT format' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode header
    const headerStr = atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'));
    const header = JSON.parse(headerStr);

    if (header.alg !== 'RS256') {
      return { isValid: false, reason: `Unsupported algorithm: ${header.alg}` };
    }

    const kid = header.kid;
    if (!kid) {
      return { isValid: false, reason: 'Missing kid in header' };
    }

    // Decode payload
    const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);

    // Verify expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { isValid: false, reason: 'Token expired' };
    }

    // Verify issuer & audience (supporting both string and array formats)
    const expectedIss = `https://firebaseappcheck.googleapis.com/${projectNumber}`;
    const expectedAud = `projects/${projectNumber}`;

    const issArray = Array.isArray(payload.iss) ? payload.iss : [payload.iss];
    if (!issArray.includes(expectedIss) && !issArray.includes(`https://firebaseappcheck.googleapis.com/${projectId}`)) {
      return { isValid: false, reason: `Issuer mismatch. Expected: ${expectedIss}, Got: ${payload.iss}` };
    }

    const audArray = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audArray.includes(expectedAud) && !audArray.includes(`projects/${projectId}`)) {
      return { isValid: false, reason: `Audience mismatch. Expected: ${expectedAud}, Got: ${payload.aud}` };
    }

    // Get public key
    const jwk = await getJwk(kid);
    if (!jwk) {
      return { isValid: false, reason: `Public key not found for kid: ${kid}` };
    }

    // Import public key to Web Crypto format
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode signature
    const signatureStr = atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/'));
    const signatureBin = new Uint8Array(signatureStr.length);
    for (let i = 0; i < signatureStr.length; i++) {
      signatureBin[i] = signatureStr.charCodeAt(i);
    }

    // Reconstruct token structure to verify
    const dataStr = `${headerB64}.${payloadB64}`;
    const encoder = new TextEncoder();
    const dataBin = encoder.encode(dataStr);

    const isSignatureValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signatureBin,
      dataBin
    );

    if (!isSignatureValid) {
      return { isValid: false, reason: 'Signature verification failed' };
    }

    return { isValid: true, payload };
  } catch (error) {
    return { isValid: false, reason: `Error during token validation: ${error.message}` };
  }
}

/**
 * Main Middleware Hook
 */
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // Handle CORS preflight requests cleanly
  if (request.method === 'OPTIONS') {
    return next();
  }

  // Retrieve project configuration (defaulting to known project config if env keys are not present)
  const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID || 'kamikoto-shop';
  const projectNumber = env.FIREBASE_PROJECT_NUMBER || '90397336474';

  const token = request.headers.get('X-Firebase-AppCheck');
  
  // Detect local development
  const isDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || env.NODE_ENV === 'development';
  const disableAppCheck = env.DISABLE_APP_CHECK === 'true' || env.DISABLE_APP_CHECK === true;

  const { isValid, reason } = await verifyAppCheckToken(token, projectId, projectNumber);

  if (!isValid) {
    console.warn(`[App Check Middleware] Validation failed: ${reason}`);
    
    if (isDev || disableAppCheck) {
      console.warn('[App Check Middleware] App Check verification bypassed (isDev or DISABLE_APP_CHECK enabled).');
      return next();
    }

    return new Response(
      JSON.stringify({
        error: {
          message: 'Unauthorized: Firebase App Check token is missing or invalid.',
          code: 'UNAUTHORIZED_APP_CHECK',
          reason
        }
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  console.log('[App Check Middleware] ✅ App Check verification successful.');
  return next();
}
