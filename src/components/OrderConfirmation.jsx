import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadOrderReceipt } from '../utils/pdfUtils';
import { Home, Package, FileDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { m } from "framer-motion";

/**
 * Component for displaying order confirmation with receipt download functionality
 * Shows order details, shipping information, and allows for receipt download
 * 
 * @param {Object} props - Component props
 * @param {Object} props.order - Order data
 * @returns {JSX.Element} Order confirmation component
 */
function OrderConfirmation({ order }) {
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  
  /**
   * Format price as currency
   * 
   * @param {number} price - Price to format
   * @returns {string} Formatted price
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price);
  };
  
  /**
   * Format date in a readable format
   * 
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
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
   * Handle receipt download
   * 
   * @returns {Promise<void>}
   */
  const handleDownloadReceipt = async () => {
    setDownloadingReceipt(true);
    try {
      await downloadOrderReceipt(order);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    } finally {
      setDownloadingReceipt(false);
    }
  };
  
  /**
   * Check if order has import duty (for US orders)
   * 
   * @returns {boolean} Whether order has import duty
   */
  const hasImportDuty = () => {
    return order.shipping?.address?.country === 'United States' && order.importDuty > 0;
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Success Animation */}
      <div className="flex flex-col items-center mb-8">
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-green-500 mb-4"
        >
          <CheckCircle size={80} />
        </m.div>
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Your order #{order.orderId} has been confirmed.
        </p>

        {/* Display import duty notice for US customers */}
        {hasImportDuty() && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start max-w-xl">
            <AlertTriangle size={24} className="text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">US Import Duty Applied</p>
              <p className="text-amber-700 text-sm mt-1">
                Your order includes a 69% import duty fee of {formatPrice(order.importDuty)} 
                as required for shipments to the United States.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Order Information */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
            <p className="text-gray-500 text-sm mt-1">Placed on {formatDate(order.orderDate)}</p>
          </div>
          <button
            onClick={handleDownloadReceipt}
            disabled={downloadingReceipt}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
          >
            <FileDown size={18} />
            {downloadingReceipt ? 'Downloading...' : 'Download Receipt'}
          </button>
        </div>
        
        {/* Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Ordered Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img 
                    src={item.image || 'https://via.placeholder.com/80?text=Product'} 
                    alt={item.name}
                    className="w-16 h-16 object-contain border border-gray-200 rounded-md"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="text-gray-800 font-medium">{item.name}</h4>
                  <p className="text-gray-500 text-sm mt-1">Quantity: {item.quantity}</p>
                  <p className="text-gray-700 font-medium mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Payment & Shipping Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Payment Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-sm text-gray-500">Method</div>
                <div className="text-sm font-medium text-gray-900">{order.payment?.method || 'N/A'}</div>
                
                {order.payment?.method === 'Card' && (
                  <>
                    <div className="text-sm text-gray-500">Card Type</div>
                    <div className="text-sm text-gray-900">{order.payment.details?.cardType || 'N/A'}</div>
                    
                    <div className="text-sm text-gray-500">Card Number</div>
                    <div className="text-sm text-gray-900">xxxx-xxxx-xxxx-{order.payment.details?.lastFour || 'xxxx'}</div>
                  </>
                )}
                
                {order.payment?.method === 'UPI' && (
                  <>
                    <div className="text-sm text-gray-500">UPI ID</div>
                    <div className="text-sm text-gray-900">{order.payment.details?.upiId || 'N/A'}</div>
                  </>
                )}
                
                <div className="text-sm text-gray-500">Subtotal</div>
                <div className="text-sm text-gray-900">{formatPrice(order.subtotal)}</div>
                
                <div className="text-sm text-gray-500">Tax</div>
                <div className="text-sm text-gray-900">{formatPrice(order.tax)}</div>
                
                <div className="text-sm text-gray-500">Shipping</div>
                <div className="text-sm text-gray-900">{formatPrice(order.shipping?.cost || 0)}</div>
                
                {/* Import Duty Information */}
                {hasImportDuty() && (
                  <>
                    <div className="text-sm text-amber-600 font-medium">US Import Duty (69%)</div>
                    <div className="text-sm font-medium text-amber-600">{formatPrice(order.importDuty)}</div>
                  </>
                )}
                
                <div className="text-sm text-gray-500 font-medium">Total</div>
                <div className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Shipping Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <div className="text-sm text-gray-500 mb-1">Shipping Address</div>
                <div className="text-sm text-gray-900">
                  {order.shipping?.address ? (
                    <>
                      {order.shipping.address.houseNo && `${order.shipping.address.houseNo}, `}
                      {order.shipping.address.line1 && `${order.shipping.address.line1}, `}
                      {order.shipping.address.line2 && `${order.shipping.address.line2}, `}<br />
                      {order.shipping.address.city && `${order.shipping.address.city}, `}
                      {order.shipping.address.state && `${order.shipping.address.state}, `}
                      {order.shipping.address.country && `${order.shipping.address.country} `}
                      {order.shipping.address.pin && `- ${order.shipping.address.pin}`}
                    </>
                  ) : (
                    'Not available'
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm text-gray-500 mb-1">Shipping Method</div>
                <div className="text-sm text-gray-900">{order.shipping?.method || 'Standard Shipping'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Expected Delivery</div>
                <div className="text-sm text-gray-900">
                  <ul className="space-y-2 text-sm mt-2">
                    <li className="flex items-start">
                      <span className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                        <CheckCircle size={12} className="text-green-600" />
                      </span>
                      <span>Order will ship within 24 hours</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                        <Package size={12} className="text-blue-600" />
                      </span>
                      <span>Tracking will be available within 48 hours</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-2 mt-0.5">
                        <CheckCircle size={12} className="text-gray-600" />
                      </span>
                      <span>International orders may take additional time</span>
                    </li>
                    
                    {/* Additional shipping information for international orders */}
                    {order.shipping?.address?.country !== 'India' && (
                      <li className="flex items-start">
                        <span className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center mr-2 mt-0.5">
                          <AlertTriangle size={12} className="text-amber-600" />
                        </span>
                        <span>International shipping includes customs processing time</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition duration-300 w-full sm:w-auto"
        >
          <Home size={18} />
          Return to Home
        </Link>
        <Link 
          to="/my-account"
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 w-full sm:w-auto"
        >
          <Package size={18} />
          View My Orders
        </Link>
      </div>
      
      {/* Hidden container for PDF generation */}
      <div id="receipt-container" className="hidden"></div>
    </div>
  );
}

export default OrderConfirmation; 