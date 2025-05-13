/**
 * Cloudflare Pages Function for handling social media crawlers
 * This function detects bots and modifies the response for proper embeds
 * 
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @param {Object} ctx - Context object
 * @returns {Response} - The response to be sent
 */
export async function onRequest(context) {
  const { request } = context;
  
  // Get the user agent from the request
  const userAgent = request.headers.get('User-Agent') || '';
  const url = new URL(request.url);
  
  // If it's not a product page, just pass through
  if (!url.pathname.startsWith('/product/')) {
    return context.next();
  }
  
  // Check if it's a social media crawler or bot
  const isSocialBot = detectBot(userAgent);
  
  // If it's a product page and a social bot, handle specially
  if (isSocialBot) {
    // Get the product ID from the URL
    const productId = url.pathname.split('/').pop();
    
    // For bots, we'll fetch the actual HTML and modify it
    const response = await fetch(request);
    const originalHtml = await response.text();
    
    // For social media bots, we need to make sure they can see the content immediately
    // by injecting custom CSS to show content without animations or loading screens
    const modifiedHtml = originalHtml
      .replace('</head>', 
        `<style>
          /* Force-display content for bots */
          .loading-screen { display: none !important; }
          * { animation: none !important; transition: none !important; }
          #root { display: block !important; opacity: 1 !important; }
        </style>
        </head>`
      )
      // Set the prerender flag for Cloudflare Pages
      .replace('<html', '<html data-prerendered="true"');
      
    // Return the modified HTML with the appropriate content type
    return new Response(modifiedHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300',
        'X-Prerender-Status': 'success'
      }
    });
  }
  
  // For all other requests, pass through
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