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
   * Minimal CSS styling inspired by shadcn UI
   * Clean, simple design with subtle borders and shadows
   */
  const minimalCSS = `
    /* Reset and base styles */
    table, td, div, h1, h2, h3, p, a {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    }

    /* Mobile responsive helpers */
    @media only screen and (max-width: 600px) {
      .mobile-stack {
        display: block !important;
        width: 100% !important;
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

  // Generate minimal HTML for order items
  const itemsHTML = order.items.map((item, index) => {
    const truncatedName = item.name.length > 50 ? item.name.substring(0, 47) + '...' : item.name;
    const processedImageUrl = processImageForEmail(item.image);

    return `
    <tr>
      <td style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="80" style="vertical-align: top; padding-right: 16px;">
              ${processedImageUrl ?
                `<img src="${processedImageUrl}" alt="${truncatedName}" style="
                  width: 80px;
                  height: 80px;
                  object-fit: cover;
                  border-radius: 8px;
                  border: 1px solid #e5e7eb;
                  display: block;
                " />` :
                `<div style="
                  width: 80px;
                  height: 80px;
                  border-radius: 8px;
                  background: #f9fafb;
                  border: 1px solid #e5e7eb;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #9ca3af;
                  font-size: 11px;
                ">No Image</div>`
              }
            </td>
            <td style="vertical-align: middle; padding-right: 16px;">
              <p style="margin: 0 0 4px 0; font-weight: 600; font-size: 15px; color: #111827; line-height: 1.4;">${truncatedName}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Quantity: ${item.quantity}</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${formatCurrency(item.price)} each</p>
            </td>
            <td width="100" style="vertical-align: middle; text-align: right;">
              <p style="margin: 0; font-weight: 600; font-size: 15px; color: #111827;">${formatCurrency(item.price * item.quantity)}</p>
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
    }

    ${minimalCSS}
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #111827; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!-- Email Container -->
  <table style="width: 100%; min-width: 600px; background-color: #f9fafb;" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody>
      <tr>
        <td align="center" valign="top" style="padding: 40px 0;">
          <!-- Main Email Container -->
          <table style="width: 600px; max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tbody>
              <!-- Header -->
              <tr>
                <td style="padding: 32px 40px; border-bottom: 1px solid #e5e7eb;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="left">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">KamiKoto</h1>
                        <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Your Premium Stationery Destination</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Order Confirmation Section -->
              <tr>
                <td style="padding: 40px 40px 32px 40px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="text-align: center;">
                        <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">Order Confirmed</h2>
                        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.5;">Hello ${user.displayName || user.email?.split('@')[0] || 'Valued Customer'}, thank you for your order!</p>

                        <div style="display: inline-block; padding: 12px 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 16px;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">Order #${order.orderId}</p>
                        </div>

                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">${new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; text-align: left;">
                          <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 500;">
                            We're processing your order right now.
                          </p>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            You'll receive tracking information once it ships.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Order Items Table -->
              <tr>
                <td style="padding: 0 40px 32px 40px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <!-- Table Header -->
                    <tr>
                      <td style="padding: 16px 24px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">Order Items</h3>
                      </td>
                    </tr>
                    <!-- Order Items -->
                    ${itemsHTML}
                    
                    <!-- Order Summary -->
                    <tr>
                      <td style="padding: 20px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="padding-bottom: 8px;">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="font-size: 14px; color: #6b7280;">Subtotal</td>
                                  <td style="font-size: 14px; color: #111827; text-align: right;">${formatCurrency(subtotal)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 8px;">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="font-size: 14px; color: #6b7280;">Tax (18% GST)</td>
                                  <td style="font-size: 14px; color: #111827; text-align: right;">${formatCurrency(tax)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: ${importDuty > 0 || discount > 0 ? '8px' : '0'};">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="font-size: 14px; color: #6b7280;">Shipping</td>
                                  <td style="font-size: 14px; color: #111827; text-align: right;">${shipping === 0 ? 'Free' : formatCurrency(shipping)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          ${importDuty > 0 ? `
                          <tr>
                            <td style="padding-bottom: ${discount > 0 ? '8px' : '0'};">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="font-size: 14px; color: #ea580c;">Import Duty (69%)</td>
                                  <td style="font-size: 14px; color: #ea580c; text-align: right;">${formatCurrency(importDuty)}</td>
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
                                  <td style="font-size: 14px; color: #16a34a;">Discount</td>
                                  <td style="font-size: 14px; color: #16a34a; text-align: right;">-${formatCurrency(discount)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding-top: 12px; border-top: 1px solid #e5e7eb;">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="font-size: 15px; font-weight: 600; color: #111827;">Total (${order.items.length} ${order.items.length === 1 ? 'item' : 'items'})</td>
                                  <td style="font-size: 15px; font-weight: 600; color: #111827; text-align: right;">${formatCurrency(total)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Shipping and Payment Info -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 32px;">
                    <tr>
                      <td width="50%" valign="top" style="padding-right: 20px;">
                        <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #111827;">Shipping Address</h3>
                        <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                          ${order.shippingAddress?.name || order.userName || 'Customer'}<br>
                          ${order.shippingAddress?.street || ''}<br>
                          ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zip || ''}<br>
                          ${order.shippingAddress?.country || ''}
                        </p>
                      </td>
                      <td width="50%" valign="top">
                        <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #111827;">Payment Method</h3>
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">${order.payment?.method || 'Credit card'}</p>
                        <p style="margin: 0; font-size: 14px; color: #16a34a; font-weight: 500;">Payment Status: Completed</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Help Section -->
              <tr>
                <td style="padding: 32px 40px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #111827;">Need Help?</p>
                        <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                          Have questions about your order? Contact us at <a href="mailto:${featureConfig.email.supportEmail}" style="color: #111827; font-weight: 500; text-decoration: underline;">${featureConfig.email.supportEmail}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #111827;">KamiKoto</p>
                        <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">Your Premium Stationery Destination</p>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                          Questions? <a href="mailto:${featureConfig.email.supportEmail}" style="color: #111827; text-decoration: underline;">${featureConfig.email.supportEmail}</a>
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                          © ${new Date().getFullYear()} KamiKoto. All Rights Reserved.
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
   * Minimal CSS styling inspired by shadcn UI
   */
  const minimalShippedCSS = `
    /* Reset and base styles */
    table, td, div, h1, h2, h3, p, a {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
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

  // Generate minimal HTML for order items in shipping notification
  const itemsHTML = order.items.map((item, index) => {
    const truncatedName = item.name.length > 50 ? item.name.substring(0, 47) + '...' : item.name;
    const processedImageUrl = processImageForEmailShipped(item.image);

    return `
    <tr>
      <td style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="70" style="vertical-align: top; padding-right: 16px;">
              ${processedImageUrl ?
                `<img src="${processedImageUrl}" alt="${truncatedName}" style="
                  width: 70px;
                  height: 70px;
                  object-fit: cover;
                  border-radius: 6px;
                  border: 1px solid #e5e7eb;
                  display: block;
                " />` :
                `<div style="
                  width: 70px;
                  height: 70px;
                  border-radius: 6px;
                  background: #f9fafb;
                  border: 1px solid #e5e7eb;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #9ca3af;
                  font-size: 11px;
                ">No Image</div>`
              }
            </td>
            <td style="vertical-align: top;">
              <p style="margin: 0 0 4px 0; font-weight: 500; font-size: 14px; color: #111827; line-height: 1.4;">${truncatedName}</p>
              <p style="margin: 0; font-size: 13px; color: #6b7280;">Quantity: ${item.quantity}</p>
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
        }

        ${minimalShippedCSS}
      </style>
      <!--[if mso]>
      <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #111827; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      <table style="width: 100%; background-color: #f9fafb;" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tr>
          <td align="center" valign="top" style="padding: 40px 0;">
            <table style="width: 600px; max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="padding: 32px 40px; border-bottom: 1px solid #e5e7eb;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">KamiKoto</h1>
                  <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Your Premium Stationery Destination</p>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 40px 32px 40px;">
                  <!-- Shipped Status Banner -->
                  <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 32px;">
                    <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #111827;">Your order is on the way</h2>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">Hello ${user.displayName || user.email},</p>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Your order #${order.orderId} has been shipped and is on its way to you.</p>
                  </div>

                  <!-- Tracking Information -->
                  <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 32px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #111827;">Shipment Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td width="50%" style="vertical-align: top; padding-right: 15px; padding-bottom: 16px;">
                          <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Carrier</p>
                          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #111827;">${shipmentInfo.carrier}</p>
                        </td>
                        <td width="50%" style="vertical-align: top; padding-bottom: 16px;">
                          <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Tracking Number</p>
                          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #111827; word-break: break-all;">${shipmentInfo.trackingNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="vertical-align: top;">
                          <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Estimated Delivery</p>
                          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #111827;">${shipmentInfo.estimatedDeliveryDate}</p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Tracking Button -->
                  ${shipmentInfo.trackingUrl ? `
                  <div style="text-align: center; margin-bottom: 32px;">
                    <a href="${shipmentInfo.trackingUrl}" target="_blank" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">Track Your Package</a>
                  </div>
                  ` : ''}

                  <!-- Products Section -->
                  <div style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 32px;">
                    <div style="padding: 16px 20px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                      <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">Items Shipped</h3>
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      ${itemsHTML}
                    </table>
                  </div>

                  <!-- Shipping Info -->
                  <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 32px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #111827;">Shipping Address</h3>
                    <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                      <span style="font-weight: 500; color: #111827;">${order.shippingAddress?.name || order.userName || 'Customer'}</span><br>
                      ${order.shippingAddress?.street || ''}<br>
                      ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zip || ''}<br>
                      ${order.shippingAddress?.country || ''}
                    </p>
                  </div>

                  <!-- Order Summary Section -->
                  <div style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 32px;">
                    <div style="padding: 16px 20px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                      <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">Order Summary</h3>
                    </div>
                    <div style="padding: 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="padding-bottom: 8px;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td style="font-size: 14px; color: #6b7280;">Subtotal</td>
                                <td style="font-size: 14px; color: #111827; text-align: right;">${formatCurrency(order.subtotal || 0)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 8px;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td style="font-size: 14px; color: #6b7280;">Shipping</td>
                                <td style="font-size: 14px; color: #111827; text-align: right;">${formatCurrency(order.shipping?.cost || 0)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: ${order.importDuty > 0 || order.discount > 0 ? '8px' : '0'};">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td style="font-size: 14px; color: #6b7280;">Tax</td>
                                <td style="font-size: 14px; color: #111827; text-align: right;">${formatCurrency(order.tax || 0)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        ${order.importDuty > 0 ? `
                        <tr>
                          <td style="padding-bottom: ${order.discount > 0 ? '8px' : '0'};">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td style="font-size: 14px; color: #ea580c;">Import Duty</td>
                                <td style="font-size: 14px; color: #ea580c; text-align: right;">${formatCurrency(order.importDuty)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        ` : ''}
                        ${order.discount > 0 ? `
                        <tr>
                          <td style="padding-bottom: 0;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td style="font-size: 14px; color: #16a34a;">Discount</td>
                                <td style="font-size: 14px; color: #16a34a; text-align: right;">-${formatCurrency(order.discount)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding-top: 12px; border-top: 1px solid #e5e7eb;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td style="font-size: 15px; font-weight: 600; color: #111827;">Total</td>
                                <td style="font-size: 15px; font-weight: 600; color: #111827; text-align: right;">${formatCurrency(order.totalAmount || order.total || 0)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>

                  <!-- Help Section -->
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; text-align: center;">
                    <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280;">Have questions about your shipment?</p>
                    <a href="mailto:${featureConfig.email.supportEmail}" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 10px 20px; border-radius: 6px;">Contact Support</a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #111827;">KamiKoto</p>
                  <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">Your Premium Stationery Destination</p>
                  <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                    Questions? <a href="mailto:${featureConfig.email.supportEmail}" style="color: #111827; text-decoration: underline;">${featureConfig.email.supportEmail}</a>
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                    © ${new Date().getFullYear()} KamiKoto. All Rights Reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Sends a magic link authentication email to the user
 * @param {string} email - User's email address
 * @param {string} magicLink - The magic link URL for authentication
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendMagicLinkEmail = async (email, magicLink) => {
  console.log('sendMagicLinkEmail called with email:', email);

  if (!email) {
    console.error('Cannot send magic link: Missing user email');
    return { success: false, error: 'Missing user email' };
  }

  if (!magicLink) {
    console.error('Cannot send magic link: Missing magic link URL');
    return { success: false, error: 'Missing magic link URL' };
  }

  if (!isEmailEnabled()) {
    console.log('Email functionality is disabled, skipping magic link email');
    return { success: false, error: 'Email functionality is disabled' };
  }

  try {
    console.log('Generating magic link email HTML template');
    const emailBody = generateMagicLinkHTML(email, magicLink);
    console.log('Email template generated, length:', emailBody.length);

    const emailData = {
      to: email,
      subject: 'Sign in to KamiKoto - Your Magic Link',
      body: emailBody,
    };

    console.log('Calling sendEmail function with magic link data');
    return await sendEmail(emailData);
  } catch (error) {
    console.error('Error in sendMagicLinkEmail function:', error);
    return { success: false, error: error.message || 'Failed to send magic link email' };
  }
};

/**
 * Generates HTML content for magic link authentication emails
 * @param {string} email - User's email address
 * @param {string} magicLink - The magic link URL for authentication
 * @returns {string} - HTML content for the email
 */
const generateMagicLinkHTML = (email, magicLink) => {
  const minimalCSS = `
    table, td, div, h1, h2, h3, p, a {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    }

    @media only screen and (max-width: 600px) {
      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }
      .mobile-padding {
        padding: 16px !important;
      }
    }
  `;

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
  <title>Sign in to KamiKoto</title>
  <style type="text/css">
    body, table, td {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
    }
    ${minimalCSS}
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #111827; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table style="width: 100%; min-width: 600px; background-color: #f9fafb;" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody>
      <tr>
        <td align="center" valign="top" style="padding: 40px 0;">
          <table style="width: 600px; max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tbody>
              <!-- Header -->
              <tr>
                <td style="padding: 32px 40px; border-bottom: 1px solid #e5e7eb;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="left">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">KamiKoto</h1>
                        <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Your Premium Stationery Destination</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Sign In Section -->
              <tr>
                <td style="padding: 40px 40px 32px 40px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="text-align: center;">
                        <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">Sign In to Your Account</h2>
                        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.5;">Click the button below to securely sign in to your KamiKoto account.</p>

                        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; text-align: left; margin-bottom: 24px;">
                          <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 500;">
                            Sign-in requested for:
                          </p>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            ${email}
                          </p>
                        </div>

                        <!-- Magic Link Button -->
                        <div style="text-align: center; margin-bottom: 24px;">
                          <a href="${magicLink}" target="_blank" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 14px 32px; border-radius: 6px; margin: 0 auto;">Sign In to KamiKoto</a>
                        </div>

                        <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 16px; text-align: left;">
                          <p style="margin: 0 0 4px 0; color: #92400e; font-size: 14px; font-weight: 500;">
                            Security Notice
                          </p>
                          <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                            This link will expire in 60 minutes. If you didn't request this sign-in, please ignore this email.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Alternative Link Section -->
              <tr>
                <td style="padding: 0 40px 32px 40px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <tr>
                      <td style="padding: 16px 24px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                        <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">Having trouble with the button?</h3>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 24px;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Copy and paste this link into your browser:</p>
                        <p style="margin: 0; font-size: 13px; color: #111827; word-break: break-all; font-family: 'Courier New', Courier, monospace; background-color: #f9fafb; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb;">${magicLink}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Help Section -->
              <tr>
                <td style="padding: 0 40px 32px 40px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #111827;">Need Help?</p>
                        <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                          If you're having trouble signing in, contact us at <a href="mailto:${featureConfig.email.supportEmail}" style="color: #111827; font-weight: 500; text-decoration: underline;">${featureConfig.email.supportEmail}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #111827;">KamiKoto</p>
                        <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">Your Premium Stationery Destination</p>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                          Questions? <a href="mailto:${featureConfig.email.supportEmail}" style="color: #111827; text-decoration: underline;">${featureConfig.email.supportEmail}</a>
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                          © ${new Date().getFullYear()} KamiKoto. All Rights Reserved.
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

// Export all the email service functions
export {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendMagicLinkEmail,
  isEmailEnabled,
  sendEmail
}; 