/**
 * Cloudflare Pages Function specifically for product pages
 * This handles both normal users and social media bots
 */
export async function onRequest(context) {
  const { request, params, env } = context;
  const productId = params.id;
  
  // Get the user agent
  const userAgent = request.headers.get('User-Agent') || '';
  
  // Check if it's a social media bot
  const isSocialBot = detectBot(userAgent);
  
  if (isSocialBot) {
    console.log(`Bot detected: ${userAgent} accessing product ID: ${productId}`);
    
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
          <meta name="product-id" content="${productId}">
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
      console.error('Error in product bot handler:', error);
      // If anything fails, fall back to normal page render
      return context.next();
    }
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