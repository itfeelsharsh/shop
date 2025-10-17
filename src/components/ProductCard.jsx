import React, { useState, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { ShoppingCart, Eye, Star } from 'lucide-react';
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
   * Renders the product image with badges and effects
   * @returns {JSX.Element} Product image
   */
  const renderProductImage = () => {
    return (
      <div className="relative overflow-hidden h-36 md:h-44 group/image">
        <img
          src={product?.image}
          alt={product?.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges row */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
          <div className="flex flex-col gap-1">
            {/* Discount badge */}
            {product?.mrp && product.mrp > product.price && (
              <m.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
              >
                {calculateDiscount(product.mrp, product.price)}% OFF
              </m.div>
            )}

            {/* New badge */}
            {product?.isNew && (
              <m.div
                initial={{ scale: 0, rotate: 10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
              >
                NEW
              </m.div>
            )}
          </div>

          {/* Wishlist button */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <WishlistButton product={product} size="sm" />
          </div>
        </div>

        {/* Quick view button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg hover:bg-white transition-all transform hover:scale-105 flex items-center gap-1"
          >
            <Eye size={12} />
            Quick View
          </button>
        </div>
      </div>
    );
  };

  // Enhanced rating display
  const renderRatingStars = () => {
    return (
      <div className="flex items-center gap-1">
        {productRating.total > 0 ? (
          <>
            <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded">
              <Star size={10} fill="#F59E0B" stroke="#F59E0B" className="flex-shrink-0" />
              <span className="text-[10px] font-semibold text-amber-700">
                {productRating.average.toFixed(1)}
              </span>
            </div>
            <span className="text-[9px] text-gray-500">({productRating.total})</span>
          </>
        ) : (
          <span className="text-[9px] text-gray-400 italic">No reviews</span>
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
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer group border border-gray-100 relative"
        onClick={handleViewDetails}
      >
        {/* Product Image */}
        {renderProductImage()}

        {/* Product Content */}
        <div className="p-2.5 flex flex-col gap-1.5 flex-grow">
          {/* Brand */}
          {product?.brand && (
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide bg-gray-50 px-1.5 py-0.5 rounded">
                {product.brand}
              </span>
              {/* Stock indicator */}
              {product?.stock && product.stock > 0 && (
                <div className="flex items-center gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] text-green-600 font-medium">In Stock</span>
                </div>
              )}
              {(!product?.stock || product.stock <= 0) && (
                <div className="flex items-center gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  <span className="text-[8px] text-red-600 font-medium">Out</span>
                </div>
              )}
            </div>
          )}

          {/* Product Name */}
          <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight min-h-[2.5rem]">
            {product?.name}
          </h3>

          {/* Rating */}
          {renderRatingStars()}

          {/* Price section */}
          <div className="flex flex-col gap-0.5 mt-auto">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(product?.price)}
              </span>
              {product?.mrp && product.mrp > product.price && (
                <span className="text-[10px] text-gray-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>

            {/* Savings info */}
            {product?.mrp && product.mrp > product.price && (
              <span className="text-[9px] font-medium text-green-600">
                Save {formatPrice(product.mrp - product.price)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !product?.stock || product.stock <= 0}
            className={`w-full mt-1.5 text-[11px] font-semibold rounded-lg py-2 transition-all duration-200 flex items-center justify-center gap-1 shadow-sm ${
              isAddingToCart || !product?.stock || product.stock <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </>
            ) : (!product?.stock || product.stock <= 0) ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart size={11} />
                Add to Cart
              </>
            )}
          </button>
        </div>

        {/* Decorative corner gradient */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-full pointer-events-none" />
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
