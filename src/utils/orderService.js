/**
 * Order Service
 * 
 * This utility handles comprehensive order-related operations for both customer-facing
 * and admin-facing functionality. It manages order lifecycle, status updates, tracking,
 * email notifications, and data synchronization between collections.
 * 
 * Key Features:
 * - Order creation and processing
 * - Status management with history tracking
 * - Email notifications for order events
 * - Admin order management operations
 * - Data synchronization between collections
 * - Firebase security rule compliance
 * 
 * @author Shop Management System
 * @version 2.0.0
 */

import { sendOrderShippedEmail, sendOrderConfirmationEmail } from './emailService';
import featureConfig from './featureConfig';
import { 
  doc, 
  getDoc, 
  collection, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  getDocs,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Order status constants for consistent status management
 * These statuses align with the admin panel and customer tracking
 */
export const ORDER_STATUSES = {
  PLACED: 'Placed',           // Initial order placement
  APPROVED: 'Approved',       // Admin approval for processing
  PACKED: 'Packed',           // Order packed and ready to ship
  SHIPPED: 'Shipped',         // Order shipped with tracking
  DELIVERED: 'Delivered',     // Order delivered to customer
  DECLINED: 'Declined',       // Admin declined the order
  CANCELLED: 'Cancelled',     // Customer cancelled the order
  REFUNDED: 'Refunded'        // Order refunded
};

/**
 * Carrier configuration for shipping
 * Defines available carriers and their tracking URL patterns
 */
export const SHIPPING_CARRIERS = {
  INDIA_POST: {
    name: 'IndiaPost',
    code: 'INDIAPOST',
    trackingUrl: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx'
  },
  DHL: {
    name: 'DHL',
    code: 'DHL',
    trackingUrl: 'https://www.dhl.com/in-en/home/tracking.html'
  },
  FEDEX: {
    name: 'FedEx',
    code: 'FEDEX',
    trackingUrl: 'https://www.fedex.com/en-in/tracking.html'
  }
};

/**
 * Process a new order and create comprehensive order records in Firestore
 * This function handles the complete order creation workflow including:
 * - Order data validation and enrichment
 * - Dual collection storage (orders & users/{uid}/orders)
 * - Email notification dispatch
 * - Inventory updates
 * - Payment tracking
 * 
 * @param {Object} orderData - Complete order information from checkout
 * @param {Object} userData - User information for email and record keeping
 * @returns {Promise<Object>} - Order creation result with status and metadata
 */
const processNewOrder = async (orderData, userData) => {
  console.log('🚀 orderService: Processing new order for user:', userData?.email);
  
  // Debug: Log user authentication state
  console.log('🔐 orderService: User authentication check:', {
    hasUserData: !!userData,
    hasUserId: !!userData?.uid,
    userEmail: userData?.email,
    orderItemCount: orderData?.items?.length
  });
  
  try {
    // Validate required user data before proceeding
    if (!userData || !userData.uid) {
      throw new Error('User authentication required. Please log in and try again.');
    }
    
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }
    
    // Generate unique identifiers with timestamp-based prefixes for easy sorting
    const timestamp = new Date().getTime().toString().slice(-6);
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const paymentId = `PAY-${timestamp}-${randomId}`;
    const orderId = `ORDER-${timestamp}-${randomId}`;
    
    console.log('📋 orderService: Generated Order ID:', orderId, 'Payment ID:', paymentId);
    
    // Enrich order data with additional metadata and standardized fields
    const completeOrderData = {
      ...orderData,
      // Core identification and timestamps
      orderId: orderId,
      paymentId: paymentId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // User information standardization
      userId: userData?.uid || orderData.userId,
      userName: userData?.displayName || userData?.name || orderData.userName || 'Valued Customer',
      userEmail: userData?.email || orderData.userEmail,
      userPhone: userData?.phone || orderData.userPhone,
      
      // Order status and workflow management
      status: ORDER_STATUSES.PLACED,
      statusHistory: [
        {
          status: ORDER_STATUSES.PLACED,
          timestamp: new Date().toISOString(),
          note: 'Order placed successfully',
          updatedBy: 'system'
        }
      ],
      
      // Admin management flags
      adminNotes: '',
      priority: 'normal', // normal, high, urgent
      tags: [], // Custom tags for organization
      
      // Tracking and fulfillment preparation
      tracking: {
        code: null,
        carrier: orderData.shipping?.address?.country === 'India' ? SHIPPING_CARRIERS.INDIA_POST.name : SHIPPING_CARRIERS.DHL.name,
        url: null,
        estimatedDelivery: null,
        actualDelivery: null
      },
      
      // Financial tracking
      financials: {
        subtotal: orderData.subtotal || 0,
        tax: orderData.tax || 0,
        shipping: orderData.shipping?.cost || 0,
        discount: orderData.discount || 0,
        total: orderData.totalAmount || orderData.total || 0,
        currency: 'INR',
        exchangeRate: 1.0 // For future multi-currency support
      }
    };
    
    console.log('💾 orderService: Creating order document in Firestore collections');
    
    // Use Firestore transaction to ensure data consistency across collections
    // IMPORTANT: All reads must happen before all writes in Firestore transactions
    const orderResult = await runTransaction(db, async (transaction) => {
      // First, perform ALL READS for inventory checking
      const productReads = [];
      for (const item of orderData.items) {
        const productRef = doc(db, "products", item.productId);
        const productDoc = await transaction.get(productRef);
        productReads.push({
          ref: productRef,
          doc: productDoc,
          item: item
        });
      }
      
      // Validate inventory before proceeding with writes
      for (const productRead of productReads) {
        if (productRead.doc.exists()) {
          const currentStock = productRead.doc.data().stock || 0;
          if (currentStock < productRead.item.quantity) {
            throw new Error(`Insufficient stock for ${productRead.item.name}. Available: ${currentStock}, Requested: ${productRead.item.quantity}`);
          }
        } else {
          throw new Error(`Product ${productRead.item.name} not found`);
        }
      }
      
      // Now perform ALL WRITES after all reads are complete
      
      // Create main order document in global orders collection (for admin access)
      const globalOrderRef = doc(collection(db, "orders"));
      transaction.set(globalOrderRef, completeOrderData);
      
      // Create user-specific order document (for customer access)
      // This follows Firebase security rules pattern
      const userOrderRef = doc(collection(db, "users", userData.uid, "orders"));
      const userOrderData = {
        ...completeOrderData,
        // Store reference to global order for data consistency
        globalOrderId: globalOrderRef.id
      };
      transaction.set(userOrderRef, userOrderData);
      
      // Update product inventory using the previously read data
      for (const productRead of productReads) {
        if (productRead.doc.exists()) {
          const currentStock = productRead.doc.data().stock || 0;
          const newStock = Math.max(0, currentStock - productRead.item.quantity);
          
          transaction.update(productRead.ref, {
            stock: newStock,
            lastSold: serverTimestamp()
          });
          
          console.log(`📦 orderService: Updated stock for ${productRead.item.name}: ${currentStock} → ${newStock}`);
        }
      }
      
      return {
        globalOrderId: globalOrderRef.id,
        userOrderId: userOrderRef.id
      };
    });
    
    console.log('✅ orderService: Order created successfully with Global ID:', orderResult.globalOrderId);
    
    // Prepare enriched order data for email with final IDs
    const orderForEmail = {
      ...completeOrderData,
      id: orderResult.globalOrderId,
      orderId: orderResult.globalOrderId
    };
    
    // Handle email notification dispatch
    let emailResult = { success: false, error: 'Email not attempted' };
    
    if (featureConfig.email.enabled) {
      console.log('📧 orderService: Email service enabled, dispatching order confirmation');
      
      try {
        // Prepare user data for email service with fallbacks
        const userForEmail = {
          email: userData?.email || orderData.userEmail,
          displayName: userData?.displayName || userData?.name || orderData.userName || 'Valued Customer',
          name: userData?.name || userData?.displayName || orderData.userName || 'Valued Customer'
        };
   
        console.log('📤 orderService: Sending order confirmation email to:', userForEmail.email);
        
        // Dispatch order confirmation email
        emailResult = await sendOrderConfirmationEmail(orderForEmail, userForEmail);
        
        if (emailResult.success) {
          console.log('✅ orderService: Order confirmation email sent successfully');
        } else {
          console.error('❌ orderService: Failed to send order confirmation email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ orderService: Exception in email sending:', emailError);
        emailResult = { success: false, error: emailError.message };
      }
    } else {
      console.log('⚠️ orderService: Email service disabled in configuration, skipping email dispatch');
      emailResult = { success: false, error: 'Email disabled in configuration' };
    }
    
    // Return comprehensive result object
    return {
      success: true,
      orderId: orderResult.globalOrderId,
      userOrderId: orderResult.userOrderId,
      paymentId: paymentId,
      emailSent: emailResult.success,
      emailError: emailResult.success ? null : emailResult.error,
      orderData: completeOrderData
    };
  } catch (error) {
    console.error("❌ orderService: Critical error processing order:", error);
    
    // Provide more detailed error information for debugging
    let errorMessage = error.message;
    let userFriendlyMessage = 'Failed to process order. Please try again.';
    
    if (error.code) {
      errorMessage = `${error.code}: ${error.message}`;
      
      // Provide user-friendly error messages based on error codes
      switch (error.code) {
        case 'permission-denied':
          userFriendlyMessage = 'Permission denied. Please ensure you are logged in and try again.';
          break;
        case 'unavailable':
          userFriendlyMessage = 'Service temporarily unavailable. Please try again in a moment.';
          break;
        case 'deadline-exceeded':
          userFriendlyMessage = 'Request timed out. Please check your connection and try again.';
          break;
        case 'resource-exhausted':
          userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 'failed-precondition':
          userFriendlyMessage = 'Order validation failed. Please refresh and try again.';
          break;
        default:
          userFriendlyMessage = 'An error occurred while processing your order. Please try again.';
      }
    }
    
    // Log additional error details for debugging
    console.error("❌ orderService: Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      orderData: {
        userId: orderData?.userId,
        userEmail: orderData?.userEmail,
        itemCount: orderData?.items?.length,
        totalAmount: orderData?.totalAmount
      }
    });
    
    return {
      success: false,
      error: userFriendlyMessage,
      technicalError: errorMessage,
      emailSent: false,
      emailError: 'Order processing failed',
      errorCode: error.code || 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Update order status with comprehensive tracking and notification
 * This function manages the complete order status update workflow including:
 * - Status validation and progression rules
 * - History tracking with admin attribution
 * - User collection synchronization
 * - Email notifications for status changes
 * 
 * @param {string} orderId - Global order ID to update
 * @param {string} newStatus - New status from ORDER_STATUSES
 * @param {Object} updateInfo - Additional update information
 * @param {string} adminUserId - ID of admin making the change
 * @returns {Promise<Object>} - Update result with success status
 */
const updateOrderStatus = async (orderId, newStatus, updateInfo = {}, adminUserId = 'system') => {
  console.log(`🔄 orderService: Updating order ${orderId} status to ${newStatus}`);
  
  try {
    // Validate new status
    if (!Object.values(ORDER_STATUSES).includes(newStatus)) {
      throw new Error(`Invalid order status: ${newStatus}`);
    }
    
    // Get current order data for validation and user info
    const orderRef = doc(db, "orders", orderId);
    const orderSnapshot = await getDoc(orderRef);
    
    if (!orderSnapshot.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    const currentOrder = orderSnapshot.data();
    const currentStatus = currentOrder.status;
    
    // Validate status progression (business rules)
    const validTransitions = {
      [ORDER_STATUSES.PLACED]: [ORDER_STATUSES.APPROVED, ORDER_STATUSES.DECLINED, ORDER_STATUSES.CANCELLED],
      [ORDER_STATUSES.APPROVED]: [ORDER_STATUSES.PACKED, ORDER_STATUSES.CANCELLED],
      [ORDER_STATUSES.PACKED]: [ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED],
      [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.DELIVERED],
      [ORDER_STATUSES.DELIVERED]: [ORDER_STATUSES.REFUNDED], // Only if return requested
    };
    
    if (validTransitions[currentStatus] && !validTransitions[currentStatus].includes(newStatus)) {
      console.warn(`⚠️ orderService: Invalid status transition from ${currentStatus} to ${newStatus}`);
      // Allow the transition but log the warning - admin override capability
    }
    
    // Create status history entry with detailed information
    const statusUpdate = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: updateInfo.note || `Order ${newStatus.toLowerCase()} by admin`,
      updatedBy: adminUserId,
      metadata: updateInfo.metadata || {}
    };
    
    // Prepare update data
    const updateData = {
      status: newStatus,
      updatedAt: serverTimestamp(),
      statusHistory: [...(currentOrder.statusHistory || []), statusUpdate]
    };
    
    // Add status-specific fields
    switch (newStatus) {
      case ORDER_STATUSES.APPROVED:
        updateData.approvedAt = serverTimestamp();
        updateData.approvedBy = adminUserId;
        break;
      case ORDER_STATUSES.PACKED:
        updateData.packedAt = serverTimestamp();
        updateData.packedBy = adminUserId;
        break;
      case ORDER_STATUSES.SHIPPED:
        updateData.shippedAt = serverTimestamp();
        updateData.shippedBy = adminUserId;
        if (updateInfo.tracking) {
          updateData.tracking = {
            ...currentOrder.tracking,
            ...updateInfo.tracking
          };
        }
        break;
      case ORDER_STATUSES.DELIVERED:
        updateData.deliveredAt = serverTimestamp();
        break;
      case ORDER_STATUSES.DECLINED:
        updateData.declinedAt = serverTimestamp();
        updateData.declinedBy = adminUserId;
        updateData.declineReason = updateInfo.reason || 'No reason provided';
        break;
      case ORDER_STATUSES.CANCELLED:
        updateData.cancelledAt = serverTimestamp();
        updateData.cancelledBy = adminUserId;
        updateData.cancellationReason = updateInfo.reason || 'No reason provided';
        break;
      case ORDER_STATUSES.REFUNDED:
        updateData.refundedAt = serverTimestamp();
        updateData.refundedBy = adminUserId;
        updateData.refundReason = updateInfo.reason || 'Refund processed';
        break;
      default:
        // No additional fields needed for other statuses
        console.log(`📋 orderService: Status update to ${newStatus} - no additional fields required`);
        break;
    }
    
    // Use transaction to update both collections atomically
    await runTransaction(db, async (transaction) => {
      // Update global order collection
      transaction.update(orderRef, updateData);
      
      // Update user's order collection for data consistency
      if (currentOrder.userId) {
        const userOrdersQuery = query(
          collection(db, "users", currentOrder.userId, "orders"),
          where("globalOrderId", "==", orderId)
        );
        const userOrdersSnapshot = await getDocs(userOrdersQuery);
        
        userOrdersSnapshot.forEach(doc => {
          transaction.update(doc.ref, updateData);
        });
      }
      
      // Handle inventory restoration for cancelled/declined orders
      if ([ORDER_STATUSES.CANCELLED, ORDER_STATUSES.DECLINED].includes(newStatus)) {
        for (const item of currentOrder.items || []) {
          const productRef = doc(db, "products", item.productId);
          const productDoc = await transaction.get(productRef);
          
          if (productDoc.exists()) {
            const currentStock = productDoc.data().stock || 0;
            const restoredStock = currentStock + item.quantity;
            
            transaction.update(productRef, {
              stock: restoredStock,
              lastRestored: serverTimestamp()
            });
            
            console.log(`📦 orderService: Restored stock for ${item.name}: ${currentStock} → ${restoredStock}`);
          }
        }
      }
    });
    
    console.log(`✅ orderService: Order ${orderId} status updated to ${newStatus}`);
    
    // Send status change notification email if configured
    if (featureConfig.email.enabled && updateInfo.notifyCustomer !== false) {
      try {
        await sendStatusChangeNotification(currentOrder, newStatus, updateInfo);
      } catch (emailError) {
        console.error('❌ orderService: Failed to send status change notification:', emailError);
      }
    }
    
    return { 
      success: true, 
      message: `Order status updated to ${newStatus}`,
      oldStatus: currentStatus,
      newStatus: newStatus
    };
  } catch (error) {
    console.error('❌ orderService: Error updating order status:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update order status'
    };
  }
};

/**
 * Updates an order status to shipped and adds tracking information
 * This is a specialized function for the shipping workflow that includes
 * comprehensive tracking data and customer notifications
 * 
 * @param {string} orderId - Order ID to update
 * @param {Object} shipmentInfo - Complete shipping information
 * @param {string} userId - User ID of the order owner
 * @param {string} adminUserId - ID of admin processing the shipment
 * @returns {Promise<Object>} - Result of the shipment update
 */
const updateOrderToShipped = async (orderId, shipmentInfo, userId, adminUserId = 'system') => {
  console.log(`🚚 orderService: Processing shipment for order ${orderId}`);
  
  try {
    // Validate required parameters
    if (!orderId || !shipmentInfo || !userId) {
      throw new Error('Missing required parameters for shipment update');
    }
    
    // Validate shipment information
    if (!shipmentInfo.trackingNumber || !shipmentInfo.carrier) {
      throw new Error('Tracking number and carrier are required for shipment');
    }
    
    // Get the order data from Firestore
    const orderRef = doc(db, "orders", orderId);
    const orderSnapshot = await getDoc(orderRef);
    
    if (!orderSnapshot.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    const order = orderSnapshot.data();
    
    // Validate order can be shipped
    if (order.status !== ORDER_STATUSES.PACKED) {
      throw new Error(`Order must be in ${ORDER_STATUSES.PACKED} status to ship. Current status: ${order.status}`);
    }
    
    // Get the user data from Firestore for email notification
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userData = userSnapshot.data();
    
    // Generate tracking URL based on carrier
    let trackingUrl = null;
    const carrier = Object.values(SHIPPING_CARRIERS).find(c => 
      c.name.toLowerCase() === shipmentInfo.carrier.toLowerCase()
    );
    
    if (carrier) {
      trackingUrl = carrier.trackingUrl;
    }
    
    // Calculate estimated delivery date
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 
      (order.shipping?.method === 'Express Shipping' ? 2 : 7));
    
    // Prepare comprehensive tracking information
    const trackingData = {
      code: shipmentInfo.trackingNumber,
      carrier: shipmentInfo.carrier,
      url: trackingUrl,
      estimatedDelivery: estimatedDeliveryDate.toISOString(),
      shippedDate: new Date().toISOString(),
      carrier_service: shipmentInfo.service || 'standard',
      weight: shipmentInfo.weight || null,
      dimensions: shipmentInfo.dimensions || null
    };
    
    // Use the enhanced updateOrderStatus function for consistency
    const updateResult = await updateOrderStatus(
      orderId, 
      ORDER_STATUSES.SHIPPED, 
      {
        tracking: trackingData,
        note: `Order shipped via ${shipmentInfo.carrier} with tracking number ${shipmentInfo.trackingNumber}`,
        notifyCustomer: true,
        metadata: {
          shippingService: shipmentInfo.service,
          weight: shipmentInfo.weight,
          estimatedDeliveryDays: order.shipping?.method === 'Express Shipping' ? 2 : 7
        }
      },
      adminUserId
    );
    
    if (!updateResult.success) {
      throw new Error(updateResult.error);
    }
    
    // Send shipping notification email if email feature is enabled
    if (featureConfig.email.enabled) {
      try {
        const enrichedOrder = {
          ...order,
          status: ORDER_STATUSES.SHIPPED,
          tracking: trackingData
        };
        
        const emailData = {
          email: userData.email,
          displayName: userData.name || userData.displayName || userData.email
        };
        
        await sendOrderShippedEmail(enrichedOrder, emailData, shipmentInfo);
        console.log('📧 orderService: Order shipped notification email sent successfully');
      } catch (emailError) {
        console.error('❌ orderService: Failed to send shipment notification email:', emailError);
      }
    }
    
    console.log(`✅ orderService: Order ${orderId} successfully updated to shipped status`);
    
    return { 
      success: true, 
      message: 'Order status updated to shipped with tracking information',
      trackingNumber: shipmentInfo.trackingNumber,
      carrier: shipmentInfo.carrier,
      estimatedDelivery: estimatedDeliveryDate.toISOString()
    };
  } catch (error) {
    console.error('❌ orderService: Error updating order to shipped:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update order to shipped status'
    };
  }
};

/**
 * Retrieve a single order by its ID with comprehensive data
 * This function fetches complete order information including enriched metadata
 * 
 * @param {string} orderId - The order ID to fetch
 * @param {boolean} includeUserData - Whether to include user information
 * @returns {Promise<Object>} - Order data with success status
 */
const getOrderById = async (orderId, includeUserData = false) => {
  console.log(`🔍 orderService: Fetching order ${orderId}`);
  
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnapshot = await getDoc(orderRef);
    
    if (!orderSnapshot.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    let orderData = { id: orderSnapshot.id, ...orderSnapshot.data() };
    
    // Include user data if requested and available
    if (includeUserData && orderData.userId) {
      try {
        const userRef = doc(db, "users", orderData.userId);
        const userSnapshot = await getDoc(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          orderData.customer = {
            name: userData.name || userData.displayName,
            email: userData.email,
            phone: userData.phone,
            registrationDate: userData.createdAt
          };
        }
      } catch (userError) {
        console.warn('⚠️ orderService: Could not fetch user data for order:', userError);
      }
    }
    
    console.log(`✅ orderService: Order ${orderId} fetched successfully`);
    return {
      success: true,
      order: orderData
    };
  } catch (error) {
    console.error('❌ orderService: Error fetching order:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch order'
    };
  }
};

/**
 * Retrieve all orders with advanced filtering and pagination
 * This function provides comprehensive order listing for admin interfaces
 * 
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination settings
 * @returns {Promise<Object>} - Orders list with metadata
 */
const getAllOrders = async (filters = {}, pagination = {}) => {
  console.log('📋 orderService: Fetching orders with filters:', filters);
  
  try {
    let ordersQuery = collection(db, "orders");
    
    // Apply status filter if specified
    if (filters.status && filters.status !== 'all') {
      ordersQuery = query(ordersQuery, where("status", "==", filters.status));
    }
    
    // Apply date range filter if specified
    if (filters.startDate) {
      ordersQuery = query(ordersQuery, where("createdAt", ">=", new Date(filters.startDate)));
    }
    
    if (filters.endDate) {
      ordersQuery = query(ordersQuery, where("createdAt", "<=", new Date(filters.endDate)));
    }
    
    // Apply user filter if specified
    if (filters.userId) {
      ordersQuery = query(ordersQuery, where("userId", "==", filters.userId));
    }
    
    // Apply ordering
    const orderField = filters.orderBy || "createdAt";
    const orderDirection = filters.orderDirection || "desc";
    ordersQuery = query(ordersQuery, orderBy(orderField, orderDirection));
    
    // Execute query
    const ordersSnapshot = await getDocs(ordersQuery);
    
    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Apply client-side pagination if needed
    let paginatedOrders = orders;
    if (pagination.limit) {
      const startIndex = (pagination.page - 1) * pagination.limit || 0;
      paginatedOrders = orders.slice(startIndex, startIndex + pagination.limit);
    }
    
    console.log(`✅ orderService: Retrieved ${orders.length} orders (showing ${paginatedOrders.length})`);
    
    return {
      success: true,
      orders: paginatedOrders,
      totalCount: orders.length,
      hasMore: pagination.limit ? (orders.length > pagination.limit * (pagination.page || 1)) : false
    };
  } catch (error) {
    console.error('❌ orderService: Error fetching orders:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch orders',
      orders: [],
      totalCount: 0
    };
  }
};

/**
 * Generate analytics data for orders
 * Provides comprehensive order statistics for admin dashboard
 * 
 * @param {Object} filters - Time range and other filters
 * @returns {Promise<Object>} - Analytics data
 */
const getOrderAnalytics = async (filters = {}) => {
  console.log('📊 orderService: Generating order analytics');
  
  try {
    const ordersResult = await getAllOrders(filters);
    
    if (!ordersResult.success) {
      throw new Error(ordersResult.error);
    }
    
    const orders = ordersResult.orders;
    
    // Calculate basic statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.financials?.total || order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Status distribution
    const statusDistribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    // Top products
    const productCounts = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
      });
    });
    
    return {
      success: true,
      analytics: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        statusDistribution,
        topProducts: Object.entries(productCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([productId, count]) => ({ productId, count }))
      }
    };
  } catch (error) {
    console.error('❌ orderService: Error generating analytics:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate analytics'
    };
  }
};

/**
 * Send status change notification email to customer
 * Internal helper function for customer notifications
 * 
 * @param {Object} order - Order data
 * @param {string} newStatus - New order status
 * @param {Object} updateInfo - Additional update information
 */
const sendStatusChangeNotification = async (order, newStatus, updateInfo) => {
  // This is a placeholder for status change email functionality
  // In a real implementation, you would send different emails based on status
  console.log(`📧 orderService: Sending ${newStatus} notification for order ${order.orderId}`);
  
  // Different email templates based on status
  switch (newStatus) {
    case ORDER_STATUSES.APPROVED:
      // Send order approved email
      break;
    case ORDER_STATUSES.SHIPPED:
      // Handled by updateOrderToShipped function
      break;
    case ORDER_STATUSES.DELIVERED:
      // Send delivery confirmation email
      break;
    case ORDER_STATUSES.DECLINED:
      // Send order declined email with reason
      break;
    default:
      console.log(`📧 orderService: No specific email template for status ${newStatus}`);
  }
};

/**
 * Generates a unique order ID with timestamp and random components
 * Ensures uniqueness and provides chronological ordering
 * 
 * @returns {string} - A unique order ID
 */
const generateOrderId = () => {
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${randomNum}`;
};

/**
 * Bulk update orders with batch operations
 * Efficient way to update multiple orders simultaneously
 * 
 * @param {Array} orderUpdates - Array of {orderId, updateData} objects
 * @param {string} adminUserId - ID of admin performing bulk update
 * @returns {Promise<Object>} - Bulk update result
 */
const bulkUpdateOrders = async (orderUpdates, adminUserId = 'system') => {
  console.log(`🔄 orderService: Performing bulk update on ${orderUpdates.length} orders`);
  
  try {
    const batch = writeBatch(db);
    const results = [];
    
    for (const update of orderUpdates) {
      const orderRef = doc(db, "orders", update.orderId);
      const updateData = {
        ...update.updateData,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: adminUserId
      };
      
      batch.update(orderRef, updateData);
      results.push({ orderId: update.orderId, success: true });
    }
    
    await batch.commit();
    
    console.log(`✅ orderService: Bulk update completed for ${orderUpdates.length} orders`);
    
    return {
      success: true,
      results: results,
      updatedCount: orderUpdates.length
    };
  } catch (error) {
    console.error('❌ orderService: Error in bulk update:', error);
    return {
      success: false,
      error: error.message || 'Failed to perform bulk update'
    };
  }
};

// Export all functions for use in other modules
// Note: ORDER_STATUSES and SHIPPING_CARRIERS are already exported as named exports above
export {
  // Core order processing functions
  processNewOrder,
  updateOrderStatus,
  updateOrderToShipped,
  getOrderById,
  getAllOrders,
  
  // Analytics and reporting
  getOrderAnalytics,
  
  // Utility functions
  generateOrderId,
  bulkUpdateOrders
}; 