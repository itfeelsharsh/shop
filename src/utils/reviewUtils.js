import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';

/**
 * Utility functions for managing product reviews
 */
const reviewUtils = {
  /**
   * Check if a user has purchased and received a product
   * 
   * @param {string} userId - ID of the user
   * @param {string} productId - ID of the product
   * @returns {Promise<boolean>} - Whether the user has purchased and received the product
   */
  async hasUserPurchasedAndReceived(userId, productId) {
    try {
      // Get all delivered orders for this user
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        where("status", "==", "Delivered")
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      
      // Check if any of the delivered orders contain this product
      for (const orderDoc of ordersSnapshot.docs) {
        const orderData = orderDoc.data();
        
        // Check if the items array exists and has the product
        if (orderData.items && Array.isArray(orderData.items)) {
          const foundItem = orderData.items.find(item => item.productId === productId);
          if (foundItem) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking if user purchased product:", error);
      return false;
    }
  },
  
  /**
   * Check if user has already reviewed a product
   * 
   * @param {string} userId - ID of the user
   * @param {string} productId - ID of the product
   * @returns {Promise<Object|null>} - The review object if found, null otherwise
   */
  async hasUserReviewedProduct(userId, productId) {
    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("userId", "==", userId),
        where("productId", "==", productId)
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      if (reviewsSnapshot.empty) {
        return null;
      }
      
      // Return the first review found (there should only be one per user per product)
      return {
        id: reviewsSnapshot.docs[0].id,
        ...reviewsSnapshot.docs[0].data()
      };
    } catch (error) {
      console.error("Error checking if user reviewed product:", error);
      return null;
    }
  },
  
  /**
   * Get all reviews for a product
   * 
   * @param {string} productId - ID of the product
   * @returns {Promise<Array>} - Array of review objects
   */
  async getProductReviews(productId) {
    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("productId", "==", productId),
        orderBy("createdAt", "desc")
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      return reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to Date objects
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : null
      }));
    } catch (error) {
      console.error("Error getting product reviews:", error);
      return [];
    }
  },
  
  /**
   * Submit a review for a product
   * 
   * @param {Object} reviewData - The review data
   * @param {string} reviewData.productId - ID of the product
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.text - Review text
   * @returns {Promise<Object>} - The submitted review
   */
  async submitReview(reviewData) {
    try {
      const { productId, rating, text } = reviewData;
      
      // Get the current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be logged in to submit a review");
      }
      
      // Check if user has purchased and received the product
      const hasPurchased = await this.hasUserPurchasedAndReceived(user.uid, productId);
      if (!hasPurchased) {
        throw new Error("You can only review products you've purchased and received");
      }
      
      // Check if user has already reviewed this product
      const existingReview = await this.hasUserReviewedProduct(user.uid, productId);
      if (existingReview) {
        throw new Error("You have already reviewed this product");
      }
      
      // Get user profile data
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Create review data
      const newReviewData = {
        userId: user.uid,
        productId,
        rating,
        text,
        userName: userData.name || user.displayName || user.email,
        userProfilePic: userData.profilePic || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // Add to main reviews collection
      const reviewRef = await addDoc(collection(db, "reviews"), newReviewData);
      
      // Also add to the product's reviews subcollection
      await addDoc(collection(db, "products", productId, "reviews"), {
        ...newReviewData,
        reviewId: reviewRef.id // Link to main review document
      });
      
      return {
        id: reviewRef.id,
        ...newReviewData,
        createdAt: newReviewData.createdAt.toDate(),
        updatedAt: newReviewData.updatedAt.toDate()
      };
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  },
  
  /**
   * Calculate the average rating for a product
   * 
   * @param {string} productId - ID of the product
   * @returns {Promise<Object>} - Rating statistics
   */
  async getProductRatingStats(productId) {
    try {
      const reviews = await this.getProductReviews(productId);
      
      if (reviews.length === 0) {
        return { average: 0, count: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, total: 0 };
      }
      
      // Calculate total and average
      const total = reviews.reduce((sum, review) => sum + review.rating, 0);
      const average = total / reviews.length;
      
      // Count by rating
      const count = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        count[review.rating] = (count[review.rating] || 0) + 1;
      });
      
      return { 
        average, 
        count,
        total: reviews.length
      };
    } catch (error) {
      console.error("Error calculating product rating stats:", error);
      return { average: 0, count: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, total: 0 };
    }
  },
  
  /**
   * Update a review
   * 
   * @param {string} reviewId - ID of the review to update
   * @param {Object} data - Updated review data
   * @param {number} data.rating - Updated rating (1-5)
   * @param {string} data.text - Updated review text
   * @returns {Promise<Object>} - The updated review
   */
  async updateReview(reviewId, data) {
    try {
      const { rating, text } = data;
      
      // Get the current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be logged in to update a review");
      }
      
      // Get the review to update
      const reviewDoc = await getDoc(doc(db, "reviews", reviewId));
      
      if (!reviewDoc.exists()) {
        throw new Error("Review not found");
      }
      
      const reviewData = reviewDoc.data();
      
      // Check if this is the user's review
      if (reviewData.userId !== user.uid) {
        throw new Error("You can only update your own reviews");
      }
      
      // Update the review
      const updateData = {
        rating,
        text,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(doc(db, "reviews", reviewId), updateData);
      
      // Update in product's subcollection if it exists
      const productReviewsQuery = query(
        collection(db, "products", reviewData.productId, "reviews"),
        where("userId", "==", user.uid)
      );
      
      const productReviewsSnapshot = await getDocs(productReviewsQuery);
      
      if (!productReviewsSnapshot.empty) {
        const productReviewDoc = productReviewsSnapshot.docs[0];
        await updateDoc(doc(db, "products", reviewData.productId, "reviews", productReviewDoc.id), updateData);
      }
      
      return {
        id: reviewId,
        ...reviewData,
        ...updateData,
        updatedAt: updateData.updatedAt.toDate(),
        createdAt: reviewData.createdAt.toDate()
      };
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },
  
  /**
   * Delete a review
   * 
   * @param {string} reviewId - ID of the review to delete
   * @returns {Promise<boolean>} - Whether the deletion was successful
   */
  async deleteReview(reviewId) {
    try {
      // Get the current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be logged in to delete a review");
      }
      
      // Get the review to delete
      const reviewDoc = await getDoc(doc(db, "reviews", reviewId));
      
      if (!reviewDoc.exists()) {
        throw new Error("Review not found");
      }
      
      const reviewData = reviewDoc.data();
      
      // Check if this is the user's review
      if (reviewData.userId !== user.uid) {
        throw new Error("You can only delete your own reviews");
      }
      
      // Delete the review from main collection
      await deleteDoc(doc(db, "reviews", reviewId));
      
      // Delete from product's subcollection if it exists
      const productReviewsQuery = query(
        collection(db, "products", reviewData.productId, "reviews"),
        where("userId", "==", user.uid)
      );
      
      const productReviewsSnapshot = await getDocs(productReviewsQuery);
      
      if (!productReviewsSnapshot.empty) {
        const productReviewDoc = productReviewsSnapshot.docs[0];
        await deleteDoc(doc(db, "products", reviewData.productId, "reviews", productReviewDoc.id));
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  }
};

export default reviewUtils; 