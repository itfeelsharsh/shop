/**
 * Email Service
 * 
 * This utility provides functions for sending various types of emails to users using Resend API.
 * It checks the featureConfig to determine if emails should be sent.
 */

import featureConfig from './featureConfig';
import { Resend } from 'resend';

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

/**
 * Checks if the email functionality is properly configured and enabled
 * @returns {boolean} - True if email is enabled and properly configured
 */
const isEmailEnabled = () => {
  // Check if email is enabled in the config
  if (!featureConfig.email.enabled) {
    console.log('Email functionality is disabled in configuration');
    return false;
  }

  // Check if Resend API key is available
  const resendApiKey = getEnvVar('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is missing in environment variables');
    return false;
  }
  
  // Log email configuration for debugging
  console.log('Email Configuration:', {
    enabled: featureConfig.email.enabled,
    useEmailServer: false, // Always use Resend API
    fromAddress: featureConfig.email.fromAddress,
    apiKeyExists: !!resendApiKey
  });

  return true;
};

/**
 * Sends an email using the Resend API
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
    console.log('Using Resend API method');
    return await sendViaResend(emailData);
  } catch (error) {
    console.error('Error in sendEmail function:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
};

/**
 * Sends an email using the Resend API
 * @param {Object} emailData - Email data
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendViaResend = async (emailData) => {
  try {
    console.log('Attempting to send email via Resend with data:', {
      to: emailData.to,
      subject: emailData.subject,
      fromAddress: emailData.from || featureConfig.email.fromAddress
    });
    
    // Initialize the Resend client with the API key
    const resendApiKey = getEnvVar('RESEND_API_KEY');
    const resend = new Resend(resendApiKey);
    console.log('Resend client initialized');
    
    // Prepare the sender with proper format
    const fromEmail = emailData.from || featureConfig.email.fromAddress;
    // Ensure proper "From" format with name - Resend requires this format
    const formattedFrom = fromEmail.includes('<') ? fromEmail : `KamiKoto <${fromEmail}>`;
    
    // Send the email using the Resend SDK
    const emailPayload = {
      from: formattedFrom,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.body,
    };
    
    console.log('Sending email with payload:', emailPayload);
    
    const response = await resend.emails.send(emailPayload);
    console.log('Resend API response:', response);
    
    if (response.error) {
      console.error('Resend API returned an error:', response.error);
      throw new Error(response.error.message || 'Failed to send email via Resend');
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Detailed error sending email via Resend:', error);
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
      subject: `Order Confirmation #${order.orderId}`,
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
  
  // Generate the HTML for order items
  const itemsHTML = order.items.map(item => `
    <!-- Product Item Row -->
    <tr>
      <td style="padding: 20px 0; border-bottom: 1px solid #E8ECF0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="80" style="vertical-align: top; padding-right: 15px;">
              ${item.image ? 
                `<img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; background-color: #F5F7FA;">` : 
                `<div style="width: 80px; height: 80px; border-radius: 8px; background-color: #F5F7FA;"></div>`
              }
            </td>
            <td style="vertical-align: top;">
              <p style="margin: 0; font-weight: 600; font-size: 16px; color: #1A202C;">${item.name}</p>
              <p style="margin: 5px 0 0; font-size: 14px; color: #64748B;">Quantity: ${item.quantity}</p>
            </td>
            <td width="100" style="vertical-align: top; text-align: right;">
              <p style="margin: 0; font-weight: 600; font-size: 16px; color: #1A202C;">${formatCurrency(item.price * item.quantity)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');
  
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
              <!-- Email Header -->
              <tr>
                <td style="padding: 26px 32px 16px 32px; background-color: #ffffff;" bgcolor="#ffffff">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="left">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #121212; letter-spacing: -0.5px;">KamiKoto</h1>
                        <p style="margin: 8px 0 0; font-size: 16px; color: rgba(18, 18, 18, 0.8); font-weight: 500;">Perfect Online Stationery Store</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Order Confirmation Banner -->
              <tr>
                <td style="padding: 0px 32px 0px 32px; background-color: #FFFFFF;" bgcolor="#FFFFFF">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="padding: 48px 24px 48px 24px; background-color: #fff8f0; border-radius: 12px; text-align: center;">
                        <h2 style="margin: 0; font-size: 44px; font-weight: bold; color: #121212; line-height: 1.1;">Hooray! Your order has been confirmed.</h2>
                        <p style="margin: 16px 0 24px; color: rgba(18, 18, 18, 0.8); font-size: 16px; line-height: 1.5;">KamiKoto will commence work on this immediately. You'll receive an email notification once it's shipped.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Order Details Section -->
              <tr>
                <td style="padding: 48px 32px 0px 32px; background-color: #ffffff;" bgcolor="#ffffff">
                  <h2 style="margin: 0 0 8px; font-size: 32px; font-weight: bold; color: #121212; text-align: center;">Order details</h2>
                  <p style="margin: 0 0 24px; font-size: 16px; font-weight: 600; color: #121212; text-align: center;">Confirmation number: <span style="color: #ff554a;">#${order.orderId}</span></p>
                  
                  <!-- Order Items Table -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border: 1px solid #d1dfe3; border-radius: 12px; margin-bottom: 30px;">
                    <!-- Order Items -->
                    ${itemsHTML}
                    
                    <!-- Order Summary -->
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
                  
                  <!-- Shipping and Payment Info -->
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;">
                    <tr>
                      <td width="50%" valign="top" style="padding-right: 15px;">
                        <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #121212;">Shipping address</h3>
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: rgba(18, 18, 18, 0.8);">
                          ${order.shippingAddress.name}<br>
                          ${order.shippingAddress.street}<br>
                          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
                          ${order.shippingAddress.country}
                        </p>
                      </td>
                      <td width="50%" valign="top">
                        <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #121212;">Paid with ${order.payment?.method || 'Credit card'}</h3>
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: rgba(18, 18, 18, 0.8);">Subtotal: ${formatCurrency(subtotal)}</p>
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: rgba(18, 18, 18, 0.8);">Tax (18% GST): ${formatCurrency(tax)}</p>
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: rgba(18, 18, 18, 0.8);">Shipping: ${shipping === 0 ? 'Free' : formatCurrency(shipping)}</p>
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
                      <td style="padding: 20px; background-color: #fff8f0; border-radius: 8px;">
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
              
              <!-- Footer -->
              <tr>
                <td style="padding: 50px 40px 50px 40px; background-color: #1d1b2d; text-align: center; background-image: url('https://cloudfilesdm.com/postcards/image-1702463485006.png'); background-size: cover; background-position: center; background-repeat: no-repeat;">
                  <p style="margin: 0 0 10px; font-size: 14px; color: rgba(255, 255, 255, 0.8); line-height: 1.3;">
                    © ${new Date().getFullYear()} KamiKoto. All Rights Reserved.<br>
                    Perfect Online Stationery Store.
                  </p>
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
  
  // Generate the HTML for order items
  const itemsHTML = order.items.map(item => `
    <!-- Product Item Row -->
    <tr>
      <td style="padding: 20px 0; border-bottom: 1px solid #E8ECF0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="80" style="vertical-align: top; padding-right: 15px;">
              ${item.image ? 
                `<img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; background-color: #F5F7FA;">` : 
                `<div style="width: 80px; height: 80px; border-radius: 8px; background-color: #F5F7FA;"></div>`
              }
            </td>
            <td style="vertical-align: top;">
              <p style="margin: 0; font-weight: 600; font-size: 16px; color: #1A202C;">${item.name}</p>
              <p style="margin: 5px 0 0; font-size: 14px; color: #64748B;">Quantity: ${item.quantity}</p>
              ${item.price ? `<p style="margin: 5px 0 0; font-size: 14px; color: #64748B;">Price: ${formatCurrency(item.price)}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Your Order Has Shipped</title>
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
                  <td style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
                    <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #2563EB;">Your order is on the way!</h2>
                    <p style="margin: 10px 0 0; color: #1E40AF; font-size: 16px;">Hello ${user.displayName || user.email},</p>
                    <p style="margin: 10px 0 0; color: #1E40AF; font-size: 16px;">Great news! Your order #${order.orderId} has been shipped and is on its way to you.</p>
                  </td>
                </tr>
              </table>

              <!-- Tracking Information -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;">
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
                          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1A202C;">${shipmentInfo.trackingNumber}</p>
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
                <!-- Product Items -->
                ${itemsHTML}
              </table>

              <!-- Shipping Info -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 1px solid #E8ECF0;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1A202C;">Shipping Address</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <p style="margin: 0; font-size: 16px; color: #1A202C; line-height: 1.6;">
                      <span style="font-weight: 600;">${order.shippingAddress.name}</span><br>
                      ${order.shippingAddress.street}<br>
                      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
                      ${order.shippingAddress.country}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding: 30px; background-color: #F5F7FA; border-radius: 8px; text-align: center;">
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