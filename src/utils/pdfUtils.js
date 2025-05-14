/**
 * PDF Generation Utilities
 * 
 * This file contains utility functions for generating PDF documents
 * Used for creating order receipts and invoices
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

    // Set background color to white
    const originalBackground = element.style.background;
    element.style.background = 'white';
    
    // Render the element to canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading of cross-origin images
      logging: false,
      letterRendering: true,
      allowTaint: false,
    });
    
    // Restore original background
    element.style.background = originalBackground;
    
    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Create PDF document
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
  
  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price);
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
  
  // Create receipt HTML with enhanced styling
  const receiptHtml = `
    <div class="receipt-container">
      <div class="receipt-header">
        <div class="store-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${logoImage}" alt="KamiKoto Logo" style="width: 40px; height: 40px;" />
            <h1 style="font-size: 24px; margin: 0; transform: translateY(-2px);">KamiKoto</h1>
          </div>
          <p>North Sentinel Island, A&N Islands, India</p>
          <p>please.help.me@kamikoto.nsl</p>
          <p>+91 1800-69-69-69-69</p>
        </div>
        <div class="receipt-info">
          <h2>PAYMENT RECEIPT</h2>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Date:</strong> ${formatDate(order.orderDate)}</p>
          <p><strong>Invoice Date:</strong> ${getCurrentDate()}</p>
          <p><strong>Status:</strong> Paid</p>
        </div>
      </div>
      
      <div class="customer-info">
        <h3>Bill To:</h3>
        <p><strong>${order.userName || 'Valued Customer'}</strong></p>
        <p>${order.userEmail}</p>
        <p>
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
        <div style="margin-top: 10px; padding: 8px; background-color: #fff8e1; border: 1px solid #ffecb3; border-radius: 4px;">
          <p style="margin: 0; color: #775700; font-weight: bold;">US Import Duty Information</p>
          <p style="margin: 5px 0 0; color: #775700; font-size: 13px;">
            This order includes a 69% import duty fee as required for shipments to the United States.
          </p>
        </div>
        ` : ''}
      </div>
      
      <div class="items-section">
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 45%">Item</th>
              <th style="width: 15%">Quantity</th>
              <th style="width: 20%">Price</th>
              <th style="width: 20%">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="summary-section">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${formatPrice(order.subtotal)}</span>
        </div>
        ${order.coupon ? `
        <div class="summary-row" style="color: #10b981;">
          <span>Coupon (${order.coupon.code}):</span>
          <span>-${formatPrice(order.coupon.discountAmount || 0)}</span>
        </div>
        ` : ''}
        <div class="summary-row">
          <span>Tax (18% GST):</span>
          <span>${formatPrice(order.tax)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span>${formatPrice(order.shipping?.cost || 0)}</span>
        </div>
        ${hasImportDuty() ? `
        <div class="summary-row" style="color: #b45309;">
          <span>US Import Duty (69%):</span>
          <span>${formatPrice(order.importDuty)}</span>
        </div>
        ` : ''}
        <div class="summary-row total">
          <span>Total:</span>
          <span>${formatPrice(order.total)}</span>
        </div>
      </div>
      
      <div class="payment-info">
        <h3>Payment Information</h3>
        <p><strong>Method:</strong> ${order.payment?.method || 'Not specified'}</p>
        ${order.payment?.method === 'Card' ? `
          <p><strong>Card Type:</strong> ${order.payment.details?.cardType || 'Not specified'}</p>
          <p><strong>Card Number:</strong> xxxx-xxxx-xxxx-${order.payment.details?.lastFour || 'xxxx'}</p>
          <p><strong>Payment Status:</strong> Completed</p>
          <p><strong>Transaction ID:</strong> TXN${order.orderId.substring(5)}</p>
        ` : ''}
        ${order.payment?.method === 'UPI' ? `
          <p><strong>UPI ID:</strong> ${order.payment.details?.upiId || 'Not specified'}</p>
          <p><strong>Payment Status:</strong> Completed</p>
          <p><strong>Transaction ID:</strong> UPI${order.orderId.substring(5)}</p>
        ` : ''}
      </div>
      
      ${hasImportDuty() ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #fff8e1; border: 1px solid #ffecb3; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #b45309;">Import Duty Notice</h3>
        <p style="margin: 8px 0; color: #775700;">
          This order includes a 69% import duty fee of ${formatPrice(order.importDuty)} as required by US customs regulations for shipments to the United States.
        </p>
        <p style="margin: 8px 0; color: #775700; font-size: 13px;">
          Import duties are collected to allow international shipments to clear customs in the destination country. 
          This fee has been collected upfront to prevent delivery delays or additional payments upon delivery.
        </p>
      </div>
      ` : ''}

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