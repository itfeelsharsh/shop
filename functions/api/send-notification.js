/**
 * Cloudflare Function to handle sending push notifications via Firebase Cloud Messaging (FCM)
 * 
 * This acts as a server-side proxy to securely send notifications using the 
 * Firebase Service Account key, which should NOT be exposed on the client side.
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} env - Environment variables 
 * @returns {Response} - JSON response with the result of the notification operation
 */
export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCORSHeaders()
    });
  }
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
      status: 405,
      headers: getCORSHeaders()
    });
  }

  try {
    const body = await request.json();
    const { tokens, notification, data } = body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return new Response(JSON.stringify({ error: { message: 'No tokens provided' } }), {
        status: 400,
        headers: getCORSHeaders()
      });
    }

    if (!notification || !notification.title || !notification.body) {
      return new Response(JSON.stringify({ error: { message: 'Notification title and body are required' } }), {
        status: 400,
        headers: getCORSHeaders()
      });
    }

    // Get Firebase Service Account Key from env
    const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ error: { message: 'Server configuration error: Missing Service Account Key' } }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const accessToken = await getGoogleAuthToken(serviceAccount);

    const projectId = serviceAccount.project_id;
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    // FCM v1 sends one message per token. Process unique tokens with a small
    // concurrency window so campaigns are not silently capped at 100 devices.
    const siteUrl = (env.SITE_URL || 'https://kamikoto.click').replace(/\/$/, '');
    const resolveUrl = (value, fallback = '/') => {
      const raw = String(value || fallback || '/').trim();
      if (/^https?:\/\//i.test(raw)) return raw;
      return `${siteUrl}${raw.startsWith('/') ? raw : `/${raw}`}`;
    };

    const clickUrl = resolveUrl(data?.link, '/');
    const iconUrl = resolveUrl(notification.icon || '/logo192.png', '/logo192.png');
    const stringData = Object.fromEntries(
      Object.entries(data || {}).map(([key, value]) => [key, String(value ?? '')])
    );

    const uniqueTokens = [...new Set(
      tokens
        .filter((token) => typeof token === 'string')
        .map((token) => token.trim())
        .filter((token) => token.length >= 20)
    )];

    if (uniqueTokens.length === 0) {
      return new Response(JSON.stringify({ error: { message: 'No valid FCM tokens provided' } }), {
        status: 400,
        headers: getCORSHeaders()
      });
    }

    const maxTokens = 1000;
    const tokensToSend = uniqueTokens.slice(0, maxTokens);
    const truncated = uniqueTokens.length > maxTokens;

    const messages = tokensToSend.map((token) => ({
      message: {
        token,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: stringData,
        android: {
          priority: 'high',
          notification: {
            click_action: clickUrl
          }
        },
        webpush: {
          headers: {
            Urgency: 'high'
          },
          notification: {
            icon: iconUrl
          },
          fcm_options: {
            link: clickUrl
          }
        }
      }
    }));

    const results = [];
    const concurrency = 20;

    for (let index = 0; index < messages.length; index += concurrency) {
      const batch = messages.slice(index, index + concurrency);
      const batchResults = await Promise.all(
        batch.map(async ({ message }, batchIndex) => {
          const absoluteIndex = index + batchIndex;
          const token = tokensToSend[absoluteIndex];

          try {
            const response = await fetch(fcmUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ message })
            });

            const result = await response.json().catch(() => ({}));
            return {
              token: token.substring(0, 10) + '...',
              success: response.ok,
              status: response.status,
              error: response.ok ? null : result?.error?.message || result?.error || 'FCM rejected the message'
            };
          } catch (sendError) {
            return {
              token: token.substring(0, 10) + '...',
              success: false,
              status: 0,
              error: sendError.message
            };
          }
        })
      );
      results.push(...batchResults);
    }

    const successCount = results.filter((entry) => entry.success).length;
    const failures = results.filter((entry) => !entry.success);

    if (successCount === 0) {
      return new Response(JSON.stringify({
        error: {
          message: `FCM rejected all ${results.length} notification(s).`,
          details: failures.slice(0, 5)
        },
        success: false,
        count: 0,
        attempted: results.length,
        failures: failures.length
      }), {
        status: 502,
        headers: getCORSHeaders()
      });
    }

    return new Response(JSON.stringify({
      success: true,
      count: successCount,
      attempted: results.length,
      failures: failures.length,
      truncated,
      details: failures.slice(0, 5)
    }), {
      status: 200,
      headers: getCORSHeaders()
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

/**
 * Generates a Google OAuth2 access token for FCM
 * Note: In a real Cloudflare Worker, you'd use a library or the crypto API to sign a JWT.
 * This is a simplified version using a helper logic.
 */
async function getGoogleAuthToken(serviceAccount) {
  const { client_email, private_key } = serviceAccount;
  
  // JWT Header
  const header = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  
  // JWT Claim Set
  const now = Math.floor(Date.now() / 1000);
  const claimSet = b64(JSON.stringify({
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }));
  
  // Sign JWT
  const signature = await sign(header + '.' + claimSet, private_key);
  const jwt = header + '.' + claimSet + '.' + signature;
  
  // Exchange JWT for access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  const data = await response.json();
  if (data.error) throw new Error(`OAuth error: ${data.error_description || data.error}`);
  return data.access_token;
}

// Helper: Base64 URL Encode
function b64(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper: Sign JWT using RS256
async function sign(data, privateKey) {
  // Convert PEM to ArrayBuffer
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

function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
    'Content-Type': 'application/json'
  };
}
