/**
 * Order Service
 * 
 * This utility handles order-related operations, including sending order emails.
 * It uses the email service to send emails based on configuration settings.
 */

import { sendOrderShippedEmail, sendOrderConfirmationEmail } from './emailService';
import featureConfig from './featureConfig';
import { doc, updateDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Process a new order and create the order record in Firestore
 * Also handles sending order confirmation email
 * 
 * @param {Object} orderData - The order data
 * @param {Object} userData - The user data
 * @returns {Promise<Object>} - Success status, order ID, and email status
 */
const processNewOrder = async (orderData, userData) => {
  console.log('orderService: Processing new order for user:', userData?.email);
  
  try {
    // Generate unique payment ID with timestamp prefix
    const timestamp = new Date().getTime().toString().slice(-6);
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const paymentId = `PAY-${timestamp}-${randomId}`;
    
    // Add additional metadata to order
    const completeOrderData = {
      ...orderData,
      createdAt: serverTimestamp(),
      paymentId: paymentId,
      // Ensure orderId is available for email template
      orderId: orderData.orderId || `ORDER-${timestamp}-${randomId}`,
      // Add user info to order for easier access
      userName: userData?.displayName || userData?.name || userData?.email || 'Valued Customer',
      userEmail: userData?.email || orderData.userEmail,
      userPhone: userData?.phone || orderData.userPhone,
    };
    
    console.log('orderService: Creating order document in Firestore');
    
    // Create a new document in the orders collection
    const orderRef = await addDoc(collection(db, "orders"), completeOrderData);
    
    console.log('orderService: Order created successfully with ID:', orderRef.id);
    
    // Prepare order data for email (include generated ID)
    const orderForEmail = {
      ...completeOrderData,
      id: orderRef.id,
      orderId: orderRef.id, // Use the Firestore ID as the order ID for consistency
    };
    
    // Send order confirmation email if email feature is enabled
    let emailResult = { success: false, error: 'Email not attempted' };
    
    if (featureConfig.email.enabled) {
      console.log('orderService: Email is enabled, sending order confirmation');
      
      try {
        // Prepare user data for email service
        const userForEmail = {
          email: userData?.email || orderData.userEmail,
          displayName: userData?.displayName || userData?.name || userData?.email || 'Valued Customer',
          name: userData?.name || userData?.displayName || 'Valued Customer'
        };
        
        console.log('orderService: Calling sendOrderConfirmationEmail with:', {
          orderId: orderForEmail.orderId,
          userEmail: userForEmail.email
        });
        
        emailResult = await sendOrderConfirmationEmail(orderForEmail, userForEmail);
        
        if (emailResult.success) {
          console.log('orderService: Order confirmation email sent successfully');
        } else {
          console.error('orderService: Failed to send order confirmation email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('orderService: Error sending order confirmation email:', emailError);
        emailResult = { success: false, error: emailError.message };
      }
    } else {
      console.log('orderService: Email is disabled in configuration, skipping email');
      emailResult = { success: false, error: 'Email disabled in configuration' };
    }
    
    // Return success with order ID, payment ID, and email status
    return {
      success: true,
      orderId: orderRef.id,
      paymentId: paymentId,
      emailSent: emailResult.success,
      emailError: emailResult.success ? null : emailResult.error
    };
  } catch (error) {
    console.error("orderService: Error processing order:", error);
    return {
      success: false,
      error: error.message,
      emailSent: false,
      emailError: 'Order processing failed'
    };
  }
};

/**
 * Updates an order status to shipped and sends notification email
 * @param {string} orderId - Order ID to update
 * @param {Object} shipmentInfo - Shipping information
 * @param {string} userId - User ID of the order owner
 * @returns {Promise<Object>} - Result of the order update
 */
const updateOrderToShipped = async (orderId, shipmentInfo, userId) => {
  try {
    if (!orderId || !shipmentInfo || !userId) {
      throw new Error('Missing required parameters');
    }
    
    // Get the order data from Firestore
    const orderRef = doc(db, "orders", orderId);
    const orderSnapshot = await getDoc(orderRef);
    
    if (!orderSnapshot.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    const order = orderSnapshot.data();
    
    // Get the user data from Firestore
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userData = userSnapshot.data();
    
    // Update the order with shipping information
    const updatedOrder = {
      ...order,
      status: "Shipped",
      tracking: {
        code: shipmentInfo.trackingNumber,
        carrier: shipmentInfo.carrier,
        url: shipmentInfo.trackingUrl || null
      },
      statusHistory: [
        ...(order.statusHistory || []),
        {
          status: "Shipped",
          timestamp: new Date().toISOString(),
          note: `Order shipped via ${shipmentInfo.carrier}`
        }
      ],
      shippedAt: new Date().toISOString()
    };
    
    // Update the order in Firestore
    await updateDoc(orderRef, updatedOrder);
    
    // Update the user's order record
    const userOrderRef = doc(db, "users", userId, "orders", orderId);
    await updateDoc(userOrderRef, { 
      status: "Shipped",
      shippedAt: new Date().toISOString()
    });
    
    // Send shipping notification email if email feature is enabled
    if (featureConfig.email.enabled) {
      const emailData = {
        email: userData.email,
        displayName: userData.name || userData.displayName || userData.email
      };
      
      await sendOrderShippedEmail(updatedOrder, emailData, shipmentInfo);
      console.log('Order shipped notification email sent successfully');
    }
    
    return { 
      success: true, 
      message: 'Order status updated to shipped' 
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update order status'
    };
  }
};

/**
 * Generates a unique order ID
 * @returns {string} - A unique order ID
 */
const generateOrderId = () => {
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${randomNum}`;
};

/**
 * Gets an order by its ID
 * @param {string} orderId - The order ID
 * @returns {Promise<Object>} - The order data
 */
const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnapshot = await getDoc(orderRef);
    
    if (!orderSnapshot.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    return {
      success: true,
      order: { id: orderSnapshot.id, ...orderSnapshot.data() }
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch order'
    };
  }
};

export {
  processNewOrder,
  updateOrderToShipped,
  getOrderById,
  generateOrderId
}; 