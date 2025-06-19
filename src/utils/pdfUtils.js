/**
 * PDF Generation Utilities
 * 
 * This file contains utility functions for generating PDF documents
 * Used for creating order receipts and invoices with a modern, elegant design
 * Optimized for A4 paper size with proper pagination support
 * 
 * @dependencies jspdf, html2canvas
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../assets/receipt.css'; // Import enhanced receipt styling

// Import shop logo
import logoImage from '../assets/kamikoto-logo-transparent-darkish-logo-for-better-visibility.png';

/**
 * Generates a PDF receipt from an HTML element
 * 
 * @param {string} elementId - The ID of the HTML element to convert to PDF
 * @param {string} fileName - The name of the PDF file to download
 * @returns {Promise<void>} - A promise that resolves when the PDF is generated and downloaded
 */
export const generatePdfFromElement = async (elementId, fileName) => {
  try {
    // Get the HTML element
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }

    // Set background color to white to ensure proper printing
    const originalBackground = element.style.background;
    element.style.background = 'white';
    
    // Render the element to canvas with high quality settings
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading of cross-origin images
      logging: false,
      letterRendering: true,
      allowTaint: false,
    });
    
    // Restore original background
    element.style.background = originalBackground;
    
    // Calculate dimensions - A4 size in mm
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Create PDF document with A4 format
    const pdf = new jsPDF('p', 'mm', 'a4');
    let currentPage = 0;
    
    // Add image to PDF
    pdf.addImage(
      canvas.toDataURL('image/png', 1.0),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight,
      '',
      'FAST',
    );
    
    // Add multiple pages if content is too long
    // This approach ensures the content flows correctly across pages
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      currentPage++;
      position = -pageHeight * currentPage;
      
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        '',
        'FAST',
      );
      
      heightLeft -= pageHeight;
    }
    
    // Save the PDF file
    pdf.save(`${fileName}.pdf`);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

/**
 * Creates a receipt HTML template for an order
 * 
 * @param {Object} order - The order data
 * @param {string} containerId - The ID of the container element where the receipt will be rendered
 * @returns {void}
 */
export const createReceiptTemplate = (order, containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Format date in a readable format
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  /**
   * Format price as currency with Indian Rupee (INR) 
   * 
   * @param {number|string} price - The price to format
   * @returns {string} The formatted price
   * 
   * IMPORTANT: This handles potential null/undefined values and NaN that
   * can occur when there are inconsistencies between database fields
   * (order.totalAmount vs order.total). The database schema uses 'totalAmount'
   * but some older entries might use 'total' field instead.
   */
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'INR 0.00';
    
    const num = typeof price === 'string' ? parseFloat(price) : price;
    
    // Handle NaN, just in case
    if (isNaN(num)) return 'INR 0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(num);
  };
  
  // Get current date in a formatted string
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  /**
   * Check if order has import duty applied (for US orders)
   * 
   * @returns {boolean} Whether order has import duty
   */
  const hasImportDuty = () => {
    return order.shipping?.address?.country === 'United States' && order.importDuty > 0;
  };
  
  // Create receipt HTML with enhanced styling for a compact, modern look
  // All styles are inline to ensure they are applied in the PDF.
  const receiptHtml = `
    <div class="receipt-container" style="font-family: 'Arial', sans-serif; color: #333; margin: 0 auto; max-width: 800px; padding: 15px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      
      <!-- Header Section -->
      <div class="receipt-header" style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 2px solid #4f46e5;">
        <div class="store-info" style="text-align: left;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${logoImage}" alt="KamiKoto Logo" style="width: 35px; height: 35px;" />
            <h1 style="font-size: 22px; margin: 0; color: #4f46e5; transform: translateY(-1px);">KamiKoto</h1>
          </div>
          <p style="font-size: 10px; margin: 2px 0;">North Sentinel Island, A&N Islands, India</p>
          <p style="font-size: 10px; margin: 2px 0;">please.help.me@kamikoto.nsl</p>
          <p style="font-size: 10px; margin: 2px 0;">+91 1800-69-69-69-69</p>
        </div>
        <div class="receipt-info" style="text-align: right;">
          <h2 style="font-size: 18px; margin: 0 0 5px 0; color: #4f46e5;">PAYMENT RECEIPT</h2>
          <p style="font-size: 10px; margin: 2px 0;"><strong>Order ID:</strong> ${order.orderId}</p>
          <p style="font-size: 10px; margin: 2px 0;"><strong>Date:</strong> ${formatDate(order.orderDate)}</p>
          <p style="font-size: 10px; margin: 2px 0;"><strong>Invoice Date:</strong> ${getCurrentDate()}</p>
        </div>
      </div>
      
      <!-- Customer Information Section -->
      <div class="customer-info" style="padding: 25px 0 10px 0; border-bottom: 1px solid #eee;">
        <h3 style="font-size: 12px; margin: 0 0 5px 0; color: #4f46e5;">BILL TO:</h3>
        <p style="font-size: 11px; margin: 2px 0;"><strong>${order.userName || 'Valued Customer'}</strong></p>
        <p style="font-size: 11px; margin: 2px 0;">${order.userEmail}</p>
        <p style="font-size: 11px; margin: 2px 0;">
          ${order.shipping?.address ? (
            `${order.shipping.address.houseNo ? order.shipping.address.houseNo + ', ' : ''}
            ${order.shipping.address.line1 ? order.shipping.address.line1 + ', ' : ''}
            ${order.shipping.address.line2 ? order.shipping.address.line2 + ', ' : ''}
            ${order.shipping.address.city ? order.shipping.address.city + ', ' : ''}
            ${order.shipping.address.state ? order.shipping.address.state + ', ' : ''}
            ${order.shipping.address.country ? order.shipping.address.country + ' ' : ''}
            ${order.shipping.address.pin ? '- ' + order.shipping.address.pin : ''}`
          ) : 'Address not provided'}
        </p>
        ${hasImportDuty() ? `
        <div style="margin-top: 8px; padding: 6px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 3px;">
          <p style="margin: 0; color: #92400e; font-weight: bold; font-size: 10px;">US Import Duty Information</p>
          <p style="margin: 3px 0 0; color: #92400e; font-size: 9px;">
            This order includes a 69% import duty fee as required for shipments to the United States.
          </p>
        </div>
        ` : ''}
      </div>
      
      <!-- Order Items Section -->
      <div class="items-section" style="padding: 10px 0;">
        <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #4f46e5;">ORDER ITEMS:</h3>
        <table class="items-table" style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="text-align: left; padding: 6px; border-bottom: 1px solid #ddd; width: 40%;">Item</th>
              <th style="text-align: right; padding: 6px; border-bottom: 1px solid #ddd; width: 15%;">Qty</th>
              <th style="text-align: right; padding: 6px; border-bottom: 1px solid #ddd; width: 20%;">Price</th>
              <th style="text-align: right; padding: 6px; border-bottom: 1px solid #ddd; width: 25%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 6px; vertical-align: top;">${item.name}</td>
                <td style="padding: 6px; text-align: right; vertical-align: top;">${item.quantity}</td>
                <td style="padding: 6px; text-align: right; vertical-align: top;">${formatPrice(item.price)}</td>
                <td style="padding: 6px; text-align: right; vertical-align: top;">${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <!-- Order Summary & Payment Details Section (Side-by-Side) -->
      <div class="summary-payment-section" style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #eee; gap: 15px;">
        
        <div class="summary-section" style="width: 55%;">
          <h3 style="font-size: 12px; color: #4f46e5; font-weight: normal; border-bottom: 1px solid #eee; padding-bottom: 5px; margin: 0 0 8px 0;">ORDER SUMMARY:</h3>
          <div style="font-size: 9px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>Subtotal:</span>
              <span>${formatPrice(order.subtotal)}</span>
            </div>
            ${order.coupon ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #10b981;">
              <span>Coupon (${order.coupon.code}):</span>
              <span>-${formatPrice(order.coupon.discountAmount || 0)}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>Tax (18% GST):</span>
              <span>${formatPrice(order.tax)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>Shipping:</span>
              <span>${formatPrice(order.shipping?.cost || 0)}</span>
            </div>
            ${hasImportDuty() ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #b45309;">
              <span>US Import Duty (69%):</span>
              <span>${formatPrice(order.importDuty)}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-top: 5px; padding-top: 5px; border-top: 1px solid #ddd; font-weight: bold; font-size: 10px;">
              <span>TOTAL:</span>
              <span>${formatPrice(order.totalAmount || order.total || 0)}</span>
            </div>
          </div>
        </div>

        <div class="payment-info" style="width: 45%;">
          <h3 style="font-size: 12px; color: #4f46e5; font-weight: normal; border-bottom: 1px solid #eee; padding-bottom: 5px; margin: 0 0 8px 0;">PAYMENT INFORMATION:</h3>
          <div style="font-size: 9px;">
            <p style="margin: 2px 0; font-size: 9px;"><strong>Payment Status:</strong> <span style="color: #10b981;">Completed</span></p>
            <p style="margin: 2px 0; font-size: 9px;"><strong>Method:</strong> ${order.payment?.method || 'Not specified'}</p>
            ${order.payment?.method === 'Card' ? `
              <p style="margin: 2px 0; font-size: 9px;"><strong>Card Type:</strong> ${order.payment.details?.cardType || 'Not specified'}</p>
              <p style="margin: 2px 0; font-size: 9px;"><strong>Card Number:</strong> xxxx-xxxx-xxxx-${order.payment.details?.lastFour || 'xxxx'}</p>
              <p style="margin: 2px 0; font-size: 9px;"><strong>Transaction ID:</strong> TXN${order.orderId.substring(5)}</p>
            ` : ''}
            ${order.payment?.method === 'UPI' ? `
              <p style="margin: 2px 0; font-size: 9px;"><strong>UPI ID:</strong> ${order.payment.details?.upiId || 'Not specified'}</p>
              <p style="margin: 2px 0; font-size: 9px;"><strong>Transaction ID:</strong> UPI${order.orderId.substring(5)}</p>
            ` : ''}
          </div>
        </div>
      </div>
      
      <!-- Import Duty Notice (if applicable) -->
      ${hasImportDuty() ? `
      <div style="margin-top: 15px; padding: 8px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; font-size: 10px;">
        <h3 style="margin-top: 0; margin-bottom: 5px; color: #92400e; font-size: 11px;">Import Duty Notice</h3>
        <p style="margin: 3px 0; color: #92400e;">
          This order includes a 69% import duty fee of ${formatPrice(order.importDuty)} as required by US customs regulations for shipments to the United States.
        </p>
        <p style="margin: 3px 0; color: #92400e; font-size: 9px;">
          This fee has been collected upfront to prevent delivery delays or additional payments upon delivery.
        </p>
      </div>
      ` : ''}

      <!-- Thank You Message & Footer -->
      <div style="margin-top: 15px; text-align: center; border-top: 2px solid #4f46e5; padding-top: 10px;">
        <h3 style="color: #4f46e5; margin-bottom: 3px; font-size: 14px;">Thank You for Your Purchase!</h3>
        <p style="color: #aaa; font-size: 8px; margin-top: 5px;">Generated on: ${getCurrentDate()}</p>
      </div>
    </div>
  `;
  
  // Set the receipt HTML in the container
  container.innerHTML = receiptHtml;
};

/**
 * Generates and downloads a PDF receipt for an order
 * 
 * @param {Object} order - The order data
 * @returns {Promise<boolean>} - A promise that resolves to true if the receipt was generated successfully
 */
export const downloadOrderReceipt = async (order) => {
  try {
    // Create a temporary container for the receipt
    const tempContainer = document.createElement('div');
    tempContainer.id = 'temp-receipt-container';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);
    
    // Create the receipt template
    createReceiptTemplate(order, 'temp-receipt-container');
    
    // Generate and download the PDF
    await generatePdfFromElement('temp-receipt-container', `KamiKoto-Receipt-${order.orderId}`);
    
    // Remove the temporary container
    document.body.removeChild(tempContainer);
    
    return true;
  } catch (error) {
    console.error('Error downloading receipt:', error);
    return false;
  }
}; 