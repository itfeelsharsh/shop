/**
 * Cloudflare Pages Function specifically for product pages
 * This handles both normal users and social media bots
 */
export async function onRequest(context) {
  const { request, params } = context;
  const productId = params.id;
  
  // Get the user agent
  const userAgent = request.headers.get('User-Agent') || '';
  
  // Check if it's a social media bot
  const isSocialBot = detectBot(userAgent);
  
  if (isSocialBot) {
    // For bots, we'll fetch the actual HTML and modify it
    const response = await fetch(request);
    const originalHtml = await response.text();
    
    // Inject CSS to force display content immediately for bots
    const modifiedHtml = originalHtml
      .replace('</head>', 
        `<style>
          /* Force-display content for bots */
          .loading-screen { display: none !important; }
          * { animation: none !important; transition: none !important; }
          #root { display: block !important; opacity: 1 !important; }
        </style>
        <meta name="product-id" content="${productId}">
        </head>`
      );
      
    // Return the modified HTML with the appropriate cache headers
    return new Response(modifiedHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300',
        'X-Bot-Friendly': 'true'
      }
    });
  }
  
  // For regular users, just pass through
  return context.next();
}

/**
 * Detects if a user agent is a social media crawler or bot
 * @param {string} userAgent - The user agent string to check
 * @returns {boolean} - True if it's a social media bot, false otherwise
 */
function detectBot(userAgent) {
  const botPatterns = [
    'facebookexternalhit',
    'discordbot',
    'twitterbot',
    'linkedinbot',
    'pinterest',
    'slackbot',
    'telegrambot',
    'whatsapp',
    'bot',
    'spider',
    'crawl'
  ];
  
  userAgent = userAgent.toLowerCase();
  return botPatterns.some(pattern => userAgent.includes(pattern));
} 