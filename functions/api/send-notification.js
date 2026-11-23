/**
 * Cloudflare Function: send push notifications through Firebase Cloud Messaging.
 *
 * The server owns audience discovery. A broadcast request does NOT need to
 * download every user/token in the browser (which is slow and risks Firestore
 * permission/rule-limit failures). We read the audience with the service
 * account, then send with FCM HTTP v1.
 *
 * Request body:
 *   { notification: { title, body, icon? }, data?: { link?, type? }, tokens?: string[] }
 *
 * - Omit tokens for a broadcast; the server finds registered users + guests.
 * - Pass tokens for a single-user notification.
 */

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCORSHeaders() });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
      status: 405,
      headers: getCORSHeaders(),
    });
  }

  try {
    const body = await request.json();
    const { notification, data } = body;
    const providedTokens = Array.isArray(body.tokens) ? body.tokens : null;

    if (!notification || !notification.title || !notification.body) {
      return new Response(
        JSON.stringify({ error: { message: 'Notification title and body are required' } }),
        { status: 400, headers: getCORSHeaders() }
      );
    }

    const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({ error: { message: 'Server configuration error: Missing Service Account Key' } }),
        { status: 500, headers: getCORSHeaders() }
      );
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const projectId = serviceAccount.project_id;

    // Audience: explicit tokens (single user) or server-side lookup (broadcast).
    let audience = null;
    let tokens = providedTokens;

    if (!tokens || tokens.length === 0) {
      audience = await fetchAudienceTokens(serviceAccount);
      tokens = audience.tokens;
    }

    const uniqueTokens = [...new Set(
      (tokens || [])
        .filter((token) => typeof token === 'string')
        .map((token) => token.trim())
        .filter((token) => token.length >= 20)
    )];

    if (uniqueTokens.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          count: 0,
          attempted: 0,
          failures: 0,
          truncated: false,
          message: 'No users to notify',
          audience,
        }),
        { status: 200, headers: getCORSHeaders() }
      );
    }

    const fcmAccessToken = await getGoogleAuthToken(serviceAccount);
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

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

    const maxTokens = 1000;
    const tokensToSend = uniqueTokens.slice(0, maxTokens);
    const truncated = uniqueTokens.length > maxTokens;

    const messages = tokensToSend.map((token) => ({
      message: {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: stringData,
        android: {
          priority: 'high',
          notification: {
            click_action: clickUrl,
          },
        },
        webpush: {
          headers: { Urgency: 'high' },
          notification: {
            title: notification.title,
            body: notification.body,
            icon: iconUrl,
          },
          fcm_options: { link: clickUrl },
        },
      },
    }));

    const results = [];
    const concurrency = 20;

    for (let index = 0; index < messages.length; index += concurrency) {
      const batch = messages.slice(index, index + concurrency);
      const batchResults = await Promise.all(
        batch.map(async ({ message }, batchIndex) => {
          const token = tokensToSend[index + batchIndex];

          try {
            const response = await fetch(fcmUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${fcmAccessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message }),
            });

            const result = await response.json().catch(() => ({}));
            return {
              token: `${token.substring(0, 10)}...`,
              success: response.ok,
              status: response.status,
              error: response.ok
                ? null
                : result?.error?.message || result?.error || 'FCM rejected the message',
            };
          } catch (sendError) {
            return {
              token: `${token.substring(0, 10)}...`,
              success: false,
              status: 0,
              error: sendError.message,
            };
          }
        })
      );
      results.push(...batchResults);
    }

    const successCount = results.filter((entry) => entry.success).length;
    const failures = results.filter((entry) => !entry.success);

    if (successCount === 0) {
      return new Response(
        JSON.stringify({
          error: {
            message: `FCM rejected all ${results.length} notification(s).`,
            details: failures.slice(0, 5),
          },
          success: false,
          count: 0,
          attempted: results.length,
          failures: failures.length,
          audience,
        }),
        { status: 502, headers: getCORSHeaders() }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: successCount,
        attempted: results.length,
        failures: failures.length,
        truncated,
        audience,
        details: failures.slice(0, 5),
      }),
      { status: 200, headers: getCORSHeaders() }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          details: error.details || null,
        },
      }),
      { status: 500, headers: getCORSHeaders() }
    );
  }
}

/**
 * Server-side audience discovery from Firestore.
 * Uses the same service account as FCM, so it is not subject to client rules.
 */
async function fetchAudienceTokens(serviceAccount) {
  const projectId = serviceAccount.project_id;
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  const authToken = await getGoogleAuthToken(
    serviceAccount,
    'https://www.googleapis.com/auth/datastore'
  );

  const tokens = [];
  const errors = [];
  let registeredUsers = 0;
  let guestDevices = 0;

  // Registered users with notifications enabled.
  try {
    const response = await fetch(`${baseUrl}:runQuery`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'users' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'notificationsEnabled' },
              op: 'EQUAL',
              value: { booleanValue: true },
            },
          },
          limit: 1000,
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Firestore users query ${response.status}: ${details.slice(0, 240)}`);
    }

    const rows = await response.json();
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      const fields = row?.document?.fields;
      if (!fields) return;

      const values = fields.fcmTokens?.arrayValue?.values;
      const userTokens = Array.isArray(values)
        ? values.map((entry) => entry?.stringValue).filter(Boolean)
        : [];

      if (userTokens.length > 0) {
        registeredUsers += 1;
        tokens.push(...userTokens);
      }
    });
  } catch (error) {
    errors.push(error.message);
    console.error('[Push Audience] Failed to read registered users:', error.message);
  }

  // Guest devices (unauthenticated visitors who enabled notifications).
  try {
    let pageToken = '';
    let pages = 0;

    do {
      const url = new URL(`${baseUrl}/fcmTokens`);
      url.searchParams.set('pageSize', '300');
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Firestore fcmTokens list ${response.status}: ${details.slice(0, 240)}`);
      }

      const page = await response.json();
      (page.documents || []).forEach((document) => {
        const fields = document?.fields || {};
        if (fields.notificationsEnabled?.booleanValue === false) return;
        const token = fields.token?.stringValue;
        if (token) {
          guestDevices += 1;
          tokens.push(token);
        }
      });

      pageToken = page.nextPageToken || '';
      pages += 1;
    } while (pageToken && pages < 10);
  } catch (error) {
    errors.push(error.message);
    console.error('[Push Audience] Failed to read guest tokens:', error.message);
  }

  if (registeredUsers === 0 && guestDevices === 0 && errors.length === 2) {
    const audienceError = new Error(
      'Could not read the notification audience from Firestore. Check the service account Firestore permissions and deployed rules.'
    );
    audienceError.details = errors;
    throw audienceError;
  }

  return {
    tokens,
    stats: {
      registeredUsers,
      guestDevices,
      totalTokens: tokens.length,
      errors: errors.length ? errors : undefined,
    },
  };
}

/**
 * Generates a Google OAuth2 access token for FCM or Firestore.
 */
async function getGoogleAuthToken(
  serviceAccount,
  scope = 'https://www.googleapis.com/auth/firebase.messaging'
) {
  const { client_email, private_key } = serviceAccount;

  const header = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));

  const now = Math.floor(Date.now() / 1000);
  const claimSet = b64(JSON.stringify({
    iss: client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const signature = await sign(`${header}.${claimSet}`, private_key);
  const jwt = `${header}.${claimSet}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  if (data.error) throw new Error(`OAuth error: ${data.error_description || data.error}`);
  return data.access_token;
}

function b64(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(data, privateKey) {
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = privateKey.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
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
    'Content-Type': 'application/json',
  };
}
