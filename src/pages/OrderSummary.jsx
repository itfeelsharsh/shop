import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  CreditCard, 
  Receipt,
  FileText,
  MapPin,
  ArrowLeft,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import { downloadOrderReceipt } from '../utils/pdfUtils';

/**
 * Order Summary Page Component
 * 
 * Displays detailed order information after successful payment
 * Shows order items, shipping details, payment info, and status
 * Includes animations and confetti effect for celebration
 * 
 * @returns {JSX.Element} OrderSummary component
 */
function OrderSummary() {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confettiActive, setConfettiActive] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const { width, height } = useWindowSize();
  
  // Get query params from URL
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');
  const paymentId = params.get('paymentId');
  
  // Fetch order details using the orderId
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) {
        setError("Missing order ID or user not authenticated");
        setLoading(false);
        return;
      }
      
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnapshot = await getDoc(orderRef);
        
        if (!orderSnapshot.exists()) {
          setError("Order not found");
          setLoading(false);
          return;
        }
        
        // Get order data and ensure it belongs to the current user
        const orderData = orderSnapshot.data();
        
        if (orderData.userId !== user.uid) {
          setError("Unauthorized access to this order");
          setLoading(false);
          return;
        }
        
        setOrder({
          id: orderSnapshot.id,
          ...orderData
        });
        
        // Turn off confetti after 5 seconds
        setTimeout(() => {
          setConfettiActive(false);
        }, 5000);
        
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, user]);
  
  // Format price with Indian currency format
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };
  
  // Format date in readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  /**
   * Handle download invoice
   * Uses the downloadOrderReceipt utility to generate and download a PDF invoice
   */
  const handleDownloadInvoice = async () => {
    if (!order) {
      toast.error("Order information not available");
      return;
    }
    
    try {
      setDownloadingInvoice(true);
      toast.info("Preparing your invoice...");
      
      // Prepare order data for PDF generation
      // Ensure all required fields are present
      const orderData = {
        ...order,
        orderId: order.id || order.orderId,
        orderDate: order.orderDate || new Date().toISOString(),
        userName: order.userName || user?.displayName || user?.email,
        userEmail: order.userEmail || user?.email,
        items: order.items || [],
        payment: order.payment || {},
        shipping: order.shipping || {},
        shippingAddress: order.shippingAddress || {},
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        totalAmount: order.totalAmount || order.total || 0
      };
      
      const success = await downloadOrderReceipt(orderData);
      
      if (success) {
        toast.success("Invoice downloaded successfully");
      } else {
        toast.error("Failed to download invoice");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice: " + (error.message || "Unknown error"));
    } finally {
      setDownloadingInvoice(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {confettiActive && (
        <Confetti 
          width={width} 
          height={height} 
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
        />
      )}
    
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shopping
          </button>
          
          {/* Order Success Banner */}
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-2xl p-8 shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-white rounded-full p-3">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Order Confirmed!</h1>
                <p className="text-green-100">Your order has been successfully placed and is being processed.</p>
              </div>
            </div>
          </motion.div>
          
          {/* Main Content */}
          <div className="bg-white rounded-b-2xl shadow-lg p-6 md:p-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Order Info & Actions */}
              <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order #{order?.id?.slice(-6)}</h2>
                  <p className="text-gray-600">Placed on {formatDate(order?.orderDate)}</p>
                </div>
                <div className="flex space-x-4 mt-4 md:mt-0">
                  <button 
                    onClick={handleDownloadInvoice}
                    disabled={downloadingInvoice}
                    className="flex items-center text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
                  </button>
                </div>
              </motion.div>
              
              {/* Order Status */}
              <motion.div variants={itemVariants} className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Order Status</h3>
                    <p className="text-blue-700">{order?.status || 'Processing'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-600 rounded-full" 
                        style={{ width: order?.status === 'Placed' ? '25%' : 
                                 order?.status === 'Shipped' ? '50%' : 
                                 order?.status === 'Delivered' ? '100%' : '25%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-600">
                      <span>Order Placed</span>
                      <span>Processing</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Order Items */}
              <motion.div variants={itemVariants} className="border border-gray-200 rounded-lg overflow-hidden">
                <h3 className="bg-gray-50 px-4 py-3 font-semibold text-gray-800 border-b border-gray-200">
                  Order Items
                </h3>
                <div className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {order?.items?.map((item, index) => (
                      <motion.div 
                        key={item.productId}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: 1,
                          transition: { delay: index * 0.1 }
                        }}
                        className="flex items-center p-4 hover:bg-gray-50"
                      >
                        <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
              
              {/* Summary & Address Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Summary */}
                <motion.div variants={itemVariants} className="border border-gray-200 rounded-lg overflow-hidden">
                  <h3 className="bg-gray-50 px-4 py-3 font-semibold text-gray-800 border-b border-gray-200 flex items-center">
                    <Receipt className="w-4 h-4 mr-2" />
                    Payment Summary
                  </h3>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(order?.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>{formatPrice(order?.shipping?.cost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>{formatPrice(order?.tax || 0)}</span>
                    </div>
                    
                    {order?.importDuty > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Import Duty</span>
                        <span>{formatPrice(order?.importDuty)}</span>
                      </div>
                    )}
                    
                    {order?.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(order?.discount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold pt-2 mt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>{formatPrice(order?.totalAmount || 0)}</span>
                    </div>
                    
                    <div className="pt-4 mt-2 border-t border-gray-200">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600 text-sm">Payment Method:</span>
                      </div>
                      <p className="font-medium mt-1">
                        {order?.payment?.method === 'Card' 
                          ? `${order?.payment?.details?.cardType} **** ${order?.payment?.details?.lastFour}`
                          : `UPI (${order?.payment?.details?.upiId})`
                        }
                      </p>
                      <p className="text-green-600 text-sm font-medium">
                        Payment ID: {paymentId}
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Shipping Info */}
                <motion.div variants={itemVariants} className="border border-gray-200 rounded-lg overflow-hidden">
                  <h3 className="bg-gray-50 px-4 py-3 font-semibold text-gray-800 border-b border-gray-200 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Shipping Information
                  </h3>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium">{order?.userName || 'Customer'}</p>
                        <p className="text-gray-600">{order?.userPhone || ''}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-700">{order?.shippingAddress?.street}</p>
                        <p className="text-gray-700">{order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.zip}</p>
                        <p className="text-gray-700">{order?.shippingAddress?.country}</p>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-600 text-sm">Shipping Method:</span>
                        </div>
                        <p className="font-medium mt-1">{order?.shipping?.method}</p>
                        <p className="text-sm text-gray-600">Estimated Delivery: {order?.shipping?.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Additional Info */}
              <motion.div 
                variants={itemVariants}
                className="text-center mt-8"
              >
                <p className="text-gray-600">
                  A confirmation email has been sent to {order?.userEmail || 'your email address'}.
                </p>
                <motion.div 
                  className="mt-6"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderSummary; 