/**
 * Feature Configuration
 * 
 * This file contains configuration settings for various features in the application.
 * Other developers can modify these settings to enable/disable features as needed.
 */

const featureConfig = {
  /**
   * Email Configuration
   * 
   * emailEnabled: Set to true to enable all email functionality, false to disable
   * emailServer: Set to true to use a regular email server, false to use Resend API
   * 
   * Note: To enable email functionality, you MUST add a RESEND_API_KEY in your .env file
   * Format in .env file: REACT_APP_RESEND_API_KEY=your_api_key_here
   */
  email: {
    enabled: process.env.REACT_APP_EMAIL_ENABLED === 'true',
    useEmailServer: process.env.REACT_APP_USE_EMAIL_SERVER === 'false',
    fromAddress: process.env.REACT_APP_EMAIL_FROM,
    supportEmail: process.env.REACT_APP_SUPPORT_EMAIL,
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