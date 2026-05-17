import featureConfig from './featureConfig';

/**
 * Email Deduplication Guard
 * Prevents the same email from being sent multiple times within a short window.
 * This is the PRIMARY defense against email spam loops.
 */
const EMAIL_DEDUP_CACHE = new Map();
const EMAIL_DEDUP_TTL = 60000; // 60 seconds - no duplicate emails within this window

const isDuplicateEmail = (key) => {
  const now = Date.now();
  // Clean expired entries
  for (const [k, timestamp] of EMAIL_DEDUP_CACHE.entries()) {
    if (now - timestamp > EMAIL_DEDUP_TTL) EMAIL_DEDUP_CACHE.delete(k);
  }
  if (EMAIL_DEDUP_CACHE.has(key)) return true;
  EMAIL_DEDUP_CACHE.set(key, now);
  return false;
};

/**
 * Process image URL to ensure compatibility with email clients
 * @param {string} imageUrl - Original image URL
 * @returns {string} - Processed image URL optimized for email clients
 */
const processImageForEmail = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.includes('i.imgur.com')) {
    if (!imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return `${imageUrl}.jpg`;
    }
  }
  return imageUrl;
};

/**
 * Generate smart email subject line
 * - 1 product: Product name (char limited to 40)
 * - 2 products: "Product1 & Product2"
 * - 3+ products: "Order #ID - X items"
 */
const generateEmailSubject = (order, type = 'confirmation') => {
  const items = order.items || [];
  const orderId = (order.orderId || order.id || '').slice(-8);
  
  let productPart = '';
  if (items.length === 0) {
    productPart = `Order #${orderId}`;
  } else if (items.length === 1) {
    productPart = items[0].name?.substring(0, 40) || `Order #${orderId}`;
  } else if (items.length === 2) {
    const n1 = (items[0].name || 'Item 1').substring(0, 20);
    const n2 = (items[1].name || 'Item 2').substring(0, 20);
    productPart = `${n1} & ${n2}`;
  } else {
    productPart = `Order #${orderId} — ${items.length} items`;
  }

  switch (type) {
    case 'confirmation':
      return `Confirmed: ${productPart}`;
    case 'shipped':
      return `Shipped: ${productPart}`;
    default:
      return productPart;
  }
};

/**
 * Base Email Template — Clean, minimal, professional
 * Uses text-based "KamiKoto." branding (matching navbar font style)
 * Simplified footer per user request
 */
const generateBaseEmailTemplate = ({ title, previewText, content }) => {
  const currentYear = new Date().getFullYear();
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }

    .email-container { max-width: 600px !important; margin: 0 auto !important; width: 100% !important; }
    
    .btn { 
      display: inline-block; 
      background: #0f172a;
      color: #ffffff !important; 
      font-size: 14px; 
      font-weight: 600; 
      text-decoration: none; 
      padding: 14px 32px; 
      border-radius: 8px; 
      text-align: center;
    }

    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-padding { padding: 20px 16px !important; }
    }
  </style>
</head>
<body>
  <!-- Hidden Preview Text -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${previewText}
  </div>

  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc; padding: 24px 0;">
    <tr>
      <td align="center">
        <div class="email-container">
          
          <!-- Header: Text-based KamiKoto. branding (matches navbar) -->
          <div style="padding: 32px 24px 24px; text-align: center;">
            <a href="${siteUrl}" target="_blank" style="text-decoration: none;">
              <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.05em; color: #0f172a;">KamiKoto</span><span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 28px; font-weight: 900; color: #94a3b8;">.</span>
            </a>
          </div>

          <!-- Main Content Card -->
          <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
            ${content}
          </div>

          <!-- Minimal Footer -->
          <div style="padding: 24px; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              © ${currentYear} KamiKoto Stationeries Pvt. Ltd.
            </p>
            <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
              <a href="${siteUrl}" style="color: #64748b; text-decoration: none;">kamikoto.click</a>
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
            <td width="56" style="vertical-align: top;">
              ${processedImageUrl ? 
                `<img src="${processedImageUrl}" alt="${item.name}" width="56" height="56" style="border-radius: 8px; border: 1px solid #f1f5f9; object-fit: cover;">` :
                `<div style="width: 56px; height: 56px; border-radius: 8px; background: #f8fafc; border: 1px solid #f1f5f9;"></div>`
              }
            </td>
            <td style="padding-left: 16px; vertical-align: top;">
              <p style="margin: 0 0 4px; font-weight: 600; font-size: 14px; color: #0f172a;">${item.name}</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Qty: ${item.quantity} × ${formatCurrency(item.price)}</p>
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
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;">Order Confirmed</h1>
        <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;">Thanks for your purchase, ${user.displayName || user.userName || 'Customer'}.</p>
      </div>

      <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td>
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Order</p>
              <p style="margin: 4px 0 0; font-size: 15px; font-weight: 700; color: #0f172a;">#${(order.orderId || order.id || '').slice(-8)}</p>
            </td>
            <td align="right">
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Date</p>
              <p style="margin: 4px 0 0; font-size: 13px; font-weight: 600; color: #0f172a;">${new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </td>
          </tr>
        </table>
      </div>

      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
        ${itemsHTML}
      </table>

      <div style="margin-top: 24px; background-color: #f8fafc; border-radius: 12px; padding: 20px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding-bottom: 8px; font-size: 13px; color: #64748b;">Subtotal</td>
            <td align="right" style="padding-bottom: 8px; font-size: 13px; color: #0f172a; font-weight: 600;">${formatCurrency(order.subtotal || 0)}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 8px; font-size: 13px; color: #64748b;">Shipping</td>
            <td align="right" style="padding-bottom: 8px; font-size: 13px; color: #0f172a; font-weight: 600;">${order.shipping?.cost === 0 ? 'Free' : formatCurrency(order.shipping?.cost || 0)}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 12px; font-size: 13px; color: #64748b;">Tax</td>
            <td align="right" style="padding-bottom: 12px; font-size: 13px; color: #0f172a; font-weight: 600;">${formatCurrency(order.tax || 0)}</td>
          </tr>
          ${order.discount > 0 ? `
          <tr>
            <td style="padding-bottom: 12px; font-size: 13px; color: #16a34a; font-weight: 600;">Discount</td>
            <td align="right" style="padding-bottom: 12px; font-size: 13px; color: #16a34a; font-weight: 600;">-${formatCurrency(order.discount)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 16px; font-weight: 800; color: #0f172a;">Total</td>
            <td align="right" style="padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 16px; font-weight: 800; color: #0f172a;">${formatCurrency(order.totalAmount || 0)}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 32px; text-align: center;">
        <a href="https://kamikoto.click/account/orders" class="btn">View Order</a>
      </div>
    </div>
  `;

  return generateBaseEmailTemplate({
    title: generateEmailSubject(order, 'confirmation'),
    previewText: `Your KamiKoto order has been confirmed.`,
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
        <p style="margin: 0; font-weight: 600; font-size: 14px; color: #0f172a;">${item.name} <span style="color: #64748b; font-weight: 400;">(x${item.quantity})</span></p>
      </td>
    </tr>
  `).join('');

  const content = `
    <div style="padding: 40px 32px;" class="mobile-padding">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 12px; background-color: #eff6ff; border-radius: 50%; margin-bottom: 16px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10L2 13V19H22V13L19 10M5 10V5H19V10M5 10H19M8 19V21M16 19V21" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;">Your Order Shipped</h1>
        <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;">Your package is on its way.</p>
      </div>

      <div style="background: #0f172a; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 28px;">
        <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
        <p style="margin: 0 0 20px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">${shipmentInfo.trackingNumber}</p>
        <a href="${shipmentInfo.trackingUrl || '#'}" class="btn" style="background: #ffffff; color: #0f172a !important;">Track Package</a>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td>
              <p style="margin: 0; font-size: 11px; color: #64748b;">Carrier</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 700; color: #0f172a;">${shipmentInfo.carrier}</p>
            </td>
            <td align="right">
              <p style="margin: 0; font-size: 11px; color: #64748b;">Est. Delivery</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 700; color: #0f172a;">${shipmentInfo.estimatedDeliveryDate}</p>
            </td>
          </tr>
        </table>
      </div>

      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
        ${itemsHTML}
      </table>
    </div>
  `;

  return generateBaseEmailTemplate({
    title: generateEmailSubject(order, 'shipped'),
    previewText: `Your KamiKoto order has been shipped via ${shipmentInfo.carrier}.`,
    content
  });
};

/**
 * Generates HTML content for magic link authentication emails
 */
const generateMagicLinkHTML = (email, magicLink) => {
  const content = `
    <div style="padding: 48px 32px;" class="mobile-padding">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;">Sign In to KamiKoto</h1>
        <p style="margin: 12px 0 0; font-size: 14px; color: #64748b; line-height: 1.5;">Click below to sign in as <strong>${email}</strong>. This link expires soon.</p>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${magicLink}" class="btn" style="min-width: 200px;">Sign In</a>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px;">
        <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">If you didn't request this, you can safely ignore it.</p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #94a3b8; text-align: center;">Button not working? Copy this URL:</p>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 12px; word-break: break-all; font-family: monospace; font-size: 11px; color: #475569;">
          ${magicLink}
        </div>
      </div>
    </div>
  `;

  return generateBaseEmailTemplate({
    title: 'Sign In to KamiKoto',
    previewText: 'Use this magic link to sign in to your KamiKoto account.',
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
    const fromEmail = emailData.from || featureConfig.email.fromAddress || 'hello@mailer.kamikoto.click';
    const formattedFrom = `KamiKoto <${fromEmail}>`;
    
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

/**
 * Send order confirmation email WITH deduplication guard
 * This is the ONLY place order confirmation emails should be sent from the storefront.
 */
const sendOrderConfirmationEmail = async (order, user) => {
  if (!user?.email || !order?.orderId || !isEmailEnabled()) return { success: false };
  
  // DEDUP GUARD: Prevent sending the same order confirmation email more than once
  const dedupKey = `order-confirm-${order.orderId || order.id}`;
  if (isDuplicateEmail(dedupKey)) {
    console.warn(`⚠️ emailService: BLOCKED duplicate email for ${dedupKey}`);
    return { success: true, data: { deduplicated: true } };
  }
  
  try {
    const emailBody = generateOrderConfirmationHTML(order, user);
    return await sendEmail({
      to: user.email,
      subject: generateEmailSubject(order, 'confirmation'),
      body: emailBody,
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendOrderShippedEmail = async (order, user, shipmentInfo) => {
  if (!user?.email || !order?.orderId || !shipmentInfo || !isEmailEnabled()) return { success: false };
  
  // DEDUP GUARD
  const dedupKey = `order-shipped-${order.orderId || order.id}`;
  if (isDuplicateEmail(dedupKey)) {
    console.warn(`⚠️ emailService: BLOCKED duplicate shipped email for ${dedupKey}`);
    return { success: true, data: { deduplicated: true } };
  }
  
  try {
    const emailBody = generateOrderShippedHTML(order, user, shipmentInfo);
    return await sendEmail({
      to: user.email,
      subject: generateEmailSubject(order, 'shipped'),
      body: emailBody,
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendMagicLinkEmail = async (email, magicLink) => {
  if (!email || !magicLink || !isEmailEnabled()) return { success: false };
  
  // DEDUP GUARD for magic links
  const dedupKey = `magic-link-${email}`;
  if (isDuplicateEmail(dedupKey)) {
    console.warn(`⚠️ emailService: BLOCKED duplicate magic link for ${dedupKey}`);
    return { success: true, data: { deduplicated: true } };
  }
  
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
  sendEmail,
  generateEmailSubject
};