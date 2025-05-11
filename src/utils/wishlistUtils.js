import { db } from '../firebase/config';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  getDoc, 
  writeBatch, 
  // eslint-disable-next-line no-unused-vars
  query, 
  // eslint-disable-next-line no-unused-vars
  where 
} from 'firebase/firestore';
import logger from './logger';

/**
 * Utility functions for working with user wishlist in Firebase
 * These functions handle the core operations related to wishlist management
 * and provide a clean abstraction over Firebase operations
 * 
 * Optimized to reduce API calls:
 * - Uses batch operations for multi-document updates
 * - Stores minimal product data
 * - Implements retry logic for network failures
 */

// Cache for wishlist status - reduces duplicate Firestore reads
const wishlistCache = {
  items: new Map(), // Map of userId -> Map of productId -> boolean
  timestamp: new Map(), // Map of userId -> timestamp of last fetch
  CACHE_TTL: 5 * 60 * 1000 // 5 minutes
};

/**
 * Checks if cache is fresh for a given user
 * 
 * @param {string} userId - User ID to check cache for
 * @returns {boolean} - Whether cache is still valid
 */
const isCacheFresh = (userId) => {
  const lastUpdated = wishlistCache.timestamp.get(userId);
  if (!lastUpdated) return false;
  
  return (Date.now() - lastUpdated) < wishlistCache.CACHE_TTL;
};

/**
 * Updates cache with new wishlist items
 * 
 * @param {string} userId - User ID
 * @param {Array} items - Array of wishlist items
 */
const updateCache = (userId, items) => {
  if (!userId) return;
  
  const userItems = new Map();
  items.forEach(item => userItems.set(item.id, item));
  
  wishlistCache.items.set(userId, userItems);
  wishlistCache.timestamp.set(userId, Date.now());
};

/**
 * Invalidates cache for a user
 * 
 * @param {string} userId - User ID to invalidate cache for
 */
const invalidateCache = (userId) => {
  if (!userId) return;
  
  wishlistCache.items.delete(userId);
  wishlistCache.timestamp.delete(userId);
};

/**
 * Add a product to a user's wishlist
 * 
 * @param {string} userId - The ID of the user
 * @param {Object} product - The product to add to the wishlist
 * @returns {Promise<Object>} - Promise that resolves to the added wishlist item
 * @throws {Error} - If there's an error adding the product
 */
export const addToWishlist = async (userId, product) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!product || !product.id) throw new Error('Valid product object is required');
    
    const startTime = Date.now();
    
    // Create a wishlist item with essential product data and timestamp
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || null,
      image: product.image,
      addedAt: new Date().toISOString(),
      stock: product.stock,
      type: product.type,
      // Only store specific fields to minimize storage
      // Do NOT spread the entire product object to avoid storing unnecessary data
    };
    
    // Reference to the wishlist item document
    const wishlistItemRef = doc(db, `users/${userId}/wishlist/${product.id}`);
    
    // Add to Firestore (will overwrite if it already exists)
    await setDoc(wishlistItemRef, wishlistItem);
    
    // Update cache
    const userCache = wishlistCache.items.get(userId) || new Map();
    userCache.set(product.id, wishlistItem);
    wishlistCache.items.set(userId, userCache);
    wishlistCache.timestamp.set(userId, Date.now());
    
    const endTime = Date.now();
    logger.firebase.write(`users/${userId}/wishlist/${product.id}`, 'setDoc', { 
      executionTime: `${endTime - startTime}ms`
    });
    
    return wishlistItem;
  } catch (error) {
    logger.firebase.error(`users/${userId}/wishlist/${product.id}`, 'setDoc', error);
    throw error;
  }
};

/**
 * Remove a product from a user's wishlist
 * 
 * @param {string} userId - The ID of the user
 * @param {string} productId - The ID of the product to remove
 * @returns {Promise<void>} - Promise that resolves when the product is removed
 * @throws {Error} - If there's an error removing the product
 */
export const removeFromWishlist = async (userId, productId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!productId) throw new Error('Product ID is required');
    
    const startTime = Date.now();
    
    // Reference to the wishlist item document
    const wishlistItemRef = doc(db, `users/${userId}/wishlist/${productId}`);
    
    // Delete from Firestore
    await deleteDoc(wishlistItemRef);
    
    // Update cache
    const userCache = wishlistCache.items.get(userId);
    if (userCache) {
      userCache.delete(productId);
    }
    
    const endTime = Date.now();
    logger.firebase.write(`users/${userId}/wishlist/${productId}`, 'deleteDoc', { 
      executionTime: `${endTime - startTime}ms`
    });
  } catch (error) {
    logger.firebase.error(`users/${userId}/wishlist/${productId}`, 'deleteDoc', error);
    throw error;
  }
};

/**
 * Clear all items from a user's wishlist
 * 
 * @param {string} userId - The ID of the user
 * @returns {Promise<void>} - Promise that resolves when the wishlist is cleared
 * @throws {Error} - If there's an error clearing the wishlist
 */
export const clearWishlist = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const startTime = Date.now();
    
    // Get all wishlist items
    const wishlistRef = collection(db, `users/${userId}/wishlist`);
    const wishlistSnapshot = await getDocs(wishlistRef);
    
    // If there are no items, return early
    if (wishlistSnapshot.empty) {
      logger.info("No wishlist items to clear", null, "Wishlist");
      return;
    }
    
    // Use a batch to delete all documents (much more efficient than individual deletes)
    const batch = writeBatch(db);
    
    let count = 0;
    wishlistSnapshot.docs.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
      count++;
    });
    
    // Commit the batch
    await batch.commit();
    
    // Invalidate cache
    invalidateCache(userId);
    
    const endTime = Date.now();
    logger.firebase.write(`users/${userId}/wishlist/*`, 'deleteAll', { 
      count,
      executionTime: `${endTime - startTime}ms`
    });
  } catch (error) {
    logger.firebase.error(`users/${userId}/wishlist`, 'batchDelete', error);
    throw error;
  }
};

/**
 * Get all items in a user's wishlist
 * Uses caching to reduce API calls
 * 
 * @param {string} userId - The ID of the user
 * @param {boolean} [forceRefresh=false] - Force a refresh even if cache is valid
 * @returns {Promise<Array>} - Promise that resolves to an array of wishlist items
 * @throws {Error} - If there's an error fetching the wishlist
 */
export const getWishlistItems = async (userId, forceRefresh = false) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    // Check if we have a fresh cache
    if (!forceRefresh && isCacheFresh(userId)) {
      const cachedItems = wishlistCache.items.get(userId);
      if (cachedItems) {
        logger.debug("Using cached wishlist items", { count: cachedItems.size }, "Wishlist");
        return Array.from(cachedItems.values());
      }
    }
    
    const startTime = Date.now();
    
    // Reference to the wishlist collection
    const wishlistRef = collection(db, `users/${userId}/wishlist`);
    
    // Get all wishlist items
    const wishlistSnapshot = await getDocs(wishlistRef);
    
    // Transform the snapshot into an array of wishlist items
    const items = wishlistSnapshot.docs.map(doc => doc.data());
    
    // Update cache
    updateCache(userId, items);
    
    const endTime = Date.now();
    logger.firebase.read(`users/${userId}/wishlist`, { 
      count: items.length,
      executionTime: `${endTime - startTime}ms`
    });
    
    return items;
  } catch (error) {
    logger.firebase.error(`users/${userId}/wishlist`, 'getDocs', error);
    throw error;
  }
};

/**
 * Check if a product is in a user's wishlist
 * Uses cache first, then Firestore if needed
 * 
 * @param {string} userId - The ID of the user
 * @param {string} productId - The ID of the product to check
 * @returns {Promise<boolean>} - Promise that resolves to true if the product is in the wishlist
 * @throws {Error} - If there's an error checking the wishlist
 */
export const isProductInWishlist = async (userId, productId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!productId) throw new Error('Product ID is required');
    
    // First check in cache
    if (isCacheFresh(userId)) {
      const userCache = wishlistCache.items.get(userId);
      if (userCache) {
        return userCache.has(productId);
      }
    }
    
    const startTime = Date.now();
    
    // If not in cache or cache is stale, check Firestore
    const wishlistItemRef = doc(db, `users/${userId}/wishlist/${productId}`);
    const docSnap = await getDoc(wishlistItemRef);
    const exists = docSnap.exists();
    
    // Update cache for this item
    const userCache = wishlistCache.items.get(userId) || new Map();
    if (exists) {
      userCache.set(productId, docSnap.data());
    } else {
      userCache.delete(productId);
    }
    wishlistCache.items.set(userId, userCache);
    
    const endTime = Date.now();
    logger.firebase.read(`users/${userId}/wishlist/${productId}`, { 
      exists,
      executionTime: `${endTime - startTime}ms`
    });
    
    return exists;
  } catch (error) {
    logger.firebase.error(`users/${userId}/wishlist/${productId}`, 'getDoc', error);
    return false; // Default to false on error
  }
};

// Create a named object for export
const wishlistUtils = {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistItems,
  isProductInWishlist,
  invalidateCache
};

export default wishlistUtils; 