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
 * Fetches product data from Firestore using REST API
 */
async function fetchProductData(productId, env) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      console.error('[SEO Middleware] Missing Firebase configuration');
      return null;
    }

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${productId}`;

    const response = await fetch(`${firestoreUrl}?key=${apiKey}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();

    return {
      id: productId,
      name: data.fields?.name?.stringValue || '',
      description: data.fields?.description?.stringValue || '',
      price: Number(data.fields?.price?.integerValue || data.fields?.price?.doubleValue || 0),
      mrp: Number(data.fields?.mrp?.integerValue || data.fields?.mrp?.doubleValue || 0),
      image: data.fields?.image?.stringValue || '',
      brand: data.fields?.brand?.stringValue || 'KamiKoto',
      type: data.fields?.type?.stringValue || 'Stationery',
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

    const firestoreQueryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
    
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

    const response = await fetch(firestoreQueryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });

    if (!response.ok) return { average: 0, total: 0 };

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
  
  const title = `${product.name} | KamiKoto - Premium Stationery`;
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

  // Only run for product detail pages
  const productMatch = url.pathname.match(/^\/product\/([^\/]+)$/);

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
