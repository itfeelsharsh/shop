import React, { useState, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, X, Star } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import PropTypes from 'prop-types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import WishlistButton from './WishlistButton';
import reviewUtils from '../utils/reviewUtils';
import { toast } from 'react-toastify';

/**
 * ProductCard Component
 * 
 * Displays a single product with animations, interactive elements, and
 * responsive design. Handles user interactions like viewing details
 * and adding products to cart.
 * 
 * Features:
 * - Animated appearance and hover effects
 * - Discount and new product badges
 * - Price formatting with original price display
 * - Stock status indicator
 * - Add to cart functionality with authentication check
 * - Wishlist functionality for saving products
 * - Toast notification system for user feedback
 * - Rating display showing product reviews
 * 
 * @param {Object} product - The product data to display
 * @param {Function} onAddToCart - Function to call when adding to cart
 */
const ProductCard = memo(function ProductCard({ 
  product = {}, 
  onAddToCart = () => {
    console.warn('onAddToCart handler is not provided to ProductCard component');
  },
  onAddToWishlist = (item) => {
    console.warn('onAddToWishlist handler is not provided to ProductCard component for item:', item);
  }
}) {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [productRating, setProductRating] = useState({ average: 0, total: 0 });

  // Intersection observer for revealing animation when card scrolls into view
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  /**
   * Fetch the product's rating information
   */
  useEffect(() => {
    if (product?.id) {
      const fetchRating = async () => {
        try {
          const ratingStats = await reviewUtils.getProductRatingStats(product.id);
          setProductRating(ratingStats);
        } catch (error) {
          console.error("Error fetching product rating:", error);
        }
      };
      
      fetchRating();
    }
  }, [product]);

  /**
   * Handles adding product to cart with authentication and stock validation
   * Shows appropriate toast notifications based on action result
   * 
   * @param {Event} e - The click event
   */
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Authentication check
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      return;
    }

    // Stock availability check
    if (!product?.stock || product.stock <= 0) {
      toast.warning('This product is currently out of stock');
      return;
    }

    setIsAddingToCart(true);
    // Add to cart with error handling
    try {
      await onAddToCart(product);
      toast.success('Product added to cart successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to add product to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  /**
   * Navigate to product details page
   * Prevents event propagation when used in button
   */
  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  /**
   * Format price as currency with Indian Rupee (₹)
   * 
   * @param {number|string} price - The price to format 
   * @returns {string} Formatted price with currency symbol
   */
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '₹0.00';
    
    const num = typeof price === 'string' ? parseFloat(price) : price;
    
    // Handle NaN, just in case
    if (isNaN(num)) return '₹0.00';
    
    // Extract integer and decimal parts
    const parts = num.toFixed(2).split('.');
    const integer = parts[0];
    const decimalPart = parts[1];
    
    // Add thousands separators to integer part
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return formatted string
    return `₹${decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger}`;
  };

  /**
   * Calculate discount percentage between original and current price
   * 
   * @param {number} originalPrice - The original price
   * @param {number} currentPrice - The current price
   * @returns {number} The discount percentage (rounded to nearest integer)
   */
  // eslint-disable-next-line no-unused-vars
  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || !currentPrice || isNaN(originalPrice) || isNaN(currentPrice)) {
      return 0;
    }
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // Card animation variants for entrance and hover effects
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Badge animation variants for pop-in effect
  // eslint-disable-next-line no-unused-vars
  const badgeVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    }
  };

  /**
   * Renders the product image and action buttons
   * @returns {JSX.Element} Product image with overlay actions
   */
  const renderProductImage = () => {
    return (
      <div className="relative overflow-hidden rounded-t-xl h-48 md:h-56 group">
        <img
          src={product?.image}
          alt={product?.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Action buttons overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={handleViewDetails}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-all transform -translate-y-2 group-hover:translate-y-0"
            >
              <Eye size={18} />
            </button>
            
            <button
              onClick={handleAddToCart}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-all transform -translate-y-2 group-hover:translate-y-0"
            >
              <ShoppingCart size={18} />
            </button>
            
            <WishlistButton product={product} size="sm" className="transform -translate-y-2 group-hover:translate-y-0" />
          </div>
        </div>
        
        {/* Badges: New, Sale, Out of Stock */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product?.isNew && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">New</span>
          )}
          
          {product?.originalPrice && product.originalPrice > product.price && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
              Sale
            </span>
          )}
          
          {!product?.stock && (
            <span className="px-2 py-1 bg-gray-700 text-white text-xs font-medium rounded">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    );
  };

  // Place this where you want the rating to be displayed, typically after the product name
  const renderRatingStars = () => {
    return (
      <div className="flex items-center mt-1 mb-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star}
              size={14}
              className="mr-0.5"
              fill={star <= Math.round(productRating.average) ? "#F59E0B" : "none"} 
              stroke={star <= Math.round(productRating.average) ? "#F59E0B" : "#D1D5DB"}
            />
          ))}
        </div>
        {productRating.total > 0 ? (
          <span className="ml-1 text-xs text-gray-600">
            ({productRating.average.toFixed(1)}) {productRating.total} review{productRating.total !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="ml-1 text-xs text-gray-500">No reviews yet</span>
        )}
      </div>
    );
  };

  return (
    <>
      <m.div
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        whileHover="hover"
        className="
          relative
          bg-white
          rounded-2xl
          overflow-hidden
          transform
          transition-all
          duration-300
          hover:shadow-2xl
          group
          border
          border-gray-100
          flex
          flex-col
          h-full
          cursor-pointer
        "
        onClick={handleViewDetails}
      >
        {/* Discount Badge */}
        {product?.mrp && product.mrp > product.price && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
              {calculateDiscount(product.mrp, product.price)}% OFF
            </div>
          </div>
        )}

        {/* New Product Badge */}
        {product?.isNew && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
              NEW
            </div>
          </div>
        )}
        
        {/* Product Image */}
        {renderProductImage()}
        
        {/* Product Content */}
        <div className="flex-grow p-4 flex flex-col">
          {/* Product Brand */}
          {product?.brand && (
            <div className="mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {product.brand}
              </span>
            </div>
          )}
          
          {/* Product Name */}
          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{product?.name}</h3>
          
          {/* Product Rating */}
          {renderRatingStars()}
          
          {/* Product Description (truncated) */}
          {product?.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
              {product.description}
            </p>
          )}
          
          {/* Price Information */}
          <div className="flex items-baseline mb-3">
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(product?.price)}
            </span>
            {product?.mrp && product.mrp > product.price && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          <div className="mb-3">
            {product?.stock && product.stock > 0 ? (
              <span className="inline-flex items-center text-xs font-medium text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                Out of Stock
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex mt-auto space-x-2">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors font-medium rounded-lg py-2 px-4 flex items-center justify-center"
            >
              <Eye size={16} className="mr-1.5" />
              View
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product?.stock || product.stock <= 0}
              className={`flex-1 ${
                isAddingToCart || !product?.stock || product.stock <= 0 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors font-medium rounded-lg py-2 px-4 flex items-center justify-center`}
            >
              {isAddingToCart ? (
                <span className="flex items-center">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Adding...
                </span>
              ) : (
                <>
                  <ShoppingCart size={16} className="mr-1.5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
          
          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-20">
            <WishlistButton 
              product={product} 
              size="sm"
            />
          </div>
        </div>
      </m.div>
    </>
  );
});

// Add display name for debugging
ProductCard.displayName = 'ProductCard';

// PropTypes validation
ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    stock: PropTypes.number,
    mrp: PropTypes.number,
    brand: PropTypes.string,
    isNew: PropTypes.bool,
  }),
  onAddToCart: PropTypes.func,
  onAddToWishlist: PropTypes.func
};

export default ProductCard;
