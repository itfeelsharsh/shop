import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { Star, Edit2, Trash2, AlertCircle, ShoppingBag, Package2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

/**
 * UserReviews component displays all reviews by the current user
 * and allows them to manage their reviews.
 * Also shows products from delivered orders that can be reviewed.
 * 
 * @returns {JSX.Element} The UserReviews component
 */
function UserReviews() {
  const [user] = useAuthState(auth);
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewableProducts, setReviewableProducts] = useState([]);
  const [loadingReviewable, setLoadingReviewable] = useState(false);
  const [newReview, setNewReview] = useState({
    productId: '',
    text: '',
    rating: 0
  });
  const [isSubmittingNewReview, setIsSubmittingNewReview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  /**
   * Fetch all reviews by the current user
   */
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Query reviews collection for all reviews by this user
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        // Prepare an array to hold reviews with product details
        const reviewsWithProducts = [];
        
        // For each review, fetch the associated product details
        for (const reviewDoc of reviewsSnapshot.docs) {
          const reviewData = reviewDoc.data();
          
          // Fetch product details
          const productDoc = await getDoc(doc(db, "products", reviewData.productId));
          
          if (productDoc.exists()) {
            const productData = productDoc.data();
            
            reviewsWithProducts.push({
              id: reviewDoc.id,
              ...reviewData,
              product: {
                id: productDoc.id,
                name: productData.name,
                image: productData.image
              },
              // Convert Firestore timestamp to Date object if it exists
              createdAt: reviewData.createdAt ? reviewData.createdAt.toDate() : new Date()
            });
          }
        }
        
        setReviews(reviewsWithProducts);
      } catch (error) {
        console.error("Error fetching user reviews:", error);
        toast.error("Failed to load your reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserReviews();
  }, [user]);
  
  /**
   * Fetch all delivered orders for the current user
   * to determine which products they can review
   */
  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      if (!user) return;
      
      try {
        setLoadingReviewable(true);
        // Query orders that have been delivered
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          where("status", "==", "Delivered")
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        
        const orders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Extract unique product IDs from delivered orders
        const productIds = new Set();
        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              if (item.productId) {
                productIds.add(item.productId);
              }
            });
          }
        });
        
        // Check which products the user has already reviewed
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("userId", "==", user.uid)
        );
        
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const alreadyReviewedProductIds = new Set(
          reviewsSnapshot.docs.map(doc => doc.data().productId)
        );
        
        // Get details for products that can be reviewed (delivered but not yet reviewed)
        const reviewableProductsData = [];
        
        for (const productId of productIds) {
          // Skip if already reviewed
          if (alreadyReviewedProductIds.has(productId)) continue;
          
          const productDoc = await getDoc(doc(db, "products", productId));
          
          if (productDoc.exists()) {
            reviewableProductsData.push({
              id: productDoc.id,
              ...productDoc.data()
            });
          }
        }
        
        setReviewableProducts(reviewableProductsData);
      } catch (error) {
        console.error("Error fetching delivered orders:", error);
      } finally {
        setLoadingReviewable(false);
      }
    };
    
    fetchDeliveredOrders();
  }, [user, reviews]);
  
  /**
   * Handle editing a review
   * 
   * @param {Object} review - The review to edit
   */
  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditReviewText(review.text);
    setEditRating(review.rating);
  };
  
  /**
   * Save the edited review to Firestore
   */
  const saveEditedReview = async () => {
    if (!editingReview) return;
    
    try {
      // Check if review text is valid
      if (editReviewText.trim().length === 0) {
        toast.error("Review text cannot be empty");
        return;
      }
      
      // Check if review text is within character limit
      if (editReviewText.length > 500) {
        toast.error("Review text must be 500 characters or less");
        return;
      }
      
      // Check if rating is valid
      if (editRating < 1 || editRating > 5) {
        toast.error("Rating must be between 1 and 5 stars");
        return;
      }
      
      // Update the review in Firestore
      const reviewRef = doc(db, "reviews", editingReview.id);
      await updateDoc(reviewRef, {
        text: editReviewText,
        rating: editRating,
        updatedAt: Timestamp.now()
      });
      
      // Update the review in the product's subcollection if it exists
      const productReviewRef = doc(db, "products", editingReview.productId, "reviews", editingReview.id);
      const productReviewDoc = await getDoc(productReviewRef);
      
      if (productReviewDoc.exists()) {
        await updateDoc(productReviewRef, {
          text: editReviewText,
          rating: editRating,
          updatedAt: Timestamp.now()
        });
      }
      
      // Update the local state
      setReviews(reviews.map(review => 
        review.id === editingReview.id
          ? { 
              ...review, 
              text: editReviewText, 
              rating: editRating,
              updatedAt: new Date()
            }
          : review
      ));
      
      // Reset editing state
      setEditingReview(null);
      setEditReviewText('');
      setEditRating(0);
      
      toast.success("Review updated successfully!");
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review. Please try again.");
    }
  };
  
  /**
   * Delete a review
   * 
   * @param {string} reviewId - ID of the review to delete
   * @param {string} productId - ID of the product for the review
   */
  const handleDeleteReview = async (reviewId, productId) => {
    try {
      // Delete the review from the main reviews collection
      await deleteDoc(doc(db, "reviews", reviewId));
      
      // Delete the review from the product's reviews subcollection if it exists
      const productReviewRef = doc(db, "products", productId, "reviews", reviewId);
      const productReviewDoc = await getDoc(productReviewRef);
      
      if (productReviewDoc.exists()) {
        await deleteDoc(productReviewRef);
      }
      
      // Update local state
      setReviews(reviews.filter(review => review.id !== reviewId));
      
      toast.success("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review. Please try again.");
    }
  };
  
  /**
   * Select a product to review
   * 
   * @param {Object} product - The product to review
   */
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setNewReview({
      productId: product.id,
      text: '',
      rating: 0
    });
  };
  
  /**
   * Handle submitting a new review
   */
  const handleSubmitNewReview = async (e) => {
    e.preventDefault();
    
    if (!user || !selectedProduct) return;
    
    // Validate review
    if (newReview.rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    
    if (newReview.text.trim().length === 0) {
      toast.error("Please enter your review");
      return;
    }
    
    if (newReview.text.length > 500) {
      toast.error("Review must be 500 characters or less");
      return;
    }
    
    setIsSubmittingNewReview(true);
    
    try {
      // Get user profile to include name and profile pic in review
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Create the review data
      const reviewData = {
        userId: user.uid,
        productId: selectedProduct.id,
        rating: newReview.rating,
        text: newReview.text,
        userName: userData.name || user.displayName || user.email,
        userProfilePic: userData.profilePic || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // Add to main reviews collection
      const reviewRef = await addDoc(collection(db, "reviews"), reviewData);
      
      // Also add to the product's reviews subcollection
      await addDoc(collection(db, "products", selectedProduct.id, "reviews"), {
        ...reviewData,
        reviewId: reviewRef.id // Link to main review document
      });
      
      // Update local state
      const newReviewWithProduct = {
        id: reviewRef.id,
        ...reviewData,
        product: {
          id: selectedProduct.id,
          name: selectedProduct.name,
          image: selectedProduct.image
        },
        createdAt: new Date()
      };
      
      // Add to reviews list and remove from reviewable products
      setReviews([newReviewWithProduct, ...reviews]);
      setReviewableProducts(reviewableProducts.filter(product => product.id !== selectedProduct.id));
      
      // Reset form
      setSelectedProduct(null);
      setNewReview({
        productId: '',
        text: '',
        rating: 0
      });
      
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingNewReview(false);
    }
  };
  
  /**
   * Render star rating
   * 
   * @param {number} rating - Rating value 1-5
   * @param {boolean} interactive - Whether the stars should be interactive
   * @returns {JSX.Element} Star rating component
   */
  const StarRating = ({ rating, interactive = false, onRatingChange = null }) => {
    const [hoveredStar, setHoveredStar] = useState(0);
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button 
            key={star}
            type={interactive ? "button" : ""}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
            className={`${interactive ? "cursor-pointer" : ""} focus:outline-none`}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star 
              fill={(interactive && hoveredStar >= star) || (!interactive && star <= rating) || (interactive && star <= rating && hoveredStar === 0) ? "#F59E0B" : "none"} 
              stroke={(interactive && hoveredStar >= star) || (!interactive && star <= rating) || (interactive && star <= rating && hoveredStar === 0) ? "#F59E0B" : "#D1D5DB"}
              size={20} 
              className={`${interactive && star <= rating ? "text-amber-500" : "text-gray-400"} ${
                interactive && "transition-transform hover:scale-110"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };
  
  /**
   * Format date for display
   * 
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  const formatDate = (date) => {
    if (!date) return '';
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">My Reviews</h2>
      </div>
      
      {/* Reviewable Products Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <ShoppingBag className="text-blue-600 mr-2" />
          <h3 className="text-xl font-medium text-gray-800">Products to Review</h3>
        </div>
        
        {loadingReviewable ? (
          <div className="py-4 flex justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : reviewableProducts.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <Package2 className="mx-auto text-gray-400 mb-3" size={28} />
            <p className="text-gray-700 font-medium">No products to review</p>
            <p className="text-gray-500 text-sm mt-1">
              You've reviewed all products from your delivered orders.
            </p>
          </div>
        ) : (
          <div>
            {selectedProduct ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-4 mb-4">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedProduct.brand && `${selectedProduct.brand} · `}
                      {selectedProduct.type}
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmitNewReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Rating
                    </label>
                    <StarRating 
                      rating={newReview.rating} 
                      interactive={true} 
                      onRatingChange={(value) => setNewReview({...newReview, rating: value})} 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Review
                    </label>
                    <textarea
                      value={newReview.text}
                      onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                      rows={4}
                      maxLength={500}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Share your experience with this product. What did you like or dislike? Would you recommend it to others?"
                    ></textarea>
                    <p className="text-sm text-gray-500 mt-1">
                      {newReview.text.length}/500 characters
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingNewReview || newReview.rating === 0}
                      className={`px-6 py-2 rounded-lg text-white ${
                        isSubmittingNewReview || newReview.rating === 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isSubmittingNewReview ? (
                        <span className="flex items-center">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          Submitting...
                        </span>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviewableProducts.map(product => (
                  <div 
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 line-clamp-1">{product.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.brand && `${product.brand} · `}
                          {product.type}
                        </p>
                        
                        <div className="mt-3 flex justify-between items-center">
                          <Link 
                            to={`/product/${product.id}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Product
                          </Link>
                          <button
                            onClick={() => handleSelectProduct(product)}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                          >
                            Write Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* My Reviews List */}
      <div className="mt-8">
        <h3 className="text-xl font-medium text-gray-800 mb-4">Your Past Reviews</h3>
        
        {reviews.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-4">
              You haven't reviewed any products yet. Reviews will appear here after you submit them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
              >
                {editingReview && editingReview.id === review.id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={review.product.image} 
                        alt={review.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">{review.product.name}</h4>
                        <p className="text-sm text-gray-500">Originally posted on {formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Rating
                        </label>
                        <StarRating 
                          rating={editRating} 
                          interactive={true} 
                          onRatingChange={setEditRating} 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Review
                        </label>
                        <textarea
                          value={editReviewText}
                          onChange={(e) => setEditReviewText(e.target.value)}
                          maxLength={500}
                          rows={4}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="What did you think about this product?"
                        ></textarea>
                        <p className="text-sm text-gray-500 mt-1">
                          {editReviewText.length}/500 characters
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          onClick={() => setEditingReview(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEditedReview}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={review.product.image} 
                          alt={review.product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">{review.product.name}</h4>
                          <div className="flex items-center mt-1">
                            <StarRating rating={review.rating} />
                            <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(review.createdAt)}
                            {review.updatedAt && review.updatedAt.toDate() > review.createdAt && 
                              ` (edited ${formatDate(review.updatedAt)})`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                          aria-label="Edit review"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id, review.productId)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                          aria-label="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-gray-700">
                      <p>{review.text}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserReviews; 