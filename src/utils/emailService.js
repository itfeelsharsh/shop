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
   * Professional CSS styling for email clients
   * Optimized for better compatibility across email clients including Outlook, Gmail, Apple Mail
   * Focus on professional appearance with consistent spacing and typography
   */
  const professionalCSS = `
    /* Reset and base styles for better email client compatibility */
    table, td, div, h1, h2, h3, p, a {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    }
    
    /* Professional animations for modern email clients */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.98); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    .animated {
      animation: fadeIn 0.6s ease-out forwards;
    }
    
    .animated-scale {
      animation: scaleIn 0.6s ease-out forwards;
    }
    
    /* Professional button styling */
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    /* Enhanced card styling */
    .card {
      border-radius: 12px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
      background: #ffffff;
    }
    
    /* Professional spacing utilities */
    .spacer-sm { height: 16px; }
    .spacer-md { height: 24px; }
    .spacer-lg { height: 32px; }
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

  // Generate the HTML for order items - optimized for professional display
  // Enhanced for better email client compatibility and professional appearance
  const itemsHTML = order.items.map((item, index) => {
    // Professional product name truncation for consistent layout
    const truncatedName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
    
    // Process image URL for email client compatibility
    const processedImageUrl = processImageForEmail(item.image);
    
    return `
    <!-- Professional Product Item Row - Optimized for up to 5 products -->
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
              <p style="margin: 0; font-size: 13px; color: #94A3B8;">Item Price: ${formatCurrency(item.price)}</p>
            </td>
            <td width="120" style="vertical-align: top; text-align: right;">
              <p style="margin: 0; font-weight: 700; font-size: 18px; color: #1E293B;">${formatCurrency(item.price * item.quantity)}</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">Total</p>
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
              <!-- Professional Email Header -->
              <tr>
                <td style="padding: 32px 40px 24px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" bgcolor="#667eea">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="left">
                        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.6px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">KamiKoto</h1>
                        <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9); font-weight: 500; letter-spacing: 0.3px;">Your Premium Stationery Store</p>
                      </td>
                      <td align="right" width="80">
                        <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                          <div style="width: 24px; height: 24px; background: #ffffff; border-radius: 4px;"></div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Professional Order Confirmation Banner -->
              <tr>
                <td style="padding: 24px 40px; background-color: #FFFFFF;" bgcolor="#FFFFFF">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" class="card">
                    <tr>
                      <td style="padding: 40px 32px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; text-align: center; border: 1px solid #e0f2fe;" class="animated-scale">
                        <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin-bottom: 24px; position: relative;">
                          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 36px; font-weight: bold;">✓</div>
                        </div>
                        <h2 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 700; color: #0f172a; line-height: 1.2; letter-spacing: -0.5px;">Order Confirmed Successfully!</h2>
                        <p style="margin: 0 0 8px 0; color: #334155; font-size: 18px; line-height: 1.5; font-weight: 500;">Hello ${user.displayName || user.email?.split('@')[0] || 'Valued Customer'},</p>
                        <p style="margin: 0; color: #64748b; font-size: 16px; line-height: 1.6;">Thank you for your order! We're processing it right now and will send you tracking information once it ships.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Professional Order Details Section -->
              <tr>
                <td style="padding: 32px 40px 0px 40px; background-color: #ffffff;" bgcolor="#ffffff">
                  <div style="text-align: center; margin-bottom: 32px;" class="animated">
                    <h2 style="margin: 0 0 12px; font-size: 28px; font-weight: 700; color: #0f172a; letter-spacing: -0.4px;">Order Details</h2>
                    <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50px; margin-bottom: 8px;">
                      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">Order #${order.orderId}</p>
                    </div>
                    <p style="margin: 0; font-size: 14px; color: #64748b;">Placed on ${new Date(order.orderDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  
                  <!-- Professional Order Items Table -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 32px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);" class="card">
                    <!-- Table Header -->
                    <tr>
                      <td style="padding: 20px 24px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-bottom: 1px solid #e2e8f0;">
                        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Your Items</h3>
                      </td>
                    </tr>
                    <!-- Order Items - Enhanced for professional appearance -->
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
              
              <!-- Any Questions Section -->
              <tr>
                <td style="padding: 48px 32px 48px 32px; background-color: #ffffff;" bgcolor="#ffffff">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="padding: 20px; background-color: #fff8f0; border-radius: 8px;" class="animated">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td width="64" valign="top">
                              <img src="https://cloudfilesdm.com/postcards/image-1702460591798.png" width="64" height="64" alt="" style="display: block; width: 64px; height: auto; border: 0;">
                            </td>
                            <td style="padding-left: 15px;">
                              <h3 style="margin: 0 0 4px; font-size: 18px; font-weight: bold; color: #121212;">Any questions?</h3>
                              <p style="margin: 0; font-size: 15px; color: #121212; line-height: 1.4;">
                                If you need any help whatsoever or just want to chat, email us anytime at <a href="mailto:${featureConfig.email.supportEmail}" style="color: #ff554a; font-weight: 600; text-decoration: none;">${featureConfig.email.supportEmail}</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Professional Footer -->
              <tr>
                <td style="padding: 40px; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); text-align: center;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="text-align: center; padding-bottom: 24px;">
                        <h3 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">KamiKoto</h3>
                        <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.8);">Your Premium Stationery Store</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center; padding: 20px 0; border-top: 1px solid rgba(255, 255, 255, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); line-height: 1.6;">
                          Questions? Email us at <a href="mailto:${featureConfig.email.supportEmail}" style="color: #60a5fa; text-decoration: none; font-weight: 600;">${featureConfig.email.supportEmail}</a><br>
                          <span style="color: rgba(255, 255, 255, 0.7);">We're here to help!</span>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center; padding-top: 20px;">
                        <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.6); line-height: 1.4;">
                          © ${new Date().getFullYear()} KamiKoto. All Rights Reserved.<br>
                          <span style="font-size: 12px;">This email was sent because you placed an order with us.</span>
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