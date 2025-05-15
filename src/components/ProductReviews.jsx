import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Star, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * ProductReviews component displays all reviews for a specific product
 * 
 * @param {Object} props - Component props
 * @param {string} props.productId - ID of the product to display reviews for
 * @returns {JSX.Element} The ProductReviews component
 */
function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'
  
  /**
   * Calculate the average rating from all reviews
   * 
   * @returns {Object} Average rating and count of ratings by star level
   */
  const calculateAverageRating = () => {
    if (reviews.length === 0) return { average: 0, count: {} };
    
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
  };
  
  /**
   * Fetch reviews for this product
   */
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        
        // Query the main reviews collection for this product
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("productId", "==", productId),
          orderBy("createdAt", "desc")
        );
        
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to Date objects
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
          updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : null
        }));
        
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching product reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId]);
  
  /**
   * Sort reviews based on selected sort method
   * 
   * @returns {Array} Sorted reviews
   */
  const getSortedReviews = () => {
    switch (sortBy) {
      case 'oldest':
        return [...reviews].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return [...reviews].sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return [...reviews].sort((a, b) => a.rating - b.rating);
      case 'newest':
      default:
        return [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
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
  
  /**
   * Render star rating
   * 
   * @param {number} rating - Rating value 1-5
   * @returns {JSX.Element} Star rating component
   */
  const StarRating = ({ rating }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            fill={star <= rating ? "#F59E0B" : "none"} 
            stroke={star <= rating ? "#F59E0B" : "#D1D5DB"}
            size={16} 
            className="mr-0.5"
          />
        ))}
      </div>
    );
  };
  
  /**
   * Render the rating summary
   * 
   * @returns {JSX.Element} Rating summary component
   */
  const RatingSummary = () => {
    const { average, count, total } = calculateAverageRating();
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Customer Reviews</h3>
            {total > 0 ? (
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      fill={star <= Math.round(average) ? "#F59E0B" : "none"} 
                      stroke={star <= Math.round(average) ? "#F59E0B" : "#D1D5DB"}
                      size={18} 
                      className="mr-1"
                    />
                  ))}
                </div>
                <span className="ml-2 text-lg font-medium text-gray-700">
                  {average.toFixed(1)}
                </span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-gray-600">{total} review{total !== 1 ? 's' : ''}</span>
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet</p>
            )}
          </div>
          
          {total > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          )}
        </div>
        
        {total > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <span className="w-10 text-sm text-gray-600">{rating} star</span>
                    <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${total ? (count[rating] / total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-sm text-gray-600">
                      {count[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="my-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  const sortedReviews = getSortedReviews();
  const displayReviews = expanded ? sortedReviews : sortedReviews.slice(0, 3);
  
  return (
    <div className="my-6 space-y-4">
      <RatingSummary />
      
      {reviews.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <AlertCircle size={32} className="mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No reviews yet</h3>
          <p className="text-gray-500">This product has no reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mt-6">
            {displayReviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {review.userProfilePic ? (
                      <img 
                        src={review.userProfilePic} 
                        alt={review.userName || 'User'} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {(review.userName || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{review.userName || 'Anonymous'}</p>
                    <div className="flex items-center mt-1">
                      <StarRating rating={review.rating} />
                      <span className="ml-2 text-sm text-gray-600">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{review.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {reviews.length > 3 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={16} className="mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="mr-1" />
                    Show All {reviews.length} Reviews
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProductReviews; 