/**
 * Email Service
 * 
 * This utility provides functions for sending various types of emails to users using Resend API via Cloudflare Functions.
 * It checks the featureConfig to determine if emails should be sent.
 */

import featureConfig from './featureConfig';
// No need for Resend import as we're using server-side functions

/**
 * Get the base URL for the API functions based on the current environment
 * @returns {string} - Base URL for API functions
 */
const getApiFunctionBaseUrl = () => {
  // Check if we're in a development environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development, use a local URL that can be proxied to the real endpoint
    // This should be configured in your package.json proxy field
    return '/api';
  } else {
    // In production, use the same domain as the application
    return '';
  }
};

/**
 * Checks if the email functionality is properly configured and enabled
 * @returns {boolean} - True if email is enabled and properly configured
 */
const isEmailEnabled = () => {
  // Check if email is enabled in the config
  if (!featureConfig.email.enabled) {
    console.log('❌ Email functionality is disabled in configuration');
    console.log('To enable email, set REACT_APP_EMAIL_ENABLED=true in your environment variables');
    return false;
  }

  // Log email configuration for debugging
  console.log('📧 Email Configuration Debug:');
  console.log('- Email enabled:', featureConfig.email.enabled);
  console.log('- Use email server:', featureConfig.email.useEmailServer);
  console.log('- From address:', featureConfig.email.fromAddress || 'Not set');
  console.log('- Support email:', featureConfig.email.supportEmail || 'Not set');
  
  // Check environment variables more thoroughly
  console.log('🔧 Environment Variables:');
  console.log('- REACT_APP_EMAIL_ENABLED:', process.env.REACT_APP_EMAIL_ENABLED);
  console.log('- EMAIL_ENABLED:', process.env.EMAIL_ENABLED);
  console.log('- REACT_APP_EMAIL_FROM:', process.env.REACT_APP_EMAIL_FROM);
  console.log('- EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('- REACT_APP_RESEND_API_KEY exists:', !!process.env.REACT_APP_RESEND_API_KEY);
  console.log('- RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

  return true;
};

/**
 * Sends an email using the server API endpoint
 * @param {Object} emailData - Email data including recipient, subject, body, etc.
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendEmail = async (emailData) => {
  console.log('sendEmail function called with:', {
    to: emailData.to,
    subject: emailData.subject,
    bodyLength: emailData.body?.length || 0
  });

  if (!isEmailEnabled()) {
    console.log('Email functionality is disabled, returning early from sendEmail');
    return { success: false, error: 'Email functionality is disabled or not properly configured' };
  }

  try {
    console.log('Using API endpoint method');
    return await sendViaApiEndpoint(emailData);
  } catch (error) {
    console.error('Error in sendEmail function:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
};

/**
 * Sends an email using our server API endpoint instead of calling Resend directly
 * This avoids CORS issues when calling from the client side
 * 
 * @param {Object} emailData - Email data
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendViaApiEndpoint = async (emailData) => {
  try {
    console.log('Attempting to send email via API endpoint with data:', {
      to: emailData.to,
      subject: emailData.subject,
      fromAddress: emailData.from || featureConfig.email.fromAddress
    });
    
    // Prepare the sender with proper format
    const fromEmail = emailData.from || featureConfig.email.fromAddress;
    // Ensure proper "From" format with name - Resend requires this format
    const formattedFrom = fromEmail.includes('<') ? fromEmail : `KamiKoto <${fromEmail}>`;
    
    // Prepare the email payload for our API
    const emailPayload = {
      from: formattedFrom,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.body,
    };
    
    console.log('Sending email with payload:', emailPayload);
    
    // Use the Cloudflare Function endpoint
    const apiEndpoint = `${getApiFunctionBaseUrl()}/send-email`;
    console.log('Using API endpoint:', apiEndpoint);
    
    // Send the request to our server-side function
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });
    
    // Parse the response
    const result = await response.json();
    console.log('API endpoint response:', result);
    
    if (!response.ok || result.error) {
      console.error('API endpoint returned an error:', result.error);
      throw new Error(result.error?.message || 'Failed to send email via API endpoint');
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Detailed error sending email via API endpoint:', error);
    throw error;
  }
};

/**
 * Email server method is not implemented
 * All emails are sent through Resend API for better reliability and deliverability
 */
// const sendViaEmailServer = async (emailData) => {
//   console.error('Email server method not implemented');
//   return { success: false, error: 'Email server method not implemented' };
// };

/**
 * Sends an order confirmation email to the customer
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendOrderConfirmationEmail = async (order, user) => {
  console.log('sendOrderConfirmationEmail called with:', {
    orderId: order?.orderId,
    userEmail: user?.email
  });
  
  if (!user || !user.email) {
    console.error('Cannot send order confirmation: Missing user email');
    return { success: false, error: 'Missing user email' };
  }
  
  if (!order || !order.orderId) {
    console.error('Cannot send order confirmation: Invalid order data');
    return { success: false, error: 'Invalid order data' };
  }
  
  if (!isEmailEnabled()) {
    console.log('Email functionality is disabled, skipping order confirmation email');
    return { success: false, error: 'Email functionality is disabled' };
  }

  try {
    console.log('Generating email HTML template');
    const emailBody = generateOrderConfirmationHTML(order, user);
    console.log('Email template generated, length:', emailBody.length);
    
    const emailData = {
      to: user.email,
      subject: `KamiKoto - Order Confirmation #${order.orderId}`,
      body: emailBody,
    };
    
    console.log('Calling sendEmail function with email data');
    return await sendEmail(emailData);
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail function:', error);
    return { success: false, error: error.message || 'Failed to send order confirmation email' };
  }
};

/**
 * Sends an order shipment notification email to the customer
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @param {Object} shipmentInfo - Shipping information
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendOrderShippedEmail = async (order, user, shipmentInfo) => {
  if (!user || !user.email) {
    console.error('Cannot send shipping notification: Missing user email');
    return { success: false, error: 'Missing user email' };
  }

  if (!order || !order.orderId) {
    console.error('Cannot send shipping notification: Invalid order data');
    return { success: false, error: 'Invalid order data' };
  }

  if (!shipmentInfo) {
    console.error('Cannot send shipping notification: Missing shipment information');
    return { success: false, error: 'Missing shipment information' };
  }

  if (!isEmailEnabled()) {
    console.log('Email functionality is disabled, skipping shipping notification email');
    return { success: false, error: 'Email functionality is disabled' };
  }

  try {
    const emailBody = generateOrderShippedHTML(order, user, shipmentInfo);
    
    const emailData = {
      to: user.email,
      subject: `Your Order #${order.orderId} Has Shipped`,
      body: emailBody,
    };

    return await sendEmail(emailData);
  } catch (error) {
    console.error('Error sending order shipped email:', error);
    return { success: false, error: error.message || 'Failed to send order shipped email' };
  }
};

/**
 * Generates HTML content for order confirmation emails
 * 
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @returns {string} - HTML content for the email
 */
const generateOrderConfirmationHTML = (order, user) => {
  // Calculate order summary values
  const subtotal = order.subtotal || 0;
  const tax = order.tax || 0;
  const shipping = order.shipping?.cost || 0;
  const discount = order.discount || 0;
  const total = order.totalAmount || 0;
  const importDuty = order.importDuty || 0;
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  /**
   * World-class CSS styling for email clients
   * Optimized for premium appearance across all major email clients
   * Features: Modern gradients, smooth animations, perfect typography, and mobile-responsive design
   */
  const professionalCSS = `
    /* Reset and base styles for better email client compatibility */
    table, td, div, h1, h2, h3, p, a {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    }

    /* World-class animations for modern email clients */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }

    .animated {
      animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .animated-scale {
      animation: scaleIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .animated-slide {
      animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    /* Premium button styling with hover effects */
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
    }

    /* Enhanced card styling with depth */
    .card {
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
      background: #ffffff;
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06);
    }

    /* Professional spacing utilities */
    .spacer-sm { height: 16px; }
    .spacer-md { height: 24px; }
    .spacer-lg { height: 40px; }
    .spacer-xl { height: 60px; }

    /* Premium gradient backgrounds */
    .gradient-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .gradient-success {
      background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
    }

    .gradient-premium {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    /* Glassmorphism effect for modern look */
    .glass-effect {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    /* Subtle border glow effect */
    .border-glow {
      border: 1px solid rgba(102, 126, 234, 0.3);
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.1);
    }

    /* Enhanced typography */
    .text-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Mobile responsive helpers */
    @media only screen and (max-width: 600px) {
      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }
      .mobile-hide {
        display: none !important;
      }
      .mobile-padding {
        padding: 16px !important;
      }
    }
  `;
  
  /**
   * Process image URL to ensure compatibility with email clients
   * Handles i.imgur.com and other image hosting services for better email delivery
   * @param {string} imageUrl - Original image URL
   * @returns {string} - Processed image URL optimized for email clients
   */
  const processImageForEmail = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Handle i.imgur.com URLs - ensure they use direct image links
    if (imageUrl.includes('i.imgur.com')) {
      // Ensure the URL ends with a proper image extension for email clients
      if (!imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return `${imageUrl}.jpg`; // Add .jpg extension for email client compatibility
      }
    }
    
    return imageUrl;
  };

  // Generate premium HTML for order items with world-class design
  // Enhanced with modern aesthetics and better visual hierarchy
  const itemsHTML = order.items.map((item, index) => {
    // Professional product name truncation for consistent layout
    const truncatedName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;

    // Process image URL for email client compatibility
    const processedImageUrl = processImageForEmail(item.image);

    return `
    <!-- Premium Product Item Row with Enhanced Design -->
    <tr style="animation-delay: ${index * 0.1}s;" class="animated">
      <td style="padding: 28px 24px; border-bottom: 2px solid #F1F5F9; background: ${index % 2 === 0 ? '#FFFFFF' : '#FAFBFC'}; transition: all 0.3s ease;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="100" style="vertical-align: top; padding-right: 24px;">
              <div style="position: relative;">
                ${processedImageUrl ?
                  `<img src="${processedImageUrl}" alt="${truncatedName}" style="
                    width: 100px;
                    height: 100px;
                    object-fit: cover;
                    border-radius: 16px;
                    background-color: #F8FAFC;
                    border: 2px solid #E2E8F0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    display: block;
                  " />` :
                  `<div style="
                    width: 100px;
                    height: 100px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
                    border: 2px solid #E2E8F0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748B;
                    font-size: 12px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                  ">📦 No Image</div>`
                }
                <div style="position: absolute; top: -8px; right: -8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);">
                  ${item.quantity}
                </div>
              </div>
            </td>
            <td style="vertical-align: middle; padding-right: 16px;">
              <h4 style="margin: 0 0 8px 0; font-weight: 700; font-size: 18px; color: #0f172a; line-height: 1.3; letter-spacing: -0.2px;">${truncatedName}</h4>
              <div style="display: inline-block; padding: 4px 12px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 20px; margin-bottom: 8px;">
                <p style="margin: 0; font-size: 13px; color: #1e40af; font-weight: 700;">Qty: ${item.quantity}</p>
              </div>
              <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: 600;">💰 Unit Price: ${formatCurrency(item.price)}</p>
            </td>
            <td width="140" style="vertical-align: middle; text-align: right;">
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 12px 16px; border-radius: 12px; border: 2px solid #10b981;">
                <p style="margin: 0; font-weight: 800; font-size: 20px; color: #065f46; letter-spacing: -0.3px;">${formatCurrency(item.price * item.quantity)}</p>
                <p style="margin: 6px 0 0 0; font-size: 11px; color: #059669; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Subtotal</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `}).join('');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="x-apple-disable-message-reformatting">
  <link rel="dns-prefetch" href="https://cdn.harshbanker.com">
  <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:ital,wght@0,400;0,400;0,600;0,700;0,800" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Nunito:ital,wght@0,400;0,700" rel="stylesheet">
  <title>Order Confirmation</title>
  <style type="text/css">
    /* Base styles */
    body, table, td {
      font-family: 'Nunito Sans', Arial, Helvetica, sans-serif !important;
    }
    
            /* Professional styling and animation support */
        ${professionalCSS}
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #ffefcf; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; color: #2D3A41; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!-- Email Container -->
  <table style="width: 100%; min-width: 600px; background-color: #ffefcf;" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody>
      <tr>
        <td align="center" valign="top">
          <!-- Main Email Container -->
          <table style="width: 600px; max-width: 600px;" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tbody>
              <!-- Premium Email Header with Enhanced Design -->
              <tr>
                <td style="padding: 48px 40px 40px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative;" bgcolor="#667eea">
                  <!-- Decorative gradient overlay for depth -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="left" style="vertical-align: middle;">
                        <div class="animated-slide">
                          <h1 style="margin: 0; font-size: 38px; font-weight: 800; color: #ffffff; letter-spacing: -1px; text-shadow: 0 4px 12px rgba(0,0,0,0.15);">KamiKoto</h1>
                          <p style="margin: 10px 0 0; font-size: 17px; color: rgba(255, 255, 255, 0.95); font-weight: 600; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">✨ Your Premium Stationery Destination</p>
                        </div>
                      </td>
                      <td align="right" width="90" style="vertical-align: middle;">
                        <div style="width: 70px; height: 70px; background: rgba(255, 255, 255, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                          <img src="https://cdn.harshbanker.com/kamikoto-logo.png" alt="KamiKoto Logo" style="width: 50px; height: auto; border-radius: 10px;">
                        </div>
                      </td>
                    </tr>
                  </table>
                  <!-- Bottom wave decoration -->
                  <div style="position: absolute; bottom: -1px; left: 0; width: 100%; height: 20px; background: #ffffff; border-radius: 20px 20px 0 0;"></div>
                </td>
              </tr>
              
              <!-- Premium Order Confirmation Section with Enhanced Design -->
              <tr>
                <td style="padding: 32px 40px 0px 40px; background-color: #FFFFFF;" bgcolor="#FFFFFF">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" class="card border-glow">
                    <tr>
                      <td style="padding: 48px 40px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%); border-radius: 20px; text-align: center; border: 2px solid #bfdbfe; position: relative; overflow: hidden;" class="animated-scale">
                        <!-- Decorative elements -->
                        <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                        <div style="position: absolute; bottom: -50px; left: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>

                        <!-- Success Icon -->
                        <div style="margin-bottom: 24px;">
                          <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3); position: relative;">
                            <span style="font-size: 48px; line-height: 80px; color: white;">✓</span>
                          </div>
                        </div>

                        <h2 style="margin: 0 0 16px 0; font-size: 36px; font-weight: 800; color: #0f172a; line-height: 1.2; letter-spacing: -1px; position: relative; z-index: 1;">Order Confirmed! 🎉</h2>
                        <p style="margin: 0 0 32px 0; color: #475569; font-size: 19px; line-height: 1.6; font-weight: 500; position: relative; z-index: 1;">Hello <span style="font-weight: 700; color: #1e293b;">${user.displayName || user.email?.split('@')[0] || 'Valued Customer'}</span>, thank you for choosing KamiKoto!</p>

                        <div style="margin-bottom: 28px; position: relative; z-index: 1;">
                            <div style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 60px; margin-bottom: 16px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);">
                              <p style="margin: 0; font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">Order #${order.orderId}</p>
                            </div>
                            <p style="margin: 0; font-size: 15px; color: #64748b; font-weight: 600;">📅 ${new Date(order.orderDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>

                        <div style="background: rgba(255, 255, 255, 0.7); border-radius: 12px; padding: 20px; display: inline-block; backdrop-filter: blur(10px); position: relative; z-index: 1;">
                          <p style="margin: 0; color: #1e293b; font-size: 16px; line-height: 1.7; font-weight: 500;">
                            🚀 We're processing your order right now!<br/>
                            <span style="color: #64748b; font-size: 15px;">You'll receive tracking information once it ships.</span>
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Premium Order Items Table with World-Class Design -->
              <tr>
                <td style="padding: 40px 40px 0px 40px; background-color: #ffffff;" bgcolor="#ffffff">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border: 2px solid #e2e8f0; border-radius: 20px; margin-bottom: 40px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);" class="card border-glow">
                    <!-- Premium Table Header -->
                    <tr>
                      <td style="padding: 28px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-bottom: 3px solid #5a67d8;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td>
                              <h3 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🛍️ Your Order Items</h3>
                              <p style="margin: 6px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">Everything you ordered at a glance</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Premium Order Items -->
                    ${itemsHTML}
                    
                    <!-- Order Summary - Matching new summary design -->
                    <tr>
                      <td colspan="2" style="padding: 20px; border-bottom: 1px solid #d1dfe3;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="padding-bottom: 10px;">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="font-size: 15px; color: #64748B;">Subtotal</td>
                                  <td style="font-size: 15px; color: #1A202C; text-align: right;">${formatCurrency(subtotal)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 10px;">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="font-size: 15px; color: #64748B;">Tax (18% GST)</td>
                                  <td style="font-size: 15px; color: #1A202C; text-align: right;">${formatCurrency(tax)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: ${importDuty > 0 || discount > 0 ? '10px' : '0'};">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="font-size: 15px; color: #64748B;">Shipping</td>
                                  <td style="font-size: 15px; color: #1A202C; text-align: right;">${shipping === 0 ? 'Free' : formatCurrency(shipping)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          ${importDuty > 0 ? `
                          <tr>
                            <td style="padding-bottom: ${discount > 0 ? '10px' : '0'};">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="font-size: 15px; color: #EA580C;">Import Duty (69%)</td>
                                  <td style="font-size: 15px; color: #EA580C; text-align: right;">${formatCurrency(importDuty)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          ` : ''}
                          ${discount > 0 ? `
                          <tr>
                            <td style="padding-bottom: 0;">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="font-size: 15px; color: #16A34A;">Discount</td>
                                  <td style="font-size: 15px; color: #16A34A; text-align: right;">-${formatCurrency(discount)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          ` : ''}
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px; font-size: 16px; font-weight: bold; color: #121212;">Total (${order.items.length} ${order.items.length === 1 ? 'item' : 'items'})</td>
                      <td style="padding: 20px; font-size: 20px; font-weight: 800; color: #121212; text-align: right;">${formatCurrency(total)}</td>
                    </tr>
                  </table>
                  
                  <!-- Shipping and Payment Info - Matching new summary design -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;">
                    <tr>
                      <td width="50%" valign="top" style="padding-right: 15px;">
                        <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #121212;">Shipping address</h3>
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: rgba(18, 18, 18, 0.8);">
                          ${order.shippingAddress?.name || order.userName || 'Customer'}<br>
                          ${order.shippingAddress?.street || ''}<br>
                          ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zip || ''}<br>
                          ${order.shippingAddress?.country || ''}
                        </p>
                      </td>
                      <td width="50%" valign="top">
                        <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #121212;">Paid with ${order.payment?.method || 'Credit card'}</h3>
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: rgba(18, 18, 18, 0.8);">Subtotal: ${formatCurrency(subtotal)}</p>
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: rgba(18, 18, 18, 0.8);">Tax (18% GST): ${formatCurrency(tax)}</p>
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: rgba(18, 18, 18, 0.8);">Shipping: ${shipping === 0 ? 'Free' : formatCurrency(shipping)}</p>
                        ${importDuty > 0 ? `
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #EA580C;">Import Duty (69%): ${formatCurrency(importDuty)}</p>
                        ` : ''}
                        ${discount > 0 ? `
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #16A34A;">Discount: -${formatCurrency(discount)}</p>
                        ` : ''}
                        <p style="margin: 8px 0 2px; font-size: 16px; font-weight: 700; color: #121212;">Total: ${formatCurrency(total)}</p>
                        <p style="margin: 8px 0 2px; font-size: 14px; font-weight: 600; color: #10B981;">Payment Status: Completed</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Premium Help Section with Enhanced Design -->
              <tr>
                <td style="padding: 48px 40px 56px 40px; background-color: #ffffff;" bgcolor="#ffffff">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="padding: 32px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%); border-radius: 16px; border: 2px solid #fbbf24; box-shadow: 0 4px 20px rgba(251, 191, 36, 0.2);" class="animated">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td width="80" valign="top" style="text-align: center;">
                              <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); border-radius: 50%; box-shadow: 0 6px 16px rgba(249, 115, 22, 0.3); line-height: 72px;">
                                <span style="font-size: 36px;">💬</span>
                              </div>
                            </td>
                            <td style="padding-left: 20px; vertical-align: middle;">
                              <h3 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #78350f; letter-spacing: -0.3px;">Need Help? We're Here!</h3>
                              <p style="margin: 0; font-size: 16px; color: #92400e; line-height: 1.6; font-weight: 500;">
                                Have questions or need assistance? Our friendly team is ready to help!<br/>
                                <span style="font-size: 15px;">✉️ Email us at </span><a href="mailto:${featureConfig.email.supportEmail}" style="color: #c2410c; font-weight: 700; text-decoration: none; border-bottom: 2px solid #c2410c;">${featureConfig.email.supportEmail}</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- World-Class Premium Footer -->
              <tr>
                <td style="padding: 56px 40px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); text-align: center; position: relative; overflow: hidden;">
                  <!-- Decorative background elements -->
                  <div style="position: absolute; top: -100px; left: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%); border-radius: 50%;"></div>
                  <div style="position: absolute; bottom: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%); border-radius: 50%;"></div>

                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="position: relative; z-index: 1;">
                    <!-- Logo and Brand -->
                    <tr>
                      <td style="text-align: center; padding-bottom: 28px;">
                        <div style="display: inline-block; padding: 16px 32px; background: rgba(255, 255, 255, 0.1); border-radius: 16px; backdrop-filter: blur(10px); margin-bottom: 12px;">
                          <h3 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.7px; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">✨ KamiKoto</h3>
                        </div>
                        <p style="margin: 8px 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.85); font-weight: 600; letter-spacing: 0.5px;">Your Premium Stationery Destination</p>
                      </td>
                    </tr>

                    <!-- Divider with gradient -->
                    <tr>
                      <td style="padding: 24px 0;">
                        <div style="height: 2px; background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.5) 50%, transparent 100%);"></div>
                      </td>
                    </tr>

                    <!-- Contact Info -->
                    <tr>
                      <td style="text-align: center; padding: 24px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="text-align: center;">
                              <p style="margin: 0 0 12px 0; font-size: 16px; color: rgba(255, 255, 255, 0.95); line-height: 1.7; font-weight: 500;">
                                📧 Questions? We'd love to hear from you!<br/>
                                <a href="mailto:${featureConfig.email.supportEmail}" style="color: #93c5fd; text-decoration: none; font-weight: 700; border-bottom: 2px solid rgba(147, 197, 253, 0.5); padding-bottom: 2px;">${featureConfig.email.supportEmail}</a>
                              </p>
                              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); font-weight: 500;">
                                💬 Our team typically responds within 24 hours
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Divider with gradient -->
                    <tr>
                      <td style="padding: 24px 0;">
                        <div style="height: 2px; background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.5) 50%, transparent 100%);"></div>
                      </td>
                    </tr>

                    <!-- Copyright and Legal -->
                    <tr>
                      <td style="text-align: center; padding-top: 20px;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255, 255, 255, 0.65); line-height: 1.6; font-weight: 500;">
                          © ${new Date().getFullYear()} KamiKoto. All Rights Reserved.
                        </p>
                        <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); line-height: 1.5;">
                          📦 This email was sent because you placed an order with us.<br/>
                          <span style="font-size: 12px;">Crafted with ❤️ for stationery lovers everywhere.</span>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
  `;
};

/**
 * Generates HTML content for order shipped emails
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @param {Object} shipmentInfo - Shipping information
 * @returns {string} - HTML content for the email
 */
const generateOrderShippedHTML = (order, user, shipmentInfo) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  /**
   * Animation CSS for supported email clients
   * Provides subtle animations for modern email clients
   */
  const animationCSS = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animated {
      animation: fadeIn 0.5s ease-out forwards;
    }
  `;
  
  /**
   * Process image URL for email client compatibility (same function as order confirmation)
   * @param {string} imageUrl - Original image URL
   * @returns {string} - Processed image URL optimized for email clients
   */
  const processImageForEmailShipped = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Handle i.imgur.com URLs - ensure they use direct image links
    if (imageUrl.includes('i.imgur.com')) {
      // Ensure the URL ends with a proper image extension for email clients
      if (!imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return `${imageUrl}.jpg`; // Add .jpg extension for email client compatibility
      }
    }
    
    return imageUrl;
  };

  // Generate professional HTML for order items in shipping notification
  const itemsHTML = order.items.map((item, index) => {
    // Professional product name truncation for consistent layout
    const truncatedName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
    
    // Process image URL for email client compatibility
    const processedImageUrl = processImageForEmailShipped(item.image);
    
    return `
    <!-- Professional Product Item Row - Optimized for shipping emails -->
    <tr style="animation-delay: ${index * 0.1}s;" class="animated">
      <td style="padding: 24px 0; border-bottom: 1px solid #E2E8F0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="90" style="vertical-align: top; padding-right: 20px;">
              ${processedImageUrl ? 
                `<img src="${processedImageUrl}" alt="${truncatedName}" style="
                  width: 90px; 
                  height: 90px; 
                  object-fit: cover; 
                  border-radius: 12px; 
                  background-color: #F8FAFC;
                  border: 1px solid #E2E8F0;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                  display: block;
                " />` : 
                `<div style="
                  width: 90px; 
                  height: 90px; 
                  border-radius: 12px; 
                  background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
                  border: 1px solid #E2E8F0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #64748B;
                  font-size: 12px;
                  font-weight: 500;
                ">No Image</div>`
              }
            </td>
            <td style="vertical-align: top;">
              <h4 style="margin: 0 0 6px 0; font-weight: 600; font-size: 17px; color: #1E293B; line-height: 1.3;">${truncatedName}</h4>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748B; font-weight: 500;">Qty: ${item.quantity}</p>
              ${item.price ? `<p style="margin: 0; font-size: 13px; color: #94A3B8;">Price: ${formatCurrency(item.price)}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `}).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Your Order Has Shipped</title>
      <style type="text/css">
        /* Base styles */
        body, table, td {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
        
        /* Animation support for modern clients */
        ${animationCSS}
      </style>
      <!--[if mso]>
      <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; background-color: #F5F7FA; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A202C; line-height: 1.5; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      <!-- Wrapper -->
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
        <!-- Email Header -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 30px 30px; background-color: #38BDF8; text-align: center; border-radius: 8px 8px 0 0;">
              <!-- Logo -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">KamiKoto</h1>
                    <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">Perfect Online Stationery Store</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Shipped Status Banner -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;" class="animated">
                    <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #2563EB;">Your order is on the way!</h2>
                    <p style="margin: 10px 0 0; color: #1E40AF; font-size: 16px;">Hello ${user.displayName || user.email},</p>
                    <p style="margin: 10px 0 0; color: #1E40AF; font-size: 16px;">Great news! Your order #${order.orderId} has been shipped and is on its way to you.</p>
                  </td>
                </tr>
              </table>

              <!-- Tracking Information -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;" class="animated">
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 1px solid #E8ECF0;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1A202C;">Shipment Details</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td width="50%" style="vertical-align: top; padding-right: 15px;">
                          <p style="margin: 0 0 10px; font-size: 15px; color: #64748B;">Carrier</p>
                          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1A202C;">${shipmentInfo.carrier}</p>
                        </td>
                        <td width="50%" style="vertical-align: top;">
                          <p style="margin: 0 0 10px; font-size: 15px; color: #64748B;">Tracking Number</p>
                          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1A202C; word-break: break-all;">${shipmentInfo.trackingNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="vertical-align: top; padding-top: 20px;">
                          <p style="margin: 0 0 10px; font-size: 15px; color: #64748B;">Estimated Delivery</p>
                          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1A202C;">${shipmentInfo.estimatedDeliveryDate}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Tracking Button -->
              ${shipmentInfo.trackingUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;">
                <tr>
                  <td style="text-align: center; padding: 5px 0 25px;">
                    <a href="${shipmentInfo.trackingUrl}" target="_blank" style="display: inline-block; background-color: #2563EB; color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 30px; border-radius: 6px; transition: background-color 0.3s ease;">Track Your Package</a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Products Section -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 1px solid #E8ECF0;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1A202C;">Items Shipped</h3>
                  </td>
                </tr>
                <!-- Product Items - Optimized layout for up to 5 products -->
                ${itemsHTML}
              </table>

              <!-- Shipping Info -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;" class="animated">
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 1px solid #E8ECF0;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1A202C;">Shipping Address</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <p style="margin: 0; font-size: 16px; color: #1A202C; line-height: 1.6;">
                      <span style="font-weight: 600;">${order.shippingAddress?.name || order.userName || 'Customer'}</span><br>
                      ${order.shippingAddress?.street || ''}<br>
                      ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zip || ''}<br>
                      ${order.shippingAddress?.country || ''}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Order Summary Section -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px; border: 1px solid #E2E8F0; border-radius: 8px;" class="animated">
                <tr>
                  <td style="background-color: #F8FAFC; padding: 15px; border-bottom: 1px solid #E2E8F0; border-radius: 8px 8px 0 0;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1A202C;">Order Summary</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="font-size: 14px; color: #64748B;">Subtotal</td>
                              <td style="font-size: 14px; color: #1A202C; text-align: right;">${formatCurrency(order.subtotal || 0)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="font-size: 14px; color: #64748B;">Shipping</td>
                              <td style="font-size: 14px; color: #1A202C; text-align: right;">${formatCurrency(order.shipping?.cost || 0)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="font-size: 14px; color: #64748B;">Tax</td>
                              <td style="font-size: 14px; color: #1A202C; text-align: right;">${formatCurrency(order.tax || 0)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ${order.importDuty > 0 ? `
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="font-size: 14px; color: #EA580C;">Import Duty</td>
                              <td style="font-size: 14px; color: #EA580C; text-align: right;">${formatCurrency(order.importDuty)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ` : ''}
                      ${order.discount > 0 ? `
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="font-size: 14px; color: #16A34A;">Discount</td>
                              <td style="font-size: 14px; color: #16A34A; text-align: right;">-${formatCurrency(order.discount)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding-top: 10px; border-top: 1px solid #E2E8F0;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="font-size: 16px; font-weight: bold; color: #1A202C;">Total</td>
                              <td style="font-size: 16px; font-weight: bold; color: #1A202C; text-align: right;">${formatCurrency(order.totalAmount || order.total || 0)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding: 30px; background-color: #F5F7FA; border-radius: 8px; text-align: center;" class="animated">
                    <p style="margin: 0 0 20px; font-size: 16px; color: #64748B;">Have questions about your shipment?</p>
                    <a href="mailto:${featureConfig.email.supportEmail}" style="display: inline-block; background-color: #38BDF8; color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 30px; border-radius: 6px; transition: background-color 0.3s ease;">Contact Support</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 30px; background-color: #F1F5F9; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 14px; color: #64748B; font-weight: 500;">
                Thank you for shopping with KamiKoto
              </p>
              <p style="margin: 10px 0 0; font-size: 14px; color: #94A3B8;">
                Perfect Online Stationery Store
              </p>
              <p style="margin: 20px 0 0; font-size: 13px; color: #94A3B8;">
                © ${new Date().getFullYear()} KamiKoto. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
};

// Export all the email service functions
export {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  isEmailEnabled,
  sendEmail
}; 