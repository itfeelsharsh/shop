/**
 * Feature Configuration
 * 
 * This file contains configuration settings for various features in the application.
 * Other developers can modify these settings to enable/disable features as needed.
 */

/**
 * Helper function to get environment variables from multiple possible sources
 * This makes the code work in both development and Cloudflare Pages environments
 * 
 * @param {string} name - Name of the environment variable without prefix
 * @returns {string|undefined} - The value of the environment variable
 */
const getEnvVar = (name) => {
  // Try with REACT_APP_ prefix (for local development)
  const reactValue = process.env[`REACT_APP_${name}`];
  if (reactValue !== undefined) return reactValue;
  
  // Try without prefix (for Cloudflare Pages)
  return process.env[name];
};

const featureConfig = {
  /**
   * Email Configuration
   * 
   * emailEnabled: Set to true to enable all email functionality, false to disable
   * useEmailServer: DEPRECATED - Always uses Resend API now
   * 
   * Note: To enable email functionality, you MUST add a RESEND_API_KEY in your environment variables
   * Format for development: REACT_APP_RESEND_API_KEY=your_api_key_here
   * Format for Cloudflare: RESEND_API_KEY=your_api_key_here
   */
  email: {
    enabled: getEnvVar('EMAIL_ENABLED') === 'true',
    // Always false - we always use Resend API now
    useEmailServer: false,
    fromAddress: getEnvVar('EMAIL_FROM'),
    supportEmail: getEnvVar('SUPPORT_EMAIL'),
  },

  /**
   * Other feature toggles can be added here
   * Examples:
   */
  wishlist: {
    enabled: true,
  },
  userRatings: {
    enabled: true,
  },
  analytics: {
    enabled: true,
  }
};

export default featureConfig; 