/**
 * Order Service
 * 
 * This utility handles order-related operations, including sending order emails.
 * It uses the email service to send emails based on configuration settings.
 */

import { sendOrderConfirmationEmail, sendOrderShippedEmail } from './emailService';
import featureConfig from './featureConfig';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Processes a new order after payment is confirmed
 * @param {Object} orderData - The order data
 * @param {Object} userData - The user data
 * @returns {Promise<Object>} - Result of the order processing
 */
const processNewOrder = async (orderData, userData) => {
  try {
    // Validate order data
    if (!orderData || !userData || !userData.uid) {
      throw new Error('Invalid order or user data');
    }

    // Generate a unique order ID if not provided
    const orderId = orderData.orderId || generateOrderId();
    const fullOrderData = { ...orderData, orderId };
    
    // Save the order in Firestore
    const orderRef = doc(db, "orders", orderId);
    await setDoc(orderRef, fullOrderData);
    
    // Save the order in the user's orders collection
    const userOrderRef = doc(db, "users", userData.uid, "orders", orderId);
    await setDoc(userOrderRef, { 
      orderId, 
      timestamp: new Date().toISOString(),
      status: fullOrderData.status || "Placed"
    });
    
    // Send confirmation email only if email feature is enabled
    if (featureConfig.email.enabled) {
      await sendOrderConfirmationEmail(fullOrderData, userData);
      console.log('Order confirmation email sent successfully');
    }
    
    return { 
      success: true, 
      orderId: orderId,
      message: 'Order processed successfully' 
    };
  } catch (error) {
    console.error('Error processing order:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to process order'
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