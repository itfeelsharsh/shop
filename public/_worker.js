/**
 * Cloudflare Worker script for handling social media crawlers
 * This worker detects bots and provides pre-rendered content for proper embeds
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Main request handler that detects bots and serves appropriate content
 * @param {Request} request - The incoming request
 * @returns {Response} - The response to be sent
 */
async function handleRequest(request) {
  // Get the user agent from the request
  const userAgent = request.headers.get('User-Agent') || '';
  const url = new URL(request.url);
  
  // Check if it's a social media crawler or bot
  const isSocialBot = detectBot(userAgent);
  
  // If it's a product page and a social bot, handle specially
  if (url.pathname.startsWith('/product/') && isSocialBot) {
    // Get the product ID from the URL
    const productId = url.pathname.split('/').pop();
    
    // For bots, we'll fetch the actual HTML and modify the meta tags directly
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
  
  // For all other requests, pass through to the original response
  return fetch(request);
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