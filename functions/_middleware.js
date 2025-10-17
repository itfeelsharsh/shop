/**
 * Cloudflare Pages Middleware for Dynamic Meta Tags
 *
 * This middleware intercepts requests to product pages and injects dynamic meta tags
 * for social media crawlers (Discord, Twitter, Facebook, WhatsApp, etc.)
 *
 * How it works:
 * 1. Detects if the request is from a bot/crawler
 * 2. If it's a product page request from a crawler, fetches product data from Firestore
 * 3. Injects the proper Open Graph and Twitter Card meta tags into the HTML
 * 4. Returns the modified HTML to the crawler
 * 5. Regular users get the normal React app with client-side rendering
 */

/**
 * Detects if the user agent is a bot or social media crawler
 * @param {string} userAgent - The User-Agent header value
 * @returns {boolean} True if the request is from a bot
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
    'vkshare', 'w3c_validator', 'redditbot',
    'applebot', 'rogerbot', 'semrushbot',
    'dotbot', 'ahrefsbot', 'screaming frog',
    'mediapartners-google', 'adsbot-google'
  ];

  const ua = userAgent.toLowerCase();
  return botPatterns.some(pattern => ua.includes(pattern));
}

/**
 * Fetches product data from Firestore using REST API
 * @param {string} productId - The product ID to fetch
 * @param {Object} env - Environment variables
 * @returns {Promise<Object|null>} Product data or null if not found
 */
async function fetchProductData(productId, env) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      console.error('[Meta Middleware] Missing Firebase configuration');
      return null;
    }

    // Use Firestore REST API to fetch product
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${productId}`;

    console.log(`[Meta Middleware] Fetching product ${productId} from Firestore...`);

    const response = await fetch(`${firestoreUrl}?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[Meta Middleware] Firestore API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Transform Firestore document format to a simple object
    const product = {
      id: productId,
      name: data.fields?.name?.stringValue || '',
      description: data.fields?.description?.stringValue || '',
      price: data.fields?.price?.integerValue || data.fields?.price?.doubleValue || 0,
      mrp: data.fields?.mrp?.integerValue || data.fields?.mrp?.doubleValue || 0,
      image: data.fields?.image?.stringValue || '',
      brand: data.fields?.brand?.stringValue || '',
      type: data.fields?.type?.stringValue || '',
      stock: data.fields?.stock?.integerValue || 0,
    };

    console.log(`[Meta Middleware] Product fetched successfully:`, product.name);
    return product;
  } catch (error) {
    console.error('[Meta Middleware] Error fetching product:', error);
    return null;
  }
}

/**
 * Formats price with Indian currency format
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
  const priceStr = price.toString();
  const [integerPart, decimalPart] = priceStr.split('.');

  const lastThreeDigits = integerPart.slice(-3);
  const otherDigits = integerPart.slice(0, -3);
  const formattedInteger = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherDigits ? "," : "") + lastThreeDigits;

  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Generates meta tags HTML for a product
 * @param {Object} product - Product data
 * @param {string} url - Current page URL
 * @returns {string} HTML meta tags
 */
function generateMetaTags(product, url) {
  const metaDescription = product.description
    ? product.description.substring(0, 155) + (product.description.length > 155 ? '...' : '')
    : `Buy ${product.name} online at KamiKoto`;

  const title = `${product.name} | KamiKoto - Premium Stationery`;
  const priceFormatted = formatPrice(product.price);
  const ogTitle = `${product.name} - ₹${priceFormatted}`;

  return `
    <!-- Basic Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${metaDescription}">

    <!-- OpenGraph Tags for Facebook/Instagram/WhatsApp/Discord -->
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:image" content="${product.image}">
    <meta property="og:image:secure_url" content="${product.image}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${product.name}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="product">
    <meta property="og:site_name" content="KamiKoto - Premium Stationery">
    <meta property="og:locale" content="en_IN">
    <meta property="og:price:amount" content="${product.price}">
    <meta property="og:price:currency" content="INR">
    ${product.stock > 0 ? '<meta property="product:availability" content="in stock">' : ''}
    ${product.brand ? `<meta property="product:brand" content="${product.brand}">` : ''}

    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@KamiKoto">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${metaDescription}">
    <meta name="twitter:image" content="${product.image}">
    <meta name="twitter:image:alt" content="${product.name}">
    <meta name="twitter:label1" content="Price">
    <meta name="twitter:data1" content="₹${priceFormatted}">
    <meta name="twitter:label2" content="Availability">
    <meta name="twitter:data2" content="${product.stock > 0 ? 'In Stock' : 'Out of Stock'}">

    <!-- WhatsApp Specific Meta Tags -->
    <meta property="og:rich_attachment" content="true">

    <!-- Discord Embed Enhancement -->
    <meta name="theme-color" content="#3B82F6">

    <!-- Additional Meta Tags -->
    <meta name="keywords" content="${product.name}, ${product.brand || ''}, ${product.type || ''}, stationery, online shopping">
    <link rel="canonical" href="${url}">
  `;
}

/**
 * Main middleware function
 * @param {Object} context - Cloudflare Pages context
 * @returns {Promise<Response>} Modified or original response
 */
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';

  // Check if this is a product page request
  const productPageMatch = url.pathname.match(/^\/product\/([^\/]+)$/);

  if (productPageMatch && isBot(userAgent)) {
    const productId = productPageMatch[1];

    console.log(`[Meta Middleware] Bot detected: ${userAgent}`);
    console.log(`[Meta Middleware] Fetching product page: ${productId}`);

    // Fetch product data
    const product = await fetchProductData(productId, env);

    if (product) {
      // Fetch the base HTML file
      const response = await next();
      let html = await response.text();

      // Generate meta tags
      const metaTags = generateMetaTags(product, request.url);

      // Remove default meta tags that have data-react-helmet="true"
      html = html.replace(/<meta[^>]+data-react-helmet="true"[^>]*>/gi, '');

      // Remove default title
      html = html.replace(/<title>.*?<\/title>/i, '');

      // Inject new meta tags in the <head>
      html = html.replace('</head>', `${metaTags}\n</head>`);

      console.log(`[Meta Middleware] Meta tags injected for product: ${product.name}`);

      // Return modified HTML
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } else {
      console.log(`[Meta Middleware] Product ${productId} not found, serving default HTML`);
    }
  }

  // For non-bot requests or non-product pages, continue normally
  return next();
}
