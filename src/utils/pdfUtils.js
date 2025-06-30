/**
 * PDF Generation Utilities
 * 
 * This file contains utility functions for generating PDF documents
 * Used for creating order receipts and invoices with a modern, elegant design
 * Optimized for A4 paper size with proper pagination support
 * Apple-inspired aesthetic with clean, minimal design
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
 * Creates a receipt HTML template for an order with Apple-inspired aesthetic design
 * Optimized to fit up to 5 products on a single A4 page
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
    if (price === undefined || price === null) return '₹0.00';
    
    const num = typeof price === 'string' ? parseFloat(price) : price;
    
    // Handle NaN, just in case
    if (isNaN(num)) return '₹0.00';
    
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
  
  // Create receipt HTML with Apple-inspired aesthetic design
  // Optimized for A4 single page with up to 5 products
  // All styles are inline to ensure they are applied in the PDF
  const receiptHtml = `
    <div class="invoice-container" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1d1d1f;
      margin: 0 auto;
      max-width: 210mm;
      padding: 20px;
      background: #ffffff;
      font-weight: 400;
      line-height: 1.4;
    ">
      
            <!-- Header Section with Apple-like spacing and typography -->
      <div class="invoice-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        margin-bottom: 24px;
        border-bottom: 1px solid #d2d2d7;
      ">
        <!-- Company Brand Section (Far Left) -->
        <div class="brand-section" style="
          display: flex; 
          align-items: center; 
          gap: 14px;
        ">
          <img src="${logoImage}" alt="KamiKoto Logo" style="
            width: 52px;
            height: 52px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          " />
          <div>
            <h1 style="
              font-size: 26px;
              font-weight: 600;
              margin: 0;
              color: #1d1d1f;
              letter-spacing: -0.6px;
            ">KamiKoto</h1>
            <p style="
              font-size: 12px;
              color: #86868b;
              margin: 1px 0 0 0;
              font-weight: 400;
              letter-spacing: 0.2px;
            ">⠀⠀</p>
          </div>
        </div>
        
        <!-- Invoice Details (Far Right) -->
        <div class="invoice-meta" style="
          text-align: right;
        ">
          <h2 style="
            font-size: 22px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #1d1d1f;
            letter-spacing: -0.4px;
          ">Invoice</h2>
          <div style="
            font-size: 11px; 
            color: #86868b; 
            line-height: 1.7;
          ">
            <div style="margin-bottom: 2px;">
              <strong style="color: #1d1d1f;">Order:</strong> 
              <span style="margin-left: 6px;">${order.orderId}</span>
            </div>
            <div>
              <strong style="color: #1d1d1f;">Date:</strong> 
              <span style="margin-left: 6px;">${formatDate(order.orderDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer & Company Info in Cards -->
      <div class="info-grid" style="
        display: flex;
        gap: 20px;
        margin-bottom: 24px;
      ">
        <!-- Bill To Card -->
        <div class="info-card" style="
          flex: 1;
          background: #f5f5f7;
          border-radius: 12px;
          padding: 16px;
        ">
          <h3 style="
            font-size: 12px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #1d1d1f;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">Bill To</h3>
          <div style="color: #1d1d1f; font-size: 11px; line-height: 1.5;">
            <div style="font-weight: 600; margin-bottom: 4px;">${order.userName || 'Valued Customer'}</div>
            <div style="color: #86868b; margin-bottom: 2px;">${order.userEmail}</div>
            <div style="color: #86868b;">
              ${order.shipping?.address ? (
                `${order.shipping.address.houseNo ? order.shipping.address.houseNo + ', ' : ''}
                ${order.shipping.address.line1 ? order.shipping.address.line1 + ', ' : ''}
                ${order.shipping.address.line2 ? order.shipping.address.line2 + ', ' : ''}
                ${order.shipping.address.city ? order.shipping.address.city + ', ' : ''}
                ${order.shipping.address.state ? order.shipping.address.state + ', ' : ''}
                ${order.shipping.address.country ? order.shipping.address.country + ' ' : ''}
                ${order.shipping.address.pin ? '- ' + order.shipping.address.pin : ''}`
              ) : 'Address not provided'}
            </div>
          </div>
        </div>

        <!-- Company Info Card -->
        <div class="info-card" style="
          flex: 1;
          background: #f5f5f7;
          border-radius: 12px;
          padding: 16px;
        ">
          <h3 style="
            font-size: 12px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #1d1d1f;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">From</h3>
          <div style="color: #1d1d1f; font-size: 11px; line-height: 1.5;">
            <div style="font-weight: 600; margin-bottom: 4px;">KamiKoto Stationeries Pvt. Ltd.</div>
            <div style="color: #86868b; margin-bottom: 2px;">North Sentinel Island, Andaman and Nicobar Islands, India</div>
            <div style="color: #86868b; margin-bottom: 2px;">support@kamikoto.nsi</div>
            <div style="color: #86868b;">+91 1800-6969-6969</div>
          </div>
        </div>
      </div>

      ${hasImportDuty() ? `
      <!-- Import Duty Notice -->
      <div style="
        margin-bottom: 20px;
        padding: 12px;
        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
        border: 1px solid #f1c40f;
        border-radius: 8px;
        font-size: 10px;
      ">
        <div style="font-weight: 600; color: #856404; margin-bottom: 4px;">US Import Duty Applied</div>
        <div style="color: #856404;">
          A 69% import duty of ${formatPrice(order.importDuty)} has been included for US customs compliance.
        </div>
      </div>
      ` : ''}

      <!-- Items Table with Modern Design -->
      <div class="items-section" style="margin-bottom: 24px;">
        <table style="
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e5e5ea;
        ">
          <thead>
            <tr style="background: linear-gradient(135deg, #f5f5f7 0%, #e5e5ea 100%);">
              <th style="
                text-align: left;
                padding: 12px 16px;
                font-size: 11px;
                font-weight: 600;
                color: #1d1d1f;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid #e5e5ea;
              ">Item(s)</th>
              <th style="
                text-align: center;
                padding: 12px 16px;
                font-size: 11px;
                font-weight: 600;
                color: #1d1d1f;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid #e5e5ea;
                width: 60px;
              ">Qty</th>
              <th style="
                text-align: right;
                padding: 12px 16px;
                font-size: 11px;
                font-weight: 600;
                color: #1d1d1f;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid #e5e5ea;
                width: 90px;
              ">Price</th>
              <th style="
                text-align: right;
                padding: 12px 16px;
                font-size: 11px;
                font-weight: 600;
                color: #1d1d1f;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid #e5e5ea;
                width: 100px;
              ">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, index) => `
              <tr style="
                ${index % 2 === 0 ? 'background: #ffffff;' : 'background: #fafafa;'}
                ${index === order.items.length - 1 ? '' : 'border-bottom: 1px solid #f0f0f0;'}
              ">
                <td style="
                  padding: 14px 16px;
                  font-size: 11px;
                  color: #1d1d1f;
                  font-weight: 500;
                ">${item.name}</td>
                <td style="
                  padding: 14px 16px;
                  text-align: center;
                  font-size: 11px;
                  color: #86868b;
                  font-weight: 500;
                ">${item.quantity}</td>
                <td style="
                  padding: 14px 16px;
                  text-align: right;
                  font-size: 11px;
                  color: #86868b;
                  font-weight: 500;
                ">${formatPrice(item.price)}</td>
                <td style="
                  padding: 14px 16px;
                  text-align: right;
                  font-size: 11px;
                  color: #1d1d1f;
                  font-weight: 600;
                ">${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

             <!-- Payment & Summary Section (Combined in Single Background) -->
       <div class="payment-summary-section" style="
         background: #f5f5f7;
         border-radius: 12px;
         padding: 20px;
         margin-bottom: 32px;
       ">
         <div style="
           display: flex;
           gap: 32px;
         ">
           <!-- Payment Information (Left Side) -->
           <div class="payment-section" style="
             flex: 1;
           ">
             <h3 style="
               font-size: 14px;
               font-weight: 600;
               margin: 0 0 12px 0;
               color: #1d1d1f;
             ">Payment Information</h3>
             <div style="
               font-size: 11px;
               color: #86868b;
             ">
               <div style="margin-bottom: 8px;">
                 <strong style="color: #1d1d1f;">Status:</strong>
                 <span style="
                   color: #30d158;
                   font-weight: 600;
                   margin-left: 8px;
                 ">Completed</span>
               </div>
               <div style="margin-bottom: 8px;">
                 <strong style="color: #1d1d1f;">Method:</strong>
                 <span style="margin-left: 8px;">${order.payment?.method || 'Not specified'}</span>
               </div>
               ${order.payment?.method === 'Card' ? `
                 <div style="margin-bottom: 8px;">
                   <strong style="color: #1d1d1f;">Card Type:</strong>
                   <span style="margin-left: 8px;">${order.payment.details?.cardType || 'Not specified'}</span>
                 </div>
                 <div style="margin-bottom: 8px;">
                   <strong style="color: #1d1d1f;">Card:</strong>
                   <span style="margin-left: 8px;">•••• •••• •••• ${order.payment.details?.lastFour || '••••'}</span>
                 </div>
                 <div>
                   <strong style="color: #1d1d1f;">Transaction ID:</strong>
                   <span style="margin-left: 8px;">TXN${order.orderId.substring(5)}</span>
                 </div>
               ` : ''}
               ${order.payment?.method === 'UPI' ? `
                 <div style="margin-bottom: 8px;">
                   <strong style="color: #1d1d1f;">UPI ID:</strong>
                   <span style="margin-left: 8px;">${order.payment.details?.upiId || 'Not specified'}</span>
                 </div>
                 <div>
                   <strong style="color: #1d1d1f;">Transaction ID:</strong>
                   <span style="margin-left: 8px;">UPI${order.orderId.substring(5)}</span>
                 </div>
               ` : ''}
             </div>
           </div>

           <!-- Order Summary (Right Side) -->
           <div class="summary-section" style="
             width: 300px;
           ">
             <h3 style="
               font-size: 14px;
               font-weight: 600;
               margin: 0 0 12px 0;
               color: #1d1d1f;
             ">Order Summary</h3>
             <div style="font-size: 12px; line-height: 1.6;">
               <!-- Subtotal -->
               <div style="
                 display: flex;
                 justify-content: space-between;
                 margin-bottom: 8px;
                 color: #86868b;
               ">
                 <span>Subtotal</span>
                 <span>${formatPrice(order.subtotal)}</span>
               </div>
               
               ${order.coupon ? `
               <!-- Coupon Discount -->
               <div style="
                 display: flex;
                 justify-content: space-between;
                 margin-bottom: 8px;
                 color: #30d158;
               ">
                 <span>Discount (${order.coupon.code})</span>
                 <span>-${formatPrice(order.coupon.discountAmount || 0)}</span>
               </div>
               ` : ''}
               
               <!-- Tax -->
               <div style="
                 display: flex;
                 justify-content: space-between;
                 margin-bottom: 8px;
                 color: #86868b;
               ">
                 <span>Tax (18% GST)</span>
                 <span>${formatPrice(order.tax)}</span>
               </div>
               
               <!-- Shipping -->
               <div style="
                 display: flex;
                 justify-content: space-between;
                 margin-bottom: 8px;
                 color: #86868b;
               ">
                 <span>Shipping</span>
                 <span>${formatPrice(order.shipping?.cost || 0)}</span>
               </div>
               
               ${hasImportDuty() ? `
               <!-- Import Duty -->
               <div style="
                 display: flex;
                 justify-content: space-between;
                 margin-bottom: 8px;
                 color: #ff9500;
               ">
                 <span>US Import Duty (69%)</span>
                 <span>${formatPrice(order.importDuty)}</span>
               </div>
               ` : ''}
               
               <!-- Divider -->
               <div style="
                 margin: 16px 0 12px 0;
                 height: 1px;
                 background: #d2d2d7;
               "></div>
               
               <!-- Total -->
               <div style="
                 display: flex;
                 justify-content: space-between;
                 font-size: 16px;
                 font-weight: 600;
                 color: #1d1d1f;
               ">
                 <span>Total</span>
                 <span>${formatPrice(order.totalAmount || order.total || 0)}</span>
               </div>
             </div>
           </div>
         </div>
       </div>

      <!-- Footer -->
      <div class="invoice-footer" style="
        text-align: center;
        padding-top: 24px;
        border-top: 1px solid #d2d2d7;
      ">
        <h3 style="
          font-size: 16px;
          font-weight: 600;
          color: #1d1d1f;
          margin: 0 0 8px 0;
          letter-spacing: -0.2px;
        ">Thank you for your order at KamiKoto!</h3>
        <p style="
          font-size: 10px;
          color: #86868b;
          margin: 0;
        ">Invoice generated on ${getCurrentDate()}</p>
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
    await generatePdfFromElement('temp-receipt-container', `KamiKoto-Invoice-${order.orderId}`);
    
    // Remove the temporary container
    document.body.removeChild(tempContainer);
    
    return true;
  } catch (error) {
    console.error('Error downloading receipt:', error);
    return false;
  }
}; 