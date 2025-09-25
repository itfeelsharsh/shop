/**
 * Email Service
 *
 * This utility provides functions for sending various types of emails to users using Resend API via Cloudflare Functions.
 * It checks the featureConfig to determine if emails should be sent.
 */

import featureConfig from "./featureConfig"
// No need for Resend import as we're using server-side functions

/**
 * Get the base URL for the API functions based on the current environment
 * @returns {string} - Base URL for API functions
 */

/**
 * Checks if the email functionality is properly configured and enabled
 * @returns {boolean} - True if email is enabled and properly configured
 */
const isEmailEnabled = () => {
  // Check if email is enabled in the config
  if (!featureConfig.email.enabled) {
    console.log("❌ Email functionality is disabled in configuration")
    console.log("To enable email, set REACT_APP_EMAIL_ENABLED=true in your environment variables")
    return false
  }

  // Log email configuration for debugging
  console.log("📧 Email Configuration Debug:")
  console.log("- Email enabled:", featureConfig.email.enabled)
  console.log("- Use email server:", featureConfig.email.useEmailServer)
  console.log("- From address:", featureConfig.email.fromAddress || "Not set")
  console.log("- Support email:", featureConfig.email.supportEmail || "Not set")

  // Check environment variables more thoroughly
  console.log("🔧 Environment Variables:")
  console.log("- REACT_APP_EMAIL_ENABLED:", process.env.REACT_APP_EMAIL_ENABLED)
  console.log("- EMAIL_ENABLED:", process.env.EMAIL_ENABLED)
  console.log("- REACT_APP_EMAIL_FROM:", process.env.REACT_APP_EMAIL_FROM)
  console.log("- EMAIL_FROM:", process.env.EMAIL_FROM)
  console.log("- REACT_APP_RESEND_API_KEY exists:", !!process.env.REACT_APP_RESEND_API_KEY)
  console.log("- RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)

  return true
}

/**
 * Sends an email using the server API endpoint
 * @param {Object} emailData - Email data including recipient, subject, body, etc.
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendEmail = async (emailData) => {
  console.log("sendEmail function called with:", {
    to: emailData.to,
    subject: emailData.subject,
    bodyLength: emailData.body?.length || 0,
  })

  if (!isEmailEnabled()) {
    console.log("Email functionality is disabled, returning early from sendEmail")
    return { success: false, error: "Email functionality is disabled or not properly configured" }
  }

  try {
    console.log("Using API endpoint method")
    return await sendViaApiEndpoint(emailData)
  } catch (error) {
    console.error("Error in sendEmail function:", error)
    return { success: false, error: error.message || "Failed to send email" }
  }
}

/**
 * Sends an email using our server API endpoint instead of calling Resend directly
 * This avoids CORS issues when calling from the client side
 *
 * @param {Object} emailData - Email data
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendViaApiEndpoint = async (emailData) => {
  try {
    console.log("[v0] Attempting to send email via API endpoint with data:", {
      to: emailData.to,
      subject: emailData.subject,
      fromAddress: emailData.from || featureConfig.email.fromAddress,
    })

    // Prepare the sender with proper format
    const fromEmail = emailData.from || featureConfig.email.fromAddress
    // Ensure proper "From" format with name - Resend requires this format
    const formattedFrom = fromEmail.includes("<") ? fromEmail : `KamiKoto <${fromEmail}>`

    // Prepare the email payload for our API
    const emailPayload = {
      from: formattedFrom,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.body,
    }

    console.log("Sending email with payload:", emailPayload)

    // Use the Cloudflare Function endpoint
    // const apiEndpoint = `${getApiFunctionBaseUrl()}/send-email`
    const apiEndpoint = `http://localhost:8787/send-email`
    console.log("Using API endpoint:", apiEndpoint)

    // Send the request to our server-side function
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    })

    let result
    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API endpoint returned non-OK response:", response.status, errorText)
      throw new Error(`API endpoint error (${response.status}): ${errorText || "Unknown error"}`)
    } else {
      result = await response.json()
      console.log("[v0] API endpoint response:", result)
    }

    if (result.error) {
      // Check for application-level errors within the JSON response
      console.error("[v0] API endpoint returned an application error:", result.error)
      throw new Error(result.error?.message || "Failed to send email via API endpoint")
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error("[v0] Detailed error sending email via API endpoint:", error)
    throw error
  }
}

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
  console.log("sendOrderConfirmationEmail called with:", {
    orderId: order?.orderId,
    userEmail: user?.email,
  })

  if (!user || !user.email) {
    console.error("Cannot send order confirmation: Missing user email")
    return { success: false, error: "Missing user email" }
  }

  if (!order || !order.orderId) {
    console.error("Cannot send order confirmation: Invalid order data")
    return { success: false, error: "Invalid order data" }
  }

  if (!isEmailEnabled()) {
    console.log("Email functionality is disabled, skipping order confirmation email")
    return { success: false, error: "Email functionality is disabled" }
  }

  try {
    console.log("Generating email HTML template")
    const emailBody = generateOrderConfirmationHTML(order, user)
    console.log("Email template generated, length:", emailBody.length)

    const emailData = {
      to: user.email,
      subject: `KamiKoto - Order Confirmation #${order.orderId}`,
      body: emailBody,
    }

    console.log("Calling sendEmail function with email data")
    return await sendEmail(emailData)
  } catch (error) {
    console.error("Error in sendOrderConfirmationEmail function:", error)
    return { success: false, error: error.message || "Failed to send order confirmation email" }
  }
}

/**
 * Sends an order shipment notification email to the customer
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @param {Object} shipmentInfo - Shipping information
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendOrderShippedEmail = async (order, user, shipmentInfo) => {
  if (!user || !user.email) {
    console.error("Cannot send shipping notification: Missing user email")
    return { success: false, error: "Missing user email" }
  }

  if (!order || !order.orderId) {
    console.error("Cannot send shipping notification: Invalid order data")
    return { success: false, error: "Invalid order data" }
  }

  if (!shipmentInfo) {
    console.error("Cannot send shipping notification: Missing shipment information")
    return { success: false, error: "Missing shipment information" }
  }

  if (!isEmailEnabled()) {
    console.log("Email functionality is disabled, skipping shipping notification email")
    return { success: false, error: "Email functionality is disabled" }
  }

  try {
    const emailBody = generateOrderShippedHTML(order, user, shipmentInfo)

    const emailData = {
      to: user.email,
      subject: `Your Order #${order.orderId} Has Shipped`,
      body: emailBody,
    }

    return await sendEmail(emailData)
  } catch (error) {
    console.error("Error sending order shipped email:", error)
    return { success: false, error: error.message || "Failed to send order shipped email" }
  }
}

/**
 * Generates HTML content for order confirmation emails
 *
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @returns {string} - HTML content for the email
 */
const generateOrderConfirmationHTML = (order, user) => {
  // Calculate order summary values
  const subtotal = order.subtotal || 0
  const tax = order.tax || 0
  const shipping = order.shipping?.cost || 0
  const discount = order.discount || 0
  const total = order.totalAmount || 0
  const importDuty = order.importDuty || 0

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const modernCSS = `
    /* Reset and base styles */
    body, table, td, div, h1, h2, h3, p, a {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      margin: 0;
      padding: 0;
    }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { padding: 0; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; color: #007bff; }

    /* Main container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    /* Header */
    .header-section {
      background-color: #e0f7fa; /* Very light cyan/blue */
      padding: 24px 30px;
      text-align: center;
      border-bottom: 1px solid #cfd8dc;
    }
    .header-logo {
      width: 50px;
      height: 50px;
      display: block;
      margin: 0 auto 10px auto;
    }
    .header-title {
      font-size: 28px;
      font-weight: 700;
      color: #263238;
      margin: 0;
    }
    .header-subtitle {
      font-size: 15px;
      color: #546e7a;
      margin: 5px 0 0;
    }

    /* Content sections */
    .content-section {
      padding: 30px;
      background-color: #ffffff;
    }
    .card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 25px;
      border: 1px solid #e0e0e0;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #263238;
      margin-bottom: 15px;
    }
    .text-muted {
      color: #78909c;
    }
    .text-bold {
      font-weight: 600;
      color: #263238;
    }

    /* Order items */
    .item-row {
      padding: 15px 0;
      border-bottom: 1px solid #eceff1;
    }
    .item-row:last-child {
      border-bottom: none;
    }
    .item-image {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 6px;
      display: block;
      border: 1px solid #e0e0e0;
    }
    .item-name {
      font-size: 16px;
      font-weight: 600;
      color: #263238;
      margin: 0 0 5px 0;
    }
    .item-qty {
      font-size: 14px;
      color: #546e7a;
      margin: 0;
    }
    .item-total-price {
      font-size: 16px;
      font-weight: 700;
      color: #263238;
      text-align: right;
    }

    /* Summary table */
    .summary-table td {
      padding: 8px 0;
      font-size: 15px;
      color: #546e7a;
    }
    .summary-table .total-row td {
      font-size: 17px;
      font-weight: 700;
      color: #263238;
      border-top: 1px solid #eceff1;
      padding-top: 15px;
    }
    .summary-table .total-row .total-amount {
      font-size: 20px;
      color: #263238;
    }

    /* Button */
    .button {
      display: inline-block;
      background-color: #FF4136; /* Red for action */
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 6px;
      text-align: center;
      mso-padding-alt: 0; /* Outlook fix */
    }
    .button:hover {
      background-color: #e02b20;
    }

    /* Footer */
    .footer-section {
      background-color: #f5f5f5;
      padding: 25px 30px;
      text-align: center;
      font-size: 13px;
      color: #78909c;
      border-top: 1px solid #eceff1;
    }
    .footer-link {
      color: #007bff;
      text-decoration: none;
    }

    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0;
        box-shadow: none;
      }
      .content-section {
        padding: 20px !important;
      }
      .header-section {
        padding: 20px !important;
      }
      .header-title {
        font-size: 24px !important;
      }
      .header-subtitle {
        font-size: 14px !important;
      }
      .section-title {
        font-size: 18px !important;
      }
      .item-image {
        width: 60px !important;
        height: 60px !important;
      }
      .item-name {
        font-size: 15px !important;
      }
      .item-qty {
        font-size: 13px !important;
      }
      .item-total-price {
        font-size: 15px !important;
      }
      .summary-table td {
        font-size: 14px !important;
      }
      .summary-table .total-row td {
        font-size: 16px !important;
      }
      .summary-table .total-row .total-amount {
        font-size: 18px !important;
      }
      .button {
        padding: 10px 20px !important;
        font-size: 15px !important;
      }
      .footer-section {
        padding: 20px !important;
        font-size: 12px !important;
      }
    }
  `

  const processImageForEmail = (imageUrl) => {
    if (!imageUrl) return null
    if (imageUrl.includes("i.imgur.com")) {
      if (!imageUrl.match(/\\.(jpg|jpeg|png|gif|webp)$/i)) {
        return `${imageUrl}.jpg`
      }
    }
    return imageUrl
  }

  const itemsHTML = order.items
    .map((item) => {
      const truncatedName = item.name.length > 40 ? item.name.substring(0, 37) + "..." : item.name
      const processedImageUrl = processImageForEmail(item.image)

      return `
        <tr>
          <td class="item-row">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td width="80" valign="top" style="padding-right: 15px;">
                  ${
                    processedImageUrl
                      ? `<img src="${processedImageUrl}" alt="${truncatedName}" class="item-image" />`
                      : `<div style="width: 70px; height: 70px; border-radius: 6px; background-color: #e0e0e0; display: flex; align-items: center; justify-content: center; color: #78909c; font-size: 10px; text-align: center;">No Image</div>`
                  }
                </td>
                <td valign="top">
                  <p class="item-name">${truncatedName}</p>
                  <p class="item-qty">Qty: ${item.quantity}</p>
                </td>
                <td width="100" valign="top" style="text-align: right;">
                  <p class="item-total-price">${formatCurrency(item.price * item.quantity)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
    })
    .join("")

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
  <title>Order Confirmation - KamiKoto</title>
  <style type="text/css">
    ${modernCSS}
  </style>
  <!--[if mso]>
  <style type="text/css">
    .email-container { width: 600px !important; }
    .content-section { padding: 30px !important; }
    .header-section { padding: 24px 30px !important; }
    .header-title { font-size: 28px !important; }
    .header-subtitle { font-size: 14px !important; }
    .section-title { font-size: 20px !important; }
    .item-image { width: 70px !important; height: 70px !important; }
    .item-name { font-size: 16px !important; }
    .item-qty { font-size: 14px !important; }
    .item-total-price { font-size: 16px !important; }
    .summary-table td { font-size: 14px !important; }
    .summary-table .total-row td { font-size: 16px !important; }
    .summary-table .total-row .total-amount { font-size: 18px !important; }
    .button { padding: 12px 25px !important; font-size: 16px !important; }
    .footer-section { padding: 25px 30px !important; font-size: 13px !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; width: 100%;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" valign="top" style="padding: 20px 0;">
        <table class="email-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <!-- Header -->
          <tr>
            <td class="header-section">
              <img src="https://example.com/your-red-white-logo.png" alt="KamiKoto Logo" class="header-logo">
              <h1 class="header-title">KamiKoto</h1>
              <p class="header-subtitle">Your Premium Stationery Store</p>
            </td>
          </tr>

          <!-- Order Confirmation Message -->
          <tr>
            <td class="content-section">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="card">
                <tr>
                  <td style="text-align: center;">
                    <h2 style="font-size: 24px; font-weight: 700; color: #263238; margin: 0 0 10px 0;">Order Confirmed!</h2>
                    <p style="font-size: 16px; color: #546e7a; margin: 0 0 15px 0;">Hello ${user.displayName || user.email?.split("@")[0] || "Valued Customer"}, thank you for your order!</p>
                    <p style="font-size: 15px; font-weight: 600; color: #263238; margin: 0 0 5px 0;">Order #${order.orderId}</p>
                    <p style="font-size: 13px; color: #78909c; margin: 0;">Placed on ${new Date(order.orderDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                    <p style="font-size: 15px; color: #546e7a; margin: 20px 0 0 0;">We're processing it right now and will send you tracking information once it ships.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Your Items Section -->
          <tr>
            <td class="content-section" style="padding-top: 0;">
              <h3 class="section-title">Your Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px;">
                ${itemsHTML}
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td class="content-section" style="padding-top: 0;">
              <h3 class="section-title">Order Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="summary-table" style="margin-bottom: 20px;">
                <tr>
                  <td>Subtotal</td>
                  <td align="right">${formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td>Tax (18% GST)</td>
                  <td align="right">${formatCurrency(tax)}</td>
                </tr>
                <tr>
                  <td>Shipping</td>
                  <td align="right">${shipping === 0 ? "Free" : formatCurrency(shipping)}</td>
                </tr>
                ${
                  importDuty > 0
                    ? `
                <tr>
                  <td style="color: #EA580C;">Import Duty (69%)</td>
                  <td align="right" style="color: #EA580C;">${formatCurrency(importDuty)}</td>
                </tr>
                `
                    : ""
                }
                ${
                  discount > 0
                    ? `
                <tr>
                  <td style="color: #16A34A;">Discount</td>
                  <td align="right" style="color: #16A34A;">-${formatCurrency(discount)}</td>
                </tr>
                `
                    : ""
                }
                <tr class="total-row">
                  <td>Total (${order.items.length} ${order.items.length === 1 ? "item" : "items"})</td>
                  <td align="right" class="total-amount">${formatCurrency(total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping and Payment Info -->
          <tr>
            <td class="content-section" style="padding-top: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 15px;">
                    <h3 class="section-title" style="margin-top: 0;">Shipping Address</h3>
                    <p style="margin: 0 0 2px; font-size: 15px;" class="text-bold">
                      ${order.shippingAddress?.name || order.userName || "Customer"}<br>
                      ${order.shippingAddress?.street || ""}<br>
                      ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.zip || ""}<br>
                      ${order.shippingAddress?.country || ""}
                    </p>
                  </td>
                  <td width="50%" valign="top">
                    <h3 class="section-title" style="margin-top: 0;">Payment Details</h3>
                    <!-- Displaying card/payment method details instead of generic payment method -->
                    <p style="margin: 0 0 2px; font-size: 15px;" class="text-bold">
                      Paid with ${order.payment?.cardType || order.payment?.method || "Credit Card"} ending in **** ${order.payment?.last4 || "1234"}
                    </p>
                    <p style="margin: 0 0 2px; font-size: 15px;" class="text-muted">Payment Status: Completed</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Any Questions Section -->
          <tr>
            <td class="content-section" style="padding-top: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="card">
                <tr>
                  <td style="text-align: center;">
                    <h3 class="section-title" style="margin-top: 0;">Any questions?</h3>
                    <p style="font-size: 15px; color: #546e7a; margin: 0 0 15px 0;">
                      If you need any help whatsoever or just want to chat, email us anytime at
                      <a href="mailto:${featureConfig.email.supportEmail}" class="footer-link" style="color: #FF4136; font-weight: 600;">${featureConfig.email.supportEmail}</a>
                    </p>
                    <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="mailto:${featureConfig.email.supportEmail}" style="height:40px;v-text-anchor:middle;width:150px;" arcsize="15%" strokecolor="#FF4136" fillcolor="#FF4136">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Contact Us</center>
                      </v:roundrect>
                    <![endif]-->
                    <a href="mailto:${featureConfig.email.supportEmail}" class="button" style="mso-hide:all;">Contact Us</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-section">
              <p style="margin: 0 0 5px 0;">© ${new Date().getFullYear()} KamiKoto. All Rights Reserved.</p>
              <p style="margin: 0;">This email was sent because you placed an order with us.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const modernCSS = `
    /* Reset and base styles */
    body, table, td, div, h1, h2, h3, p, a {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      margin: 0;
      padding: 0;
    }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { padding: 0; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; color: #007bff; }

    /* Main container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    /* Header */
    .header-section {
      background-color: #e0f7fa; /* Very light cyan/blue */
      padding: 24px 30px;
      text-align: center;
      border-bottom: 1px solid #cfd8dc;
    }
    .header-logo {
      width: 50px;
      height: 50px;
      display: block;
      margin: 0 auto 10px auto;
    }
    .header-title {
      font-size: 28px;
      font-weight: 700;
      color: #263238;
      margin: 0;
    }
    .header-subtitle {
      font-size: 15px;
      color: #546e7a;
      margin: 5px 0 0;
    }

    /* Content sections */
    .content-section {
      padding: 30px;
      background-color: #ffffff;
    }
    .card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 25px;
      border: 1px solid #e0e0e0;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #263238;
      margin-bottom: 15px;
    }
    .text-muted {
      color: #78909c;
    }
    .text-bold {
      font-weight: 600;
      color: #263238;
    }

    /* Order items */
    .item-row {
      padding: 15px 0;
      border-bottom: 1px solid #eceff1;
    }
    .item-row:last-child {
      border-bottom: none;
    }
    .item-image {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 6px;
      display: block;
      border: 1px solid #e0e0e0;
    }
    .item-name {
      font-size: 16px;
      font-weight: 600;
      color: #263238;
      margin: 0 0 5px 0;
    }
    .item-qty {
      font-size: 14px;
      color: #546e7a;
      margin: 0;
    }
    .item-total-price {
      font-size: 16px;
      font-weight: 700;
      color: #263238;
      text-align: right;
    }

    /* Summary table */
    .summary-table td {
      padding: 8px 0;
      font-size: 15px;
      color: #546e7a;
    }
    .summary-table .total-row td {
      font-size: 17px;
      font-weight: 700;
      color: #263238;
      border-top: 1px solid #eceff1;
      padding-top: 15px;
    }
    .summary-table .total-row .total-amount {
      font-size: 20px;
      color: #263238;
    }

    /* Button */
    .button {
      display: inline-block;
      background-color: #FF4136; /* Red for action */
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 6px;
      text-align: center;
      mso-padding-alt: 0; /* Outlook fix */
    }
    .button:hover {
      background-color: #e02b20;
    }

    /* Footer */
    .footer-section {
      background-color: #f5f5f5;
      padding: 25px 30px;
      text-align: center;
      font-size: 13px;
      color: #78909c;
      border-top: 1px solid #eceff1;
    }
    .footer-link {
      color: #007bff;
      text-decoration: none;
    }

    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0;
        box-shadow: none;
      }
      .content-section {
        padding: 20px !important;
      }
      .header-section {
        padding: 20px !important;
      }
      .header-title {
        font-size: 24px !important;
      }
      .header-subtitle {
        font-size: 14px !important;
      }
      .section-title {
        font-size: 18px !important;
      }
      .item-image {
        width: 60px !important;
        height: 60px !important;
      }
      .item-name {
        font-size: 15px !important;
      }
      .item-qty {
        font-size: 13px !important;
      }
      .item-total-price {
        font-size: 15px !important;
      }
      .summary-table td {
        font-size: 14px !important;
      }
      .summary-table .total-row td {
        font-size: 16px !important;
      }
      .summary-table .total-row .total-amount {
        font-size: 18px !important;
      }
      .button {
        padding: 10px 20px !important;
        font-size: 15px !important;
      }
      .footer-section {
        padding: 20px !important;
        font-size: 12px !important;
      }
    }
  `

  const processImageForEmailShipped = (imageUrl) => {
    if (!imageUrl) return null
    if (imageUrl.includes("i.imgur.com")) {
      if (!imageUrl.match(/\\.(jpg|jpeg|png|gif|webp)$/i)) {
        return `${imageUrl}.jpg`
      }
    }
    return imageUrl
  }

  const itemsHTML = order.items
    .map((item) => {
      const truncatedName = item.name.length > 40 ? item.name.substring(0, 37) + "..." : item.name
      const processedImageUrl = processImageForEmailShipped(item.image)

      return `
        <tr>
          <td class="item-row">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td width="80" valign="top" style="padding-right: 15px;">
                  ${
                    processedImageUrl
                      ? `<img src="${processedImageUrl}" alt="${truncatedName}" class="item-image" />`
                      : `<div style="width: 70px; height: 70px; border-radius: 6px; background-color: #e0e0e0; display: flex; align-items: center; justify-content: center; color: #78909c; font-size: 10px; text-align: center;">No Image</div>`
                  }
                </td>
                <td valign="top">
                  <p class="item-name">${truncatedName}</p>
                  <p class="item-qty">Qty: ${item.quantity}</p>
                </td>
                <td width="100" valign="top" style="text-align: right;">
                  <p class="item-total-price">${formatCurrency(item.price * item.quantity)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
    })
    .join("")

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
  <title>Order Shipped - KamiKoto</title>
  <style type="text/css">
    ${modernCSS}
  </style>
  <!--[if mso]>
  <style type="text/css">
    .email-container { width: 600px !important; }
    .content-section { padding: 30px !important; }
    .header-section { padding: 24px 30px !important; }
    .header-title { font-size: 28px !important; }
    .header-subtitle { font-size: 15px !important; }
    .section-title { font-size: 20px !important; }
    .item-image { width: 70px !important; height: 70px !important; }
    .item-name { font-size: 16px !important; }
    .item-qty { font-size: 14px !important; }
    .item-total-price { font-size: 16px !important; }
    .summary-table td { font-size: 14px !important; }
    .summary-table .total-row td { font-size: 16px !important; }
    .summary-table .total-row .total-amount { font-size: 18px !important; }
    .button { padding: 12px 25px !important; font-size: 16px !important; }
    .footer-section { padding: 25px 30px !important; font-size: 13px !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; width: 100%;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" valign="top" style="padding: 20px 0;">
        <table class="email-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <!-- Header -->
          <tr>
            <td class="header-section">
              <img src="https://example.com/your-red-white-logo.png" alt="KamiKoto Logo" class="header-logo">
              <h1 class="header-title">KamiKoto</h1>
              <p class="header-subtitle">Your Premium Stationery Store</p>
            </td>
          </tr>

          <!-- Shipped Message -->
          <tr>
            <td class="content-section">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="card">
                <tr>
                  <td style="text-align: center;">
                    <h2 style="font-size: 24px; font-weight: 700; color: #263238; margin: 0 0 10px 0;">Your Order Has Shipped!</h2>
                    <p style="font-size: 16px; color: #546e7a; margin: 0 0 15px 0;">Hello ${user.displayName || user.email?.split("@")[0] || "Valued Customer"},</p>
                    <p style="font-size: 15px; color: #546e7a; margin: 0;">Great news! Your order #${order.orderId} has been shipped and is on its way to you.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tracking Information -->
          <tr>
            <td class="content-section" style="padding-top: 0;">
              <h3 class="section-title">Shipment Details</h3>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <p style="margin: 0 0 5px 0;" class="text-muted">Carrier</p>
                    <p style="margin: 0;" class="text-bold">${shipmentInfo.carrier}</p>
                  </td>
                  <td style="padding-bottom: 10px;">
                    <p style="margin: 0 0 5px 0;" class="text-muted">Tracking Number</p>
                    <p style="margin: 0;" class="text-bold">${shipmentInfo.trackingNumber}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 10px;">
                    <p style="margin: 0 0 5px 0;" class="text-muted">Estimated Delivery</p>
                    <p style="margin: 0;" class="text-bold">${shipmentInfo.estimatedDeliveryDate}</p>
                  </td>
                </tr>
              </table>
              ${
                shipmentInfo.trackingUrl
                  ? `
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px;">
                <tr>
                  <td style="text-align: center;">
                    <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${shipmentInfo.trackingUrl}" style="height:40px;v-text-anchor:middle;width:180px;" arcsize="15%" strokecolor="#FF4136" fillcolor="#FF4136">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Track Your Package</center>
                      </v:roundrect>
                    <![endif]-->
                    <a href="${shipmentInfo.trackingUrl}" class="button" style="mso-hide:all;">Track Your Package</a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Items Shipped Section -->
          <tr>
            <td class="content-section" style="padding-top: 0;">
              <h3 class="section-title">Items Shipped</h3>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px;">
                ${itemsHTML}
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td class="content-section" style="padding-top: 0;">
              <h3 class="section-title">Shipping Address</h3>
              <p style="margin: 0 0 2px; font-size: 15px;" class="text-bold">
                ${order.shippingAddress?.name || order.userName || "Customer"}<br>
                ${order.shippingAddress?.street || ""}<br>
                ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.zip || ""}<br>
                ${order.shippingAddress?.country || ""}
              </p>
            </td>
          </tr>

          <!-- Order Summary Section -->
          <tr>
            <td class="content-section" style="padding-top: 0;">
              <h3 class="section-title">Order Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="summary-table" style="margin-bottom: 20px;">
                <tr>
                  <td>Subtotal</td>
                  <td align="right">${formatCurrency(order.subtotal || 0)}</td>
                </tr>
                <tr>
                  <td>Shipping</td>
                  <td align="right">${formatCurrency(order.shipping?.cost || 0)}</td>
                </tr>
                <tr>
                  <td>Tax</td>
                  <td align="right">${formatCurrency(order.tax || 0)}</td>
                </tr>
                ${
                  order.importDuty > 0
                    ? `
                <tr>
                  <td style="color: #EA580C;">Import Duty</td>
                  <td align="right" style="color: #EA580C;">${formatCurrency(order.importDuty)}</td>
                </tr>
                `
                    : ""
                }
                ${
                  order.discount > 0
                    ? `
                <tr>
                  <td style="color: #16A34A;">Discount</td>
                  <td align="right" style="color: #16A34A;">-${formatCurrency(order.discount)}</td>
                </tr>
                `
                    : ""
                }
                <tr class="total-row">
                  <td>Total</td>
                  <td align="right" class="total-amount">${formatCurrency(order.totalAmount || order.total || 0)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Support CTA -->
          <tr>
            <td class="content-section" style="padding-top: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="card">
                <tr>
                  <td style="text-align: center;">
                    <h3 class="section-title" style="margin-top: 0;">Questions about your shipment?</h3>
                    <p style="font-size: 15px; color: #546e7a; margin: 0 0 15px 0;">
                      Our support team is ready to assist you.
                    </p>
                    <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="mailto:${featureConfig.email.supportEmail}" style="height:40px;v-text-anchor:middle;width:150px;" arcsize="15%" strokecolor="#FF4136" fillcolor="#FF4136">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Contact Support</center>
                      </v:roundrect>
                    <![endif]-->
                    <a href="mailto:${featureConfig.email.supportEmail}" class="button" style="mso-hide:all;">Contact Support</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-section">
              <p style="margin: 0 0 5px 0;">Thank you for shopping with KamiKoto</p>
              <p style="margin: 0 0 5px 0;">© ${new Date().getFullYear()} KamiKoto. All rights reserved.</p>
              <p style="margin: 0;">This email was sent because you placed an order with us.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Export all the email service functions
export { sendOrderConfirmationEmail, sendOrderShippedEmail, isEmailEnabled, sendEmail }
