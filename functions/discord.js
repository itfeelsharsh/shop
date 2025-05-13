/**
 * Cloudflare Pages Function specifically optimized for Discord embeds
 * This is a simplified handler to avoid any 401 errors
 */
export async function onRequest(context) {
  const { request } = context;
  
  // Get the user agent from the request
  const userAgent = request.headers.get('User-Agent') || '';
  
  // Only process if this is the Discord bot
  if (userAgent.toLowerCase().includes('discord')) {
    console.log('Discord bot detected, serving optimized content');
    
    try {
      // Create a completely clean request with minimal headers
      const cleanRequest = new Request(request.url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0)'
        }
      });
      
      // Fetch the original page content
      const response = await fetch(cleanRequest);
      
      if (!response.ok) {
        console.error(`Failed to fetch content: ${response.status}`);
        return context.next();
      }
      
      const html = await response.text();
      
      // Return with very permissive headers
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=60',
          'Access-Control-Allow-Origin': '*',
          'X-Frame-Options': 'ALLOWALL',
          'X-Discord-Meta': 'enabled'
        }
      });
    } catch (error) {
      console.error('Discord handler error:', error);
      return context.next();
    }
  }
  
  // Not Discord, pass through
  return context.next();
} 