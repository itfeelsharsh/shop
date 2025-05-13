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
    console.log(`Bot detected by catch-all: ${userAgent} for URL: ${url.pathname}`);
    
    try {
      // Create a new request without any auth headers that might cause 401 errors
      const cleanRequest = new Request(request.url, {
        method: request.method,
        headers: new Headers({
          'Accept': 'text/html',
          'User-Agent': userAgent,
          // Do not include authorization headers
        }),
        redirect: 'follow'
      });
      
      // Fetch the page without authorization headers
      const response = await fetch(cleanRequest);
      
      // If the response is not ok, we should just pass through instead of trying to modify
      if (!response.ok) {
        console.error(`Error fetching page: ${response.status} ${response.statusText}`);
        return context.next();
      }
      
      const originalHtml = await response.text();
      
      // For Discord and other bots, we need to ensure content is immediately visible
      const modifiedHtml = originalHtml
        .replace('</head>', 
          `<style>
            /* Force-display content for bots */
            .loading-screen { display: none !important; }
            * { animation: none !important; transition: none !important; opacity: 1 !important; }
            #root { display: block !important; opacity: 1 !important; }
            body { visibility: visible !important; }
          </style>
          <meta name="robots" content="index, follow">
          </head>`
        )
        .replace('<html', '<html data-bot="true"');
        
      // Return the modified HTML with public headers
      return new Response(modifiedHtml, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=300',
          'X-Robots-Tag': 'index, follow',
          'Access-Control-Allow-Origin': '*',
          'X-Frame-Options': 'ALLOWALL', // Allow embedding in iframes
          'X-Bot-Friendly': 'true'
        }
      });
    } catch (error) {
      console.error('Error in social-bot handler:', error);
      // If anything fails, fall back to normal page render
      return context.next();
    }
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