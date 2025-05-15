/**
 * Bot Detection and Optimization Script
 * 
 * This script detects social media crawlers and other bots,
 * and optimizes the page for better rendering when crawled.
 */

/**
 * Detects if the current visitor is a social media crawler/bot
 * Modifies page behavior for optimal social media preview generation
 * 
 * @returns {boolean} True if visitor is a bot, false otherwise
 */
function detectBot() {
  const botPatterns = [
    'googlebot', 'bingbot', 'yandex', 'baiduspider', 'twitterbot',
    'facebookexternalhit', 'linkedinbot', 'discordbot', 'slackbot',
    'telegrambot', 'whatsapp', 'line-podcast', 'skype', 'pinterest',
    'bot', 'spider', 'crawl'
  ];
  
  const userAgent = navigator.userAgent.toLowerCase();
  for (const pattern of botPatterns) {
    if (userAgent.indexOf(pattern) !== -1) return true;
  }
  
  return false;
}

/**
 * Sets up the page for optimal bot crawling
 * Disables animations and transitions for bots
 * Ensures critical content is immediately visible
 */
function setupForBots() {
  // Create a style element to inject bot-specific CSS
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    /* Disable animations and transitions for bots */
    * {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
    }
    
    /* Hide loading screens for bots */
    .loading-screen { 
      display: none !important;
    }
    
    /* Ensure content is visible immediately */
    #root {
      display: block !important;
      opacity: 1 !important;
    }
  `;
  
  // Add the styles to the head
  document.head.appendChild(style);
  
  // Mark page as ready for prerendering immediately
  window.prerenderReady = true;
}

// Execute bot detection and setup
if (detectBot()) {
  setupForBots();
} 