/**
 * Cloudflare Pages Middleware for World-Class Dynamic Meta Tags & SEO
 * 
 * This middleware intercepts requests to product pages from social media crawlers
 * and search engine bots. it fetches real-time product data and reviews from 
 * Firestore to inject rich metadata, Open Graph tags, and JSON-LD structured data.
 * 
 * Supported Platforms:
 * - Discord (Rich Embeds with Ratings & Price)
 * - WhatsApp (Large Preview Banners)
 * - Twitter/X (Summary Large Image Cards)
 * - Facebook/Instagram (Product Catalogs)
 * - Google (Search Results Rich Snippets)
 */

/**
 * Detects if the user agent is a bot or social media crawler
 */
function isBot(userAgent) {
  if (!userAgent) return false;

  const botPatterns = [
    'bot', 'crawler', 'spider', 'crawling',
    'facebookexternalhit', 'facebookcatalog',
    'twitterbot', 'twitter',
    'linkedinbot', 'linkedin',
    'discordbot', 'discord',
    'slackbot', 'slack',
    'telegrambot', 'telegram',
    'whatsapp', 'whatsappbot',
    'pinterest', 'pinterestbot',
    'skype', 'skypebot',
    'redditbot', 'reddit',
    'googlebot', 'google',
    'bingbot', 'bing',
    'yandexbot', 'yandex',
    'baiduspider', 'baidu',
    'duckduckbot', 'duckduckgo',
    'slurp', 'yahoo',
    'embedly', 'quora', 'outbrain', 'flipboard',
    'tumblr', 'bitly', 'instapaper', 'pocket',
    'developers.google.com/+/web/snippet',
    'vkshare', 'w3c_validator', 'applebot', 'rogerbot', 
    'semrushbot', 'dotbot', 'ahrefsbot', 'screaming frog',
    'mediapartners-google', 'adsbot-google'
  ];

  const ua = userAgent.toLowerCase();
  return botPatterns.some(pattern => ua.includes(pattern));
}

/**
 * Generates a Google OAuth2 access token for Datastore/Firestore
 */
async function getGoogleAuthToken(serviceAccount, scope = 'https://www.googleapis.com/auth/datastore') {
  const { client_email, private_key } = serviceAccount;
  
  // JWT Header
  const header = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  
  // JWT Claim Set
  const now = Math.floor(Date.now() / 1000);
  const claimSet = b64(JSON.stringify({
    iss: client_email,
    scope: scope,
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

/**
 * Fetches product data from Firestore using REST API
 */
async function fetchProductData(productId, env) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY;

    if (!projectId) {
      console.error('[SEO Middleware] Missing Firebase configuration: Project ID');
      return null;
    }

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${productId}`;
    let url = firestoreUrl;
    const headers = { 'Content-Type': 'application/json' };

    if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
        const accessToken = await getGoogleAuthToken(serviceAccount, 'https://www.googleapis.com/auth/datastore');
        headers['Authorization'] = `Bearer ${accessToken}`;
      } catch (authError) {
        console.error('[SEO Middleware] Error generating access token from service account, falling back to API key:', authError);
        url = `${firestoreUrl}?key=${apiKey}`;
      }
    } else {
      url = `${firestoreUrl}?key=${apiKey}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[SEO Middleware] Firestore responded with ${response.status}:`, errText);
      return null;
    }

    const data = await response.json();

    return {
      id: productId,
      name: data.fields?.name?.stringValue || '',
      description: data.fields?.description?.stringValue || '',
      price: Number(data.fields?.price?.integerValue || data.fields?.price?.doubleValue || 0),
      mrp: Number(data.fields?.mrp?.integerValue || data.fields?.mrp?.doubleValue || 0),
      image: data.fields?.image?.stringValue || '',
      brand: data.fields?.brand?.stringValue || 'KamiKoto',
      type: data.fields?.type?.stringValue || 'Premium',
      stock: Number(data.fields?.stock?.integerValue || 0),
    };
  } catch (error) {
    console.error('[SEO Middleware] Error fetching product:', error);
    return null;
  }
}

/**
 * Fetches rating statistics from Firestore reviews collection
 */
async function fetchRatingStats(productId, env) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY;

    if (!projectId) {
      return { average: 0, total: 0 };
    }

    const firestoreQueryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    let url = firestoreQueryUrl;
    const headers = { 'Content-Type': 'application/json' };

    if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
        const accessToken = await getGoogleAuthToken(serviceAccount, 'https://www.googleapis.com/auth/datastore');
        headers['Authorization'] = `Bearer ${accessToken}`;
      } catch (authError) {
        console.error('[SEO Middleware] Error generating access token for ratings, falling back to API key:', authError);
        url = `${firestoreQueryUrl}?key=${apiKey}`;
      }
    } else {
      url = `${firestoreQueryUrl}?key=${apiKey}`;
    }

    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'reviews' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'productId' },
            op: 'EQUAL',
            value: { stringValue: productId }
          }
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(queryBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[SEO Middleware] Firestore query responded with ${response.status}:`, errText);
      return { average: 0, total: 0 };
    }

    const results = await response.json();
    
    // Filter out empty results and transform
    const reviews = results
      .filter(r => r.document)
      .map(r => ({
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
    console.error('[SEO Middleware] Error fetching ratings:', error);
    return { average: 0, total: 0 };
  }
}

/**
 * Formats price for display
 */
function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Generates JSON-LD Structured Data for Product
 */
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

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Generates all meta tags
 */
function generateMetaTags(product, rating, url) {
  const priceFormatted = formatPrice(product.price);
  const mrpFormatted = product.mrp > product.price ? formatPrice(product.mrp) : null;
  const discountPercent = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : null;
  
  const title = `${product.name} | KamiKoto - Premium Shop`;
  const metaDesc = product.description.substring(0, 160) + (product.description.length > 160 ? '...' : '');
  
  // Discord/WhatsApp specific title that includes price and discount
  const embedTitle = `${product.name} - ₹${priceFormatted}${discountPercent ? ` (${discountPercent}% OFF)` : ''}`;

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
    <meta property="product:availability" content="${product.stock > 0 ? 'in stock' : 'out of stock'}">
    <meta property="product:condition" content="new">
    <meta property="product:category" content="${product.type}">
    ${mrpFormatted ? `<meta property="product:price:standard_amount" content="${product.mrp}">` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${embedTitle}">
    <meta name="twitter:description" content="${metaDesc}">
    <meta name="twitter:image" content="${product.image}">
    <meta name="twitter:label1" content="Price">
    <meta name="twitter:data1" content="₹${priceFormatted}${mrpFormatted ? ` (MRP: ₹${mrpFormatted})` : ''}">
    <meta name="twitter:label2" content="Rating">
    <meta name="twitter:data2" content="${rating.total > 0 ? `${rating.average} / 5 (${rating.total} reviews)` : 'No reviews yet'}">

    <!-- Theme & Enhancements -->
    <meta name="theme-color" content="#000000">
    <meta name="apple-mobile-web-app-title" content="KamiKoto">
    <meta property="og:rich_attachment" content="true">
  `;
}

/**
 * Main Middleware Entry
 */
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';

  // Only run for product detail pages (with optional trailing slash)
  const productMatch = url.pathname.match(/^\/product\/([^\/]+)\/?$/);

  if (productMatch && isBot(userAgent)) {
    const productId = productMatch[1];
    
    // Fetch data in parallel for performance
    const [product, rating] = await Promise.all([
      fetchProductData(productId, env),
      fetchRatingStats(productId, env)
    ]);

    if (product) {
      const response = await next();
      let html = await response.text();

      // Clear existing dynamic tags to prevent duplicates
      html = html.replace(/<title>.*?<\/title>/i, '');
      html = html.replace(/<meta[^>]+data-react-helmet="true"[^>]*>/gi, '');
      html = html.replace(/<meta property="og:[^>]+>/gi, '');
      html = html.replace(/<meta name="twitter:[^>]+>/gi, '');
      
      const metaTags = generateMetaTags(product, rating, request.url);
      const jsonLd = generateJsonLd(product, rating, request.url);

      // Inject into head
      html = html.replace('</head>', `${metaTags}\n${jsonLd}\n</head>`);

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  }

  return next();
}
