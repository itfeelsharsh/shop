import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, X } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import PropTypes from 'prop-types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import WishlistButton from './WishlistButton';

/**
 * NotificationModal Component
 * 
 * Displays feedback to users for various actions like adding to cart,
 * sign-in requirements, or out-of-stock notifications
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.type - Type of notification (success, error, warning)
 * @param {string} props.message - Notification message to display
 */
const NotificationModal = memo(({ isOpen, onClose, type, message }) => {
  const navigate = useNavigate();
  
  // Animation variants for the modal
  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  /**
   * Dynamically determines modal styling based on notification type
   * @returns {string} CSS classes for the modal
   */
  const getModalStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`relative p-6 rounded-xl shadow-xl border-2 max-w-md w-full ${getModalStyles()}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">{message}</p>
              {type === 'error' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    navigate('/signin');
                  }}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign In
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Add display name for debugging
NotificationModal.displayName = 'NotificationModal';

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
 * - Notification system for user feedback
 * 
 * @param {Object} product - The product data to display
 * @param {Function} onAddToCart - Function to call when adding to cart
 */
const ProductCard = memo(function ProductCard({ 
  product = {}, 
  onAddToCart = () => {
    console.warn('onAddToCart handler is not provided to ProductCard component');
  }
}) {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success',
    message: ''
  });

  // Intersection observer for revealing animation when card scrolls into view
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  /**
   * Handles adding product to cart with authentication and stock validation
   * Shows appropriate notification messages based on action result
   * 
   * @param {Event} e - The click event
   */
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Authentication check
    if (!user) {
      setModalConfig({
        type: 'error',
        message: 'Please sign in to add items to your cart'
      });
      setShowModal(true);
      return;
    }

    // Stock availability check
    if (!product?.stock) {
      setModalConfig({
        type: 'warning',
        message: 'This product is currently out of stock'
      });
      setShowModal(true);
      return;
    }

    // Add to cart with error handling
    try {
      onAddToCart(product);
      setModalConfig({
        type: 'success',
        message: 'Product added to cart successfully!'
      });
      setShowModal(true);
    } catch (error) {
      setModalConfig({
        type: 'error',
        message: error.message || 'Failed to add product to cart'
      });
      setShowModal(true);
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
   * Format price with Indian currency format
   * Handles edge cases for undefined or invalid prices
   * 
   * @param {number|string} price - The price to format
   * @returns {string} The formatted price
   */
  const formatPrice = (price) => {
    // Return '₹0.00' if price is undefined, null, or not a number
    if (!price) return '₹0.00';
    
    // Convert string to number if needed
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Handle NaN after conversion
    if (isNaN(numPrice)) return '₹0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
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

  return (
    <>
      <motion.div
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
        {renderProductImage()}

        {/* Product Information Section */}
        <div className="flex flex-col flex-grow p-6">
          {/* Brand Display - Added for fancy brand name display */}
          {product?.brand && (
            <div className="mb-2">
              <span className="text-xs uppercase tracking-wider bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-bold">
                {product.brand}
              </span>
            </div>
          )}
          
          {/* Product Title, Description & Category */}
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
              {product?.name || 'Product Name'}
            </h3>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {product?.description || 'No description available'}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {product?.type && <span className="inline-block">{product?.type}</span>}
            </div>
          </div>

          {/* Bottom Section - Price, Stock Status and Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Price and Stock Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(product?.price)}
                </span>
                {product?.originalPrice > product?.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product?.originalPrice)}
                  </span>
                )}
              </div>
              <span className={`
                text-xs font-medium px-2.5 py-1 rounded-full
                ${product?.stock > 0 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-red-600 bg-red-50'}
              `}>
                {product?.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Action Buttons - View Product and Add to Cart */}
            <div className="flex gap-3">
              {/* View Product Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewDetails}
                className={`
                  flex-grow
                  h-12
                  rounded-lg
                  font-semibold
                  transition-all
                  duration-200
                  flex
                  items-center
                  justify-center
                  gap-2
                  bg-blue-600 
                  hover:bg-blue-700 
                  text-white
                `}
              >
                <Eye className="w-5 h-5" />
                View Product
              </motion.button>

              {/* Add to Cart Icon Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={!product?.stock}
                aria-label="Add to cart"
                title={product?.stock ? "Add to cart" : "Out of stock"}
                className={`
                  h-12
                  w-12
                  rounded-lg
                  transition-all
                  duration-200
                  flex
                  items-center
                  justify-center
                  ${product?.stock 
                    ? 'bg-gray-100 hover:bg-gray-200 text-blue-600' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification Modal for user feedback */}
      <NotificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalConfig.type}
        message={modalConfig.message}
      />
    </>
  );
});

// PropTypes validation for component props
ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // Accept both number and string
    originalPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // Accept both number and string
    image: PropTypes.string,
    stock: PropTypes.number,
    isNew: PropTypes.bool,
    type: PropTypes.string,
  }),
  onAddToCart: PropTypes.func
};

export default ProductCard;
