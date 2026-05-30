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
    case 'packed':
      return `Packed: ${productPart}`;
    case 'shipped':
      return `Shipped: ${productPart}`;
    case 'delivered':
      return `Delivered: ${productPart}`;
    default:
      return productPart;
  }
};

/**
 * Generate order progress bar HTML for emails
 * @param {string} status - Current order status
 * @returns {string} - Interactive progress bar HTML
 */
const generateStatusBarHTML = (status) => {
  let currentStep = 1; // Default to Confirmed
  if (['Placed', 'Approved', 'Paid'].includes(status)) currentStep = 1;
  else if (status === 'Packed') currentStep = 2;
  else if (status === 'Shipped') currentStep = 3;
  else if (status === 'Delivered') currentStep = 4;

  const activeColor = '#0f172a'; // Corporate Slate-900
  const inactiveColor = '#cbd5e1'; // Slate-300
  const connectorActive = '#0f172a';
  const connectorInactive = '#e2e8f0';

  return `
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 24px 0 32px; padding: 0 8px;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; max-width: 480px;">
            <tr>
              <!-- Step 1: Confirmed -->
              <td align="center" style="width: 25%; vertical-align: top;">
                <div style="font-size: 10px; font-weight: 700; color: ${currentStep >= 1 ? activeColor : inactiveColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-family: 'Inter', -apple-system, sans-serif;">
                  Confirmed
                </div>
                <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" style="width: 18px; height: 18px; border-radius: 50%; background-color: ${currentStep >= 1 ? activeColor : inactiveColor}; color: #ffffff; font-size: 9px; font-weight: 900; line-height: 18px; font-family: sans-serif;">
                      ✓
                    </td>
                  </tr>
                </table>
              </td>

              <!-- Connector 1 -->
              <td style="vertical-align: middle; padding-top: 16px;">
                <div style="height: 2px; background-color: ${currentStep >= 2 ? connectorActive : connectorInactive}; font-size: 1px; line-height: 1px;">&nbsp;</div>
              </td>

              <!-- Step 2: Packed -->
              <td align="center" style="width: 25%; vertical-align: top;">
                <div style="font-size: 10px; font-weight: 700; color: ${currentStep >= 2 ? activeColor : inactiveColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-family: 'Inter', -apple-system, sans-serif;">
                  Packed
                </div>
                <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" style="width: 18px; height: 18px; border-radius: 50%; background-color: ${currentStep >= 2 ? activeColor : inactiveColor}; color: #ffffff; font-size: 9px; font-weight: 900; line-height: 18px; font-family: sans-serif;">
                      ${currentStep >= 2 ? '✓' : '2'}
                    </td>
                  </tr>
                </table>
              </td>

              <!-- Connector 2 -->
              <td style="vertical-align: middle; padding-top: 16px;">
                <div style="height: 2px; background-color: ${currentStep >= 3 ? connectorActive : connectorInactive}; font-size: 1px; line-height: 1px;">&nbsp;</div>
              </td>

              <!-- Step 3: Shipped -->
              <td align="center" style="width: 25%; vertical-align: top;">
                <div style="font-size: 10px; font-weight: 700; color: ${currentStep >= 3 ? activeColor : inactiveColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-family: 'Inter', -apple-system, sans-serif;">
                  Shipped
                </div>
                <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" style="width: 18px; height: 18px; border-radius: 50%; background-color: ${currentStep >= 3 ? activeColor : inactiveColor}; color: #ffffff; font-size: 9px; font-weight: 900; line-height: 18px; font-family: sans-serif;">
                      ${currentStep >= 3 ? '✓' : '3'}
                    </td>
                  </tr>
                </table>
              </td>

              <!-- Connector 3 -->
              <td style="vertical-align: middle; padding-top: 16px;">
                <div style="height: 2px; background-color: ${currentStep >= 4 ? connectorActive : connectorInactive}; font-size: 1px; line-height: 1px;">&nbsp;</div>
              </td>

              <!-- Step 4: Delivered -->
              <td align="center" style="width: 25%; vertical-align: top;">
                <div style="font-size: 10px; font-weight: 700; color: ${currentStep >= 4 ? activeColor : inactiveColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-family: 'Inter', -apple-system, sans-serif;">
                  Delivered
                </div>
                <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" style="width: 18px; height: 18px; border-radius: 50%; background-color: ${currentStep >= 4 ? activeColor : inactiveColor}; color: #ffffff; font-size: 9px; font-weight: 900; line-height: 18px; font-family: sans-serif;">
                      ${currentStep >= 4 ? '✓' : '4'}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Base Email Template — Clean, minimal, professional
 * Uses text-based "KamiKoto." branding (matching storefront style)
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
      font-size: 13px; 
      font-weight: 700; 
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-decoration: none; 
      padding: 14px 28px; 
      border-radius: 8px; 
      text-align: center;
    }

    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-padding { padding: 24px 0 !important; }
      .col-stack { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 16px !important; }
      .email-container > div { padding-left: 0 !important; padding-right: 0 !important; }
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
          
          <!-- Header: Text-based KamiKoto branding -->
          <div style="padding: 24px 24px 16px; text-align: center;">
            <a href="${siteUrl}" target="_blank" style="text-decoration: none;">
              <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 26px; font-weight: 900; letter-spacing: -0.05em; color: #0f172a;">KamiKoto</span><span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 26px; font-weight: 900; color: #94a3b8;">.</span>
            </a>
          </div>

          <!-- Main Content Card -->
          <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03); border: 1px solid #e2e8f0;">
            ${content}
          </div>

          <!-- Minimal Footer (Anti-Spam Compliant) -->
          <div style="padding: 32px 24px; text-align: center;">
            <p style="margin: 0 0 6px; font-size: 11px; color: #94a3b8; line-height: 1.5; font-weight: 500; font-family: 'Inter', sans-serif;">
              © ${currentYear} KamiKoto Stationeries Pvt. Ltd.
            </p>
            <p style="margin: 0 0 12px; font-size: 10px; color: #cbd5e1; line-height: 1.4; font-family: 'Inter', sans-serif;">
              North Sentinel Island, Andaman and Nicobar Islands, India
            </p>
            <p style="margin: 0; font-size: 11px; color: #64748b; font-family: 'Inter', sans-serif;">
              <a href="${siteUrl}" style="color: #64748b; text-decoration: none; font-weight: 600;">Website</a>
              <span style="color: #cbd5e1; margin: 0 8px;">•</span>
              <a href="${siteUrl}/account/orders" style="color: #64748b; text-decoration: none; font-weight: 600;">Track Order</a>
              <span style="color: #cbd5e1; margin: 0 8px;">•</span>
              <a href="mailto:support@kamikoto.click" style="color: #64748b; text-decoration: none; font-weight: 600;">Support Desk</a>
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
 * Generates unified, elegant HTML content for order transactional status emails
 */
const generateOrderStatusHTML = (order, status, shipmentInfo = {}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const isUS = order.shipping?.address?.country === 'United States';
  const displayImportDuty = isUS && order.importDuty > 0;
  
  // Format items with high-quality styled tables
  const itemsHTML = (order.items || []).map((item) => {
    const processedImageUrl = processImageForEmail(item.image);
    return `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="56" style="vertical-align: top;">
              ${processedImageUrl ? 
                `<img src="${processedImageUrl}" alt="${item.name}" width="56" height="56" style="border-radius: 8px; border: 1px solid #f1f5f9; object-fit: cover; display: block;">` :
                `<div style="width: 56px; height: 56px; border-radius: 8px; background: #f8fafc; border: 1px solid #f1f5f9; display: block;"></div>`
              }
            </td>
            <td style="padding-left: 16px; vertical-align: top;">
              <p style="margin: 0 0 4px; font-weight: 600; font-size: 14px; color: #0f172a; font-family: 'Inter', sans-serif;">${item.name}</p>
              <p style="margin: 0; font-size: 12px; color: #64748b; font-family: 'Inter', sans-serif;">Qty: ${item.quantity} × ${formatCurrency(item.price)}</p>
            </td>
            <td align="right" style="vertical-align: top;">
              <p style="margin: 0; font-weight: 600; font-size: 14px; color: #0f172a; font-family: 'Inter', sans-serif;">${formatCurrency(item.price * item.quantity)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `}).join('');

  // Extract address details
  const addr = order.shipping?.address || {};
  const formattedAddress = `
    ${addr.houseNo ? addr.houseNo + ', ' : ''}
    ${addr.line1 ? addr.line1 + '<br>' : ''}
    ${addr.line2 ? addr.line2 + '<br>' : ''}
    ${addr.city ? addr.city + ', ' : ''}${addr.state ? addr.state : ''}
    ${addr.country ? '<br>' + addr.country : ''}${addr.pin ? ' - ' + addr.pin : ''}
  `;

  // Standardized Identifiers
  const standardizedTransactionID = (order.payment?.transactionId || order.orderId || order.id || '').substring(0, 10).toUpperCase();
  const standardizedOrderID = order.orderId || order.id || '';

  // Header callout text per status
  let statusBadgeColor = '#f0fdf4';
  let statusStrokeColor = '#16a34a';
  let statusTitle = 'Order Confirmed';
  let statusSubtitle = 'Thanks for your purchase! Your payment has been successfully processed.';

  if (status === 'Packed') {
    statusBadgeColor = '#f8fafc';
    statusStrokeColor = '#475569';
    statusTitle = 'Order Packed';
    statusSubtitle = 'Your order is securely packed and prepared for dispatch.';
  } else if (status === 'Shipped') {
    statusBadgeColor = '#eff6ff';
    statusStrokeColor = '#3b82f6';
    statusTitle = 'Order Shipped';
    statusSubtitle = 'Great news! Your package has been handed to our delivery partner.';
  } else if (status === 'Delivered') {
    statusBadgeColor = '#f0fdf4';
    statusStrokeColor = '#16a34a';
    statusTitle = 'Order Delivered';
    statusSubtitle = 'Delivered successfully! We hope you love your premium stationeries.';
  }

  // Carrier tracking code / URL
  const showTrackingSection = status === 'Shipped' && (shipmentInfo.trackingNumber || order.tracking?.code);
  const trackingNumber = shipmentInfo.trackingNumber || order.tracking?.code || '';
  const carrierName = shipmentInfo.carrier || order.tracking?.carrier || 'Standard Shipping';
  const trackingUrl = shipmentInfo.trackingUrl || order.tracking?.url || 'https://kamikoto.click/account/orders';

  const content = `
    <div style="padding: 32px 32px;" class="mobile-padding">
      <!-- Status Icon & Title -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 12px; background-color: ${statusBadgeColor}; border-radius: 50%; margin-bottom: 12px;">
          ${status === 'Shipped' ? `
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${statusStrokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          ` : status === 'Packed' ? `
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${statusStrokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          ` : status === 'Delivered' ? `
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${statusStrokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ` : `
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${statusStrokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `}
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; font-family: 'Inter', sans-serif;">${statusTitle}</h1>
        <p style="margin: 8px 0 0; font-size: 14px; color: #64748b; font-family: 'Inter', sans-serif; line-height: 1.5; max-width: 440px; display: inline-block;">${statusSubtitle}</p>
      </div>

      <!-- Dynamic Progress Bar -->
      ${generateStatusBarHTML(status)}

      <!-- Shipped/Tracking Callout Card -->
      ${showTrackingSection ? `
        <div style="background: #0f172a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(15,23,42,0.15);">
          <p style="margin: 0 0 6px; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Inter', sans-serif;">Carrier: ${carrierName}</p>
          <p style="margin: 0 0 6px; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Inter', sans-serif;">Tracking Number</p>
          <p style="margin: 0 0 20px; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.05em; font-family: monospace;">${trackingNumber}</p>
          <a href="${trackingUrl}" class="btn" style="background: #ffffff; color: #0f172a !important; font-size: 12px; padding: 12px 24px; border-radius: 6px;">Track Shipment</a>
        </div>
      ` : ''}

      <!-- Order Identifiers Grid -->
      <div style="background-color: #f8fafc; border-radius: 10px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <p style="margin: 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Inter', sans-serif;">Order ID</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'Inter', sans-serif;">#${standardizedOrderID}</p>
            </td>
            <td align="right" style="vertical-align: top; width: 50%;">
              <p style="margin: 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Inter', sans-serif;">Date</p>
              <p style="margin: 4px 0 0; font-size: 13px; font-weight: 600; color: #0f172a; font-family: 'Inter', sans-serif;">${new Date(order.orderDate || order.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Address Grid (Shipping & Billing) -->
      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
        <tr>
          <td class="col-stack" style="width: 50%; vertical-align: top; padding-right: 12px;">
            <div style="background: #f8fafc; border-radius: 10px; padding: 16px; border: 1px solid #e2e8f0; height: 100%;">
              <h3 style="margin: 0 0 10px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Inter', sans-serif;">Shipping Address</h3>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #0f172a; font-family: 'Inter', sans-serif; margin-bottom: 4px;">${order.userName || 'Customer'}</p>
              <p style="margin: 0; font-size: 12px; color: #475569; font-family: 'Inter', sans-serif; line-height: 1.5;">${formattedAddress}</p>
              ${order.userPhone ? `<p style="margin: 6px 0 0; font-size: 11px; color: #64748b; font-family: 'Inter', sans-serif;">Phone: ${order.userPhone}</p>` : ''}
            </div>
          </td>
          <td class="col-stack" style="width: 50%; vertical-align: top; padding-left: 12px;">
            <div style="background: #f8fafc; border-radius: 10px; padding: 16px; border: 1px solid #e2e8f0; height: 100%;">
              <h3 style="margin: 0 0 10px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Inter', sans-serif;">Billing & Payment</h3>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #0f172a; font-family: 'Inter', sans-serif; margin-bottom: 4px;">${order.userName || 'Customer'}</p>
              <p style="margin: 0; font-size: 11px; color: #475569; font-family: 'Inter', sans-serif; line-height: 1.5; margin-bottom: 8px;">Billing matches shipping address.</p>
              <div style="font-size: 11px; color: #475569; font-family: 'Inter', sans-serif;">
                <strong>Method:</strong> ${(order.payment?.method === 'Razorpay' || order.payment?.method === 'Card') ? 'Razorpay' : (order.payment?.method || 'Razorpay')}<br>
                <strong>Transaction ID:</strong> <span style="font-family: monospace;">${standardizedTransactionID}</span>
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- US Import Duty Notice if applicable -->
      ${displayImportDuty ? `
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 12px; font-weight: 700; color: #b45309; font-family: 'Inter', sans-serif; margin-bottom: 4px;">US Import Duty Compliant</p>
          <p style="margin: 0; font-size: 11px; color: #b45309; font-family: 'Inter', sans-serif; line-height: 1.4;">A compliance import duty of 69% has been added to cover regional delivery custom taxes.</p>
        </div>
      ` : ''}

      <!-- Items Section -->
      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px;">
        <tr>
          <td style="padding-bottom: 8px; border-bottom: 2px solid #0f172a;">
            <span style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Inter', sans-serif;">Purchased Item(s)</span>
          </td>
        </tr>
        ${itemsHTML}
      </table>

      <!-- Financial Calculations Card -->
      <div style="background-color: #f8fafc; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding-bottom: 8px; font-size: 12px; color: #64748b; font-family: 'Inter', sans-serif;">Subtotal</td>
            <td align="right" style="padding-bottom: 8px; font-size: 12px; color: #0f172a; font-weight: 600; font-family: 'Inter', sans-serif;">${formatCurrency(order.subtotal)}</td>
          </tr>
          
          <!-- GST Tax Row -->
          <tr>
            <td style="padding-bottom: 8px; font-size: 12px; color: #64748b; font-family: 'Inter', sans-serif;">GST (18% Inclusive)</td>
            <td align="right" style="padding-bottom: 8px; font-size: 12px; color: #0f172a; font-weight: 600; font-family: 'Inter', sans-serif;">${formatCurrency(order.tax)}</td>
          </tr>

          <!-- Import Duty Row if US -->
          ${displayImportDuty ? `
          <tr>
            <td style="padding-bottom: 8px; font-size: 12px; color: #d97706; font-family: 'Inter', sans-serif;">Import Duty (69%)</td>
            <td align="right" style="padding-bottom: 8px; font-size: 12px; color: #d97706; font-weight: 600; font-family: 'Inter', sans-serif;">${formatCurrency(order.importDuty)}</td>
          </tr>
          ` : ''}

          <!-- Coupon Discount Row -->
          ${order.coupon ? `
          <tr>
            <td style="padding-bottom: 8px; font-size: 12px; color: #16a34a; font-weight: 600; font-family: 'Inter', sans-serif;">Discount (${order.coupon.code})</td>
            <td align="right" style="padding-bottom: 8px; font-size: 12px; color: #16a34a; font-weight: 600; font-family: 'Inter', sans-serif;">-${formatCurrency(order.coupon.discountAmount || order.discount || 0)}</td>
          </tr>
          ` : order.discount > 0 ? `
          <tr>
            <td style="padding-bottom: 8px; font-size: 12px; color: #16a34a; font-weight: 600; font-family: 'Inter', sans-serif;">Discount</td>
            <td align="right" style="padding-bottom: 8px; font-size: 12px; color: #16a34a; font-weight: 600; font-family: 'Inter', sans-serif;">-${formatCurrency(order.discount)}</td>
          </tr>
          ` : ''}

          <!-- Shipping Cost -->
          <tr>
            <td style="padding-bottom: 12px; font-size: 12px; color: #64748b; font-family: 'Inter', sans-serif;">Shipping</td>
            <td align="right" style="padding-bottom: 12px; font-size: 12px; color: #0f172a; font-weight: 600; font-family: 'Inter', sans-serif;">${order.shipping?.cost === 0 ? 'Free' : formatCurrency(order.shipping?.cost)}</td>
          </tr>

          <!-- Total Amount -->
          <tr>
            <td style="padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 16px; font-weight: 800; color: #0f172a; font-family: 'Inter', sans-serif;">Total Amount Paid</td>
            <td align="right" style="padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 16px; font-weight: 800; color: #0f172a; font-family: 'Inter', sans-serif;">${formatCurrency(order.totalAmount || order.total || 0)}</td>
          </tr>
        </table>
      </div>

      <!-- Action Button to View Order Status -->
      <div style="margin-top: 32px; text-align: center;">
        <a href="https://kamikoto.click/account/orders" class="btn" style="color: #ffffff !important;">View Order Details</a>
      </div>
    </div>
  `;

  return generateBaseEmailTemplate({
    title: generateEmailSubject(order, status.toLowerCase()),
    previewText: `Your KamiKoto order is now ${status.toLowerCase()}.`,
    content
  });
};

/**
 * Generates HTML content for magic link authentication emails
 */
const generateMagicLinkHTML = (email, magicLink) => {
  const content = `
    <div style="padding: 48px 32px; text-align: center;" class="mobile-padding">
      <div style="margin-bottom: 28px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; font-family: 'Inter', sans-serif;">Sign In to KamiKoto</h1>
        <p style="margin: 12px 0 0; font-size: 14px; color: #64748b; line-height: 1.5; font-family: 'Inter', sans-serif; max-width: 400px; display: inline-block;">
          Click the secure button below to sign in as <strong>${email}</strong>. This request will expire shortly.
        </p>
      </div>

      <div style="margin-bottom: 32px;">
        <a href="${magicLink}" class="btn" style="min-width: 220px; color: #ffffff !important;">Secure Sign In</a>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; text-align: left; max-width: 440px; display: inline-block;">
        <p style="margin: 0; font-size: 12px; color: #b45309; line-height: 1.5; font-family: 'Inter', sans-serif;">
          <strong>Security Notice:</strong> If you did not initiate this authentication request, you can safely ignore this email. No changes have been made to your account.
        </p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 20px; max-width: 440px; display: inline-block; width: 100%;">
        <p style="margin: 0 0 8px; font-size: 11px; color: #94a3b8; font-family: 'Inter', sans-serif;">Button not working? Copy and paste this URL into your browser:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; word-break: break-all; font-family: monospace; font-size: 10px; color: #475569; text-align: left;">
          ${magicLink}
        </div>
      </div>
    </div>
  `;

  return generateBaseEmailTemplate({
    title: 'Sign In to KamiKoto',
    previewText: 'Use this secure magic link to sign in to your KamiKoto account.',
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
 */
const sendOrderConfirmationEmail = async (order, user) => {
  if (!user?.email || !order || !isEmailEnabled()) return { success: false };
  
  const orderId = order.orderId || order.id || '';
  const dedupKey = `order-confirm-${orderId}`;
  
  // Persistent check across page refreshes
  try {
    if (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem(`order_email_sent_${orderId}`) === 'true') {
      console.warn(`⚠️ emailService: BLOCKED duplicate email via localStorage for order ${orderId}`);
      return { success: true, data: { deduplicated: true } };
    }
  } catch (storageError) {
    console.warn('⚠️ emailService: Failed to access localStorage:', storageError);
  }

  if (isDuplicateEmail(dedupKey)) {
    console.warn(`⚠️ emailService: BLOCKED duplicate email for ${dedupKey}`);
    return { success: true, data: { deduplicated: true } };
  }
  
  try {
    const emailBody = generateOrderStatusHTML(order, 'Placed');
    const result = await sendEmail({
      to: user.email,
      subject: generateEmailSubject(order, 'confirmation'),
      body: emailBody,
    });
    
    if (result.success) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(`order_email_sent_${orderId}`, 'true');
        }
      } catch (storageError) {
        console.warn('⚠️ emailService: Failed to write to localStorage:', storageError);
      }
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Send order shipped email WITH deduplication guard
 */
const sendOrderShippedEmail = async (order, user, shipmentInfo = {}) => {
  if (!user?.email || !order || !isEmailEnabled()) return { success: false };
  
  const orderId = order.orderId || order.id || '';
  const dedupKey = `order-shipped-${orderId}`;
  if (isDuplicateEmail(dedupKey)) {
    console.warn(`⚠️ emailService: BLOCKED duplicate shipped email for ${dedupKey}`);
    return { success: true, data: { deduplicated: true } };
  }
  
  try {
    const emailBody = generateOrderStatusHTML(order, 'Shipped', shipmentInfo);
    return await sendEmail({
      to: user.email,
      subject: generateEmailSubject(order, 'shipped'),
      body: emailBody,
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Send magic link email WITH deduplication guard
 */
const sendMagicLinkEmail = async (email, magicLink) => {
  if (!email || !magicLink || !isEmailEnabled()) return { success: false };
  
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
  generateEmailSubject,
  generateOrderStatusHTML
};