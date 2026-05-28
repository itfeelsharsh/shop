import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase/config';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { sendOrderConfirmationEmail } from '../utils/emailService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  CreditCard, 
  Receipt,
  MapPin,
  ArrowLeft,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import { downloadOrderReceipt } from '../utils/pdfUtils';
import Button from '../components/Button';
import { Helmet } from 'react-helmet-async';

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
  const [isNavigating, setIsNavigating] = useState(false);
  const { width, height } = useWindowSize();
  
  // Get query params from URL
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');
  const paymentId = params.get('paymentId');
  const emailSent = params.get('emailSent') === 'true';
  const shouldClearCart = params.get('clearCart') === 'true';
  const dispatch = useDispatch();

  // Clear Redux cart state immediately when an order is loaded
  useEffect(() => {
    if (orderId) {
      dispatch(clearCart());
    }
    if (shouldClearCart) {
      // Remove clearCart from URL using history replace to keep it clean
      const newUrl = window.location.pathname + window.location.search.replace('&clearCart=true', '').replace('clearCart=true&', '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [orderId, shouldClearCart, dispatch]);

  // Clear Firestore cart as soon as the authenticated user is resolved
  useEffect(() => {
    if (orderId && user) {
      const clearFirestoreCart = async () => {
        try {
          console.log('🛒 OrderSummary: Explicitly clearing user cart in Firestore...');
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { cart: [] });
        } catch (error) {
          console.error('❌ OrderSummary: Failed to clear Firestore cart:', error);
        }
      };
      clearFirestoreCart();
    }
  }, [orderId, user]);
  
  // Fetch order details using the orderId
  useEffect(() => {
    /**
     * Check if the URL has the required parameters for order lookup
     * 
     * @returns {boolean} Whether the URL contains valid order parameters
     */
    const hasValidUrlParams = () => {
      return orderId && orderId.length > 0;
    };

    /**
     * Check if the current user can access this order
     * This implements a more sophisticated access control that allows:
     * 1. Authenticated users to access their own orders
     * 2. Brief grace period for recently completed orders (direct checkout flow)
     * 
     * @param {Object} orderData - The order data from Firestore
     * @returns {boolean} Whether the user has access to this order
     */
    const canAccessOrder = (orderData) => {
      // If user is authenticated and owns the order, allow access
      if (user && orderData.userId === user.uid) {
        return true;
      }
      
      // For security: only allow unauthenticated access for very recent orders
      // This handles the case where user completes checkout but auth state hasn't updated yet
      if (!user && orderData.orderDate) {
        const orderTime = new Date(orderData.orderDate).getTime();
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - orderTime;
        
        // Allow unauthenticated access for orders placed within last 10 minutes
        // This is for the direct checkout -> summary flow
        const gracePeriod = 10 * 60 * 1000; // 10 minutes in milliseconds
        return timeDifference < gracePeriod;
      }
      
      return false;
    };

    const fetchOrderDetails = () => {
      // Early validation - check if required parameters exist
      if (!hasValidUrlParams()) {
        console.error("OrderSummary: Missing or invalid orderId parameter in URL");
        setError("Invalid order link. Please check your URL or access your order from your account page.");
        setLoading(false);
        return () => {};
      }
      
      try {
        console.log(`OrderSummary: Setting up listener for orderId: ${orderId}`);
        const orderRef = doc(db, "orders", orderId);
        
        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(orderRef, (docSnap) => {
          if (docSnap.exists()) {
            const orderData = docSnap.data();
            console.log("OrderSummary: Received real-time update:", orderData);
            
            // Security check - ensure order belongs to current user or is accessible
            if (!canAccessOrder(orderData, user)) {
              console.error("OrderSummary: Unauthorized access attempt to order", orderId);
              setError("You don't have permission to view this order.");
            } else {
              // Create complete order object with fallback values
              const completeOrder = {
                id: docSnap.id,
                orderId: docSnap.id,
                ...orderData,
                // Ensure critical fields have fallback values
                userName: orderData.userName || user?.displayName || user?.email || 'Valued Customer',
                userEmail: orderData.userEmail || user?.email || '',
                orderDate: orderData.orderDate || new Date().toISOString(),
                totalAmount: orderData.totalAmount || orderData.total || 0,
                subtotal: orderData.subtotal || 0,
                tax: orderData.tax || 0,
                items: orderData.items || [],
                shipping: orderData.shipping || { cost: 0, method: 'Standard' },
                shippingAddress: orderData.shippingAddress || {},
              };
              
              setOrder(completeOrder);
              setError(null);
            }
          } else {
            console.error("OrderSummary: Order document not found", orderId);
            setError("Order not found. Please verify your order number.");
          }
          setLoading(false);
        }, (err) => {
          console.error("OrderSummary: Firestore listener error:", err);
          setError("Failed to load order details. Please check your connection.");
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (err) {
        console.error("OrderSummary: Error setting up order listener:", err);
        setError("An unexpected error occurred.");
        setLoading(false);
        return () => {};
      }
    };
    
    const unsubscribe = fetchOrderDetails();
    return () => unsubscribe();
  }, [orderId, user]); // Dependencies: re-run if orderId or user changes

  // Ref to prevent multiple email sends per page load
  const emailSendAttempted = React.useRef(false);
  const latestOrderRef = React.useRef(null);

  // Keep a ref to the latest order data (no re-renders)
  React.useEffect(() => {
    latestOrderRef.current = order;
  }, [order]);

  // Send confirmation email ONCE when order first loads and emailSent is false
  // Uses orderId as dependency (stable) + ref gate to prevent loops
  useEffect(() => {
    if (!orderId || emailSendAttempted.current) return;

    // Check localStorage immediately to prevent even waiting/triggering if already sent
    try {
      if (window.localStorage.getItem(`order_email_sent_${orderId}`) === 'true') {
        emailSendAttempted.current = true;
        return;
      }
    } catch (e) {
      console.warn('OrderSummary: Failed to check localStorage:', e);
    }

    const triggerEmail = async () => {
      // Check localStorage again right before delay
      try {
        if (window.localStorage.getItem(`order_email_sent_${orderId}`) === 'true') {
          emailSendAttempted.current = true;
          return;
        }
      } catch (e) {
        console.warn('OrderSummary: Failed to check localStorage:', e);
      }

      // Wait a tick for order data to settle from onSnapshot
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const currentOrder = latestOrderRef.current;
      
      // If order is loaded and email is already marked as sent in DB,
      // update our localStorage and do not send
      if (currentOrder?.emailSent) {
        try {
          window.localStorage.setItem(`order_email_sent_${currentOrder.id}`, 'true');
        } catch (e) {
          console.warn('OrderSummary: Failed to set localStorage:', e);
        }
        emailSendAttempted.current = true;
        return;
      }

      if (!currentOrder || emailSendAttempted.current) return;

      // Double-check localStorage one more time after the 1.5s delay
      try {
        if (window.localStorage.getItem(`order_email_sent_${currentOrder.id}`) === 'true') {
          emailSendAttempted.current = true;
          return;
        }
      } catch (e) {
        console.warn('OrderSummary: Failed to check localStorage:', e);
      }

      // Mark as attempted BEFORE sending to prevent any re-entry
      emailSendAttempted.current = true;

      console.log(`📧 OrderSummary: Sending ONE confirmation email for order ${currentOrder.id}`);
      try {
        const userForEmail = {
          email: currentOrder.userEmail,
          displayName: currentOrder.userName || currentOrder.userEmail?.split('@')[0] || 'Valued Customer'
        };
        
        const result = await sendOrderConfirmationEmail(currentOrder, userForEmail);
        
        if (result.success) {
          console.log('✅ OrderSummary: Email sent successfully (single send)');
          
          // Store in localStorage immediately
          try {
            window.localStorage.setItem(`order_email_sent_${currentOrder.id}`, 'true');
          } catch (e) {
            console.warn('OrderSummary: Failed to set localStorage:', e);
          }

          // Update Firestore so other clients know email was sent
          try {
            const orderRef = doc(db, "orders", currentOrder.id);
            await updateDoc(orderRef, { emailSent: true });
          } catch (updateErr) {
            console.warn('⚠️ OrderSummary: Could not mark emailSent in Firestore:', updateErr);
          }
        } else {
          console.error('❌ OrderSummary: Email service returned false:', result);
          // If the send failed, we reset the ref so it can retry if the user refreshes
          emailSendAttempted.current = false;
        }
      } catch (emailError) {
        console.error('❌ OrderSummary: Failed to send confirmation email:', emailError);
        // Reset ref so it can retry
        emailSendAttempted.current = false;
      }
    };

    triggerEmail();
  }, [orderId]); // Only depends on orderId (stable), NOT on order object

  // Turn off confetti after a celebration period
  useEffect(() => {
    if (confettiActive) {
      const timer = setTimeout(() => {
        setConfettiActive(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [confettiActive]);
  
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

  const handleContinueShopping = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/');
    }, 800);
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
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {/* Error Icon */}
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          {/* Error Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          
          {/* Error Message */}
          <p className="text-gray-600 mb-6">{error}</p>
          
          {/* Debug Information (helpful for developers and support) */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
              <p className="text-sm text-gray-500">
                <strong>Order ID:</strong> {orderId}
              </p>
              {paymentId && (
                <p className="text-sm text-gray-500">
                  <strong>Payment ID:</strong> {paymentId}
                </p>
              )}
              <p className="text-sm text-gray-500">
                <strong>User:</strong> {user?.email || 'Not signed in'}
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary action - retry if authentication issue */}
            {error.includes('sign in') ? (
              <button 
                onClick={() => navigate('/signin')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </button>
            ) : (
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            )}
            
            {/* Secondary actions */}
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/my-account/orders')}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                View Orders
              </button>
              <button 
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Go Home
              </button>
            </div>
          </div>
          
          {/* Contact Support */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? <button 
                onClick={() => navigate('/contact')}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Order Confirmation | KamiKoto</title>
        <meta name="description" content="Thank you for your order! Your purchase at KamiKoto is confirmed and being prepared." />
      </Helmet>
      {confettiActive && (
        <Confetti 
          width={width} 
          height={height} 
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
        />
      )}
    
      <div className="min-h-screen bg-gray-50 py-12 px-2 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate('/')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="mb-6"
          >
            Back to Shopping
          </Button>
          
          {/* Data Quality Warning - Show if order has missing critical information */}
          {order && (!order.items || order.items.length === 0 || !order.totalAmount) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Order Information Incomplete
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Some order details appear to be missing. This may be due to a processing issue. 
                      The order was successfully placed, but you may want to contact support for complete details.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => navigate('/contact')}
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Order Success Banner */}
          <motion.div 
            className="bg-gray-900 text-white rounded-t-2xl p-10 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTQ2IDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center text-center md:text-left gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/20">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight text-white">Order Confirmed!</h1>
                <p className="text-white text-lg opacity-90">Your items are being prepared for shipment.</p>
              </div>
            </div>
          </motion.div>
          

          
          {/* Main Content */}
          <div className="bg-white rounded-b-2xl shadow-lg p-4 sm:p-6 md:p-8">
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
                <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleDownloadInvoice}
                    isLoading={downloadingInvoice}
                    loadingText="Downloading..."
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download Invoice
                  </Button>
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
                        key={item.productId || index}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: 1,
                          transition: { delay: index * 0.1 }
                        }}
                        className="flex items-center p-4 hover:bg-gray-50"
                      >
                        {/* Product Image with Error Handling */}
                        <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden bg-gray-100">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name || 'Product'}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // If image fails to load, replace with fallback
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {/* Fallback image placeholder */}
                          <div 
                            className="w-full h-full flex items-center justify-center text-gray-400"
                            style={{ display: item.image ? 'none' : 'flex' }}
                          >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium text-gray-800">{item.name || 'Unknown Product'}</h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                          {item.variant && (
                            <p className="text-xs text-gray-400">{item.variant}</p>
                          )}
                        </div>
                        
                        {/* Pricing with Error Handling */}
                        <div className="text-right">
                          <p className="font-medium text-gray-800">
                            {formatPrice((item.price || 0) * (item.quantity || 1))}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price || 0)} each
                          </p>
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
                        {order?.payment?.method === 'Razorpay'
                          ? 'Razorpay'
                          : (order?.payment?.details?.upiId
                              ? `UPI (${order?.payment?.details?.upiId})`
                              : (order?.payment?.method || 'Razorpay'))}
                      </p>
                      <p className="text-green-600 text-sm font-medium">
                        Payment ID: {paymentId || order?.payment?.transactionId || 'Razorpay'}
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
                  {emailSent 
                    ? `A confirmation email has been sent to ${order?.userEmail || 'your email address'}.`
                    : `Order confirmation for ${order?.userEmail || 'your email address'} may be delayed. You can download your invoice above.`
                  }
                </p>
                <motion.div 
                  className="mt-10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleContinueShopping}
                    isLoading={isNavigating}
                    loadingText="Checking out..."
                  >
                    Continue Shopping
                  </Button>
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