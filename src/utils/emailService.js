import featureConfig from './featureConfig';

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

/**
 * Base Email Template Wrapper
 * Provides a consistent, world-class design for all KamiKoto emails.
 * 
 * @param {Object} options - Template options
 * @param {string} options.title - Page title
 * @param {string} options.previewText - Hidden preview text for email clients
 * @param {string} options.content - Main HTML content
 * @returns {string} - Complete HTML email
 */
const generateBaseEmailTemplate = ({ title, previewText, content }) => {
  const currentYear = new Date().getFullYear();
  const logoUrl = 'https://kamikoto.click/kamikoto-logo-transparent-darkish-logo-for-better-visibility.png';
  const siteUrl = 'https://kamikoto.click';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Font Imports */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* Reset Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }

    /* Peak 2020 Design System - Email Edition */
    .email-container { max-width: 600px !important; margin: 0 auto !important; width: 100% !important; }
    .glass-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
    .header { padding: 40px 0; text-align: center; }
    .footer { padding: 40px 20px; text-align: center; color: #64748b; font-size: 13px; line-height: 1.6; }
    .footer a { color: #0f172a; text-decoration: underline; font-weight: 500; }
    .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; transition: all 0.2s ease; mso-padding-alt: 0; text-align: center; }
    .secondary-btn { display: inline-block; background-color: #f1f5f9; color: #0f172a !important; font-size: 14px; font-weight: 500; text-decoration: none; padding: 10px 20px; border-radius: 8px; }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 10px !important; }
      .glass-card { border-radius: 12px !important; }
      .mobile-padding { padding: 20px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body>
  <!-- Hidden Preview Text -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${previewText}
  </div>

  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <a href="${siteUrl}" target="_blank">
              <img src="${logoUrl}" alt="KamiKoto" width="160" style="display: block; margin: 0 auto; width: 160px;">
            </a>
          </div>

          <!-- Main Content Card -->
          <div class="glass-card">
            ${content}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin-bottom: 20px; font-weight: 600; color: #0f172a; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">
              KamiKoto Stationeries Pvt. Ltd.
            </p>
            <p style="margin-bottom: 8px;">
              North Sentinel Island, Andaman and Nicobar Islands, India
            </p>
            <p style="margin-bottom: 24px;">
              Email: <a href="mailto:support@kamikoto.click">support@kamikoto.click</a> • Phone: <a href="tel:+91180069696969">+91 1800 6969 6969</a>
            </p>
            
            <div style="height: 1px; background-color: #e2e8f0; margin: 24px 0;"></div>
            
            <p style="margin-bottom: 8px; font-size: 12px;">
              This is a transactional email regarding your account activity at <a href="${siteUrl}">${siteUrl.replace('https://', '')}</a>.
            </p>
            <p style="margin-bottom: 0; font-size: 12px; color: #94a3b8;">
              © ${currentYear} KamiKoto Stationeries Pvt. Ltd. All rights reserved.
            </p>
            
            <!-- Anti-Spam Compliance -->
            <p style="margin-top: 16px; font-size: 11px; color: #cbd5e1;">
              You are receiving this because you signed up for an account or made a purchase at KamiKoto.
              <br>To ensure delivery, add <strong>hello@mailer.kamikoto.click</strong> to your address book.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Generates HTML content for order confirmation emails
 */
const generateOrderConfirmationHTML = (order, user) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const itemsHTML = order.items.map((item) => {
    const processedImageUrl = processImageForEmail(item.image);
    return `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="64" style="vertical-align: top;">
              ${processedImageUrl ? 
                `<img src="${processedImageUrl}" alt="${item.name}" width="64" height="64" style="border-radius: 8px; border: 1px solid #f1f5f9; object-fit: cover;">` :
                `<div style="width: 64px; height: 64px; border-radius: 8px; background: #f8fafc; border: 1px solid #f1f5f9;"></div>`
              }
            </td>
            <td style="padding-left: 16px; vertical-align: top;">
              <p style="margin: 0; font-weight: 600; font-size: 14px; color: #0f172a;">${item.name}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Qty: ${item.quantity} • ${formatCurrency(item.price)}</p>
            </td>
            <td align="right" style="vertical-align: top;">
              <p style="margin: 0; font-weight: 600; font-size: 14px; color: #0f172a;">${formatCurrency(item.price * item.quantity)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `}).join('');

  const content = `
    <div style="padding: 40px 32px;" class="mobile-padding">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 12px; background-color: #f0fdf4; border-radius: 50%; margin-bottom: 16px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.025em;">Order Confirmed!</h1>
        <p style="margin: 8px 0 0; font-size: 16px; color: #64748b;">Thanks for shopping with us, ${user.displayName || user.userName || 'Customer'}.</p>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Order Number</p>
              <p style="margin: 4px 0 0; font-size: 16px; font-weight: 700; color: #0f172a;">#${order.orderId}</p>
            </td>
            <td align="right">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Order Date</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 500; color: #0f172a;">${new Date(order.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </td>
          </tr>
        </table>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #0f172a;">Items in your order</h2>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
        ${itemsHTML}
      </table>

      <div style="margin-top: 24px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding-bottom: 8px; font-size: 14px; color: #64748b;">Subtotal</td>
            <td align="right" style="padding-bottom: 8px; font-size: 14px; color: #0f172a;">${formatCurrency(order.subtotal || 0)}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 8px; font-size: 14px; color: #64748b;">Shipping</td>
            <td align="right" style="padding-bottom: 8px; font-size: 14px; color: #0f172a;">${order.shipping?.cost === 0 ? 'Free' : formatCurrency(order.shipping?.cost || 0)}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 8px; font-size: 14px; color: #64748b;">Tax (GST)</td>
            <td align="right" style="padding-bottom: 8px; font-size: 14px; color: #0f172a;">${formatCurrency(order.tax || 0)}</td>
          </tr>
          ${order.discount > 0 ? `
          <tr>
            <td style="padding-bottom: 8px; font-size: 14px; color: #16a34a; font-weight: 500;">Discount</td>
            <td align="right" style="padding-bottom: 8px; font-size: 14px; color: #16a34a; font-weight: 500;">-${formatCurrency(order.discount)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 18px; font-weight: 700; color: #0f172a;">Total</td>
            <td align="right" style="padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 18px; font-weight: 700; color: #0f172a;">${formatCurrency(order.totalAmount || 0)}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 40px; text-align: center;">
        <a href="https://kamikoto.click/account/orders" class="btn">View Order Status</a>
      </div>

      <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 32px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="50%" style="vertical-align: top; padding-right: 16px;" class="mobile-stack">
              <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Shipping Address</h3>
              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                ${order.shippingAddress?.name || user.displayName || 'Customer'}<br>
                ${order.shippingAddress?.street || ''}<br>
                ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zip || ''}<br>
                ${order.shippingAddress?.country || ''}
              </p>
            </td>
            <td width="50%" style="vertical-align: top; padding-top: 24px;" class="mobile-stack">
              <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Payment Info</h3>
              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                Method: ${order.payment?.method || 'Credit/Debit Card'}<br>
                Status: <span style="color: #16a34a; font-weight: 600;">Paid</span>
              </p>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  return generateBaseEmailTemplate({
    title: `Order Confirmation #${order.orderId}`,
    previewText: `Your order #${order.orderId} from KamiKoto has been confirmed and is being processed.`,
    content
  });
};

/**
 * Generates HTML content for order shipped emails
 */
const generateOrderShippedHTML = (order, user, shipmentInfo) => {
  const itemsHTML = order.items.map((item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <p style="margin: 0; font-weight: 500; font-size: 14px; color: #0f172a;">${item.name} <span style="color: #64748b; font-weight: 400;">(x${item.quantity})</span></p>
      </td>
    </tr>
  `).join('');

  const content = `
    <div style="padding: 40px 32px;" class="mobile-padding">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 12px; background-color: #eff6ff; border-radius: 50%; margin-bottom: 16px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10L2 13V19H22V13L19 10M5 10V5H19V10M5 10H19M8 19V21M16 19V21" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.025em;">Your Order Shipped!</h1>
        <p style="margin: 8px 0 0; font-size: 16px; color: #64748b;">Great news! Your package is on its way.</p>
      </div>

      <div style="background-color: #0f172a; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
        <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Tracking Number</p>
        <p style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #ffffff;">${shipmentInfo.trackingNumber}</p>
        <a href="${shipmentInfo.trackingUrl || '#'}" class="btn" style="background-color: #ffffff; color: #0f172a !important;">Track Package</a>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
        <div style="padding: 16px 20px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Shipment Details</h3>
        </div>
        <div style="padding: 20px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-bottom: 12px;">
                <p style="margin: 0; font-size: 12px; color: #64748b;">Carrier</p>
                <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #0f172a;">${shipmentInfo.carrier}</p>
              </td>
              <td align="right" style="padding-bottom: 12px;">
                <p style="margin: 0; font-size: 12px; color: #64748b;">Est. Delivery</p>
                <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #0f172a;">${shipmentInfo.estimatedDeliveryDate}</p>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #0f172a;">Items in this shipment</h2>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 32px;">
        ${itemsHTML}
      </table>

      <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px;">
        <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">
          Note: Tracking information may take up to 24 hours to update on the carrier's website.
        </p>
      </div>
    </div>
  `;

  return generateBaseEmailTemplate({
    title: `Order #${order.orderId} Shipped`,
    previewText: `Your KamiKoto order #${order.orderId} has been shipped via ${shipmentInfo.carrier}.`,
    content
  });
};

/**
 * Generates HTML content for magic link authentication emails
 */
const generateMagicLinkHTML = (email, magicLink) => {
  const content = `
    <div style="padding: 48px 40px;" class="mobile-padding">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 7C15 5.34315 13.6569 4 12 4C10.3431 4 9 5.34315 9 7V10H15V7Z" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="5" y="10" width="14" height="10" rx="2" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0f172a; letter-spacing: -0.025em;">Sign In to KamiKoto</h1>
        <p style="margin: 12px 0 0; font-size: 16px; color: #64748b; line-height: 1.6;">Click the button below to securely access your account. This link is for <strong>${email}</strong> and will expire soon.</p>
      </div>

      <div style="text-align: center; margin-bottom: 40px;">
        <a href="${magicLink}" class="btn" style="min-width: 200px;">Sign In to My Account</a>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="24" style="vertical-align: top;">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="#92400e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </td>
            <td style="padding-left: 12px;">
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #92400e;">Security Notice</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #b45309; line-height: 1.5;">If you didn't request this email, you can safely ignore it. Your account is secure.</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 32px;">
        <p style="margin: 0 0 12px; font-size: 14px; color: #64748b; text-align: center;">Button not working? Copy and paste this URL:</p>
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 12px; word-break: break-all; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #475569; line-height: 1.4;">
          ${magicLink}
        </div>
      </div>
    </div>
  `;

  return generateBaseEmailTemplate({
    title: 'Sign In to KamiKoto',
    previewText: 'Use this magic link to sign in to your KamiKoto account securely.',
    content
  });
};

/**
 * Main Email Service Interface
 */

const getApiFunctionBaseUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    return 'https://kamikoto.click/api';
  } else {
    return '/api';
  }
};

const isEmailEnabled = () => {
  return featureConfig.email.enabled;
};

const sendEmail = async (emailData) => {
  if (!isEmailEnabled()) return { success: false, error: 'Email disabled' };
  
  try {
    const fromEmail = emailData.from || featureConfig.email.fromAddress;
    // World Class "From" label
    const formattedFrom = `KamiKoto Stationeries <${fromEmail}>`;
    
    const emailPayload = {
      from: formattedFrom,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.body,
    };
    
    const apiEndpoint = `${getApiFunctionBaseUrl()}/send-email`;
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });
    
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error?.message || 'Failed to send');
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in sendEmail:', error);
    return { success: false, error: error.message };
  }
};

const sendOrderConfirmationEmail = async (order, user) => {
  if (!user?.email || !order?.orderId || !isEmailEnabled()) return { success: false };
  try {
    const emailBody = generateOrderConfirmationHTML(order, user);
    return await sendEmail({
      to: user.email,
      subject: `Order Confirmed: #${order.orderId} at KamiKoto`,
      body: emailBody,
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendOrderShippedEmail = async (order, user, shipmentInfo) => {
  if (!user?.email || !order?.orderId || !shipmentInfo || !isEmailEnabled()) return { success: false };
  try {
    const emailBody = generateOrderShippedHTML(order, user, shipmentInfo);
    return await sendEmail({
      to: user.email,
      subject: `Shipped: Your KamiKoto Order #${order.orderId} is on its way`,
      body: emailBody,
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendMagicLinkEmail = async (email, magicLink) => {
  if (!email || !magicLink || !isEmailEnabled()) return { success: false };
  try {
    const emailBody = generateMagicLinkHTML(email, magicLink);
    return await sendEmail({
      to: email,
      subject: 'Sign in to KamiKoto',
      body: emailBody,
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendMagicLinkEmail,
  isEmailEnabled,
  sendEmail
};