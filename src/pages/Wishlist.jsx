import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWishlistItems, 
// eslint-disable-next-line no-unused-vars
setLoading, 
// eslint-disable-next-line no-unused-vars
setError } from '../redux/wishlistSlice';
import { db } from '../firebase/config';
// eslint-disable-next-line no-unused-vars
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Heart, AlertCircle, ArrowLeft } from 'lucide-react';
import { addToCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';
import { m, AnimatePresence } from 'framer-motion';
import useWishlist from '../utils/useWishlist';
import logger from '../utils/logger';

/**
 * Wishlist Page Component
 * 
 * Displays all items in the user's wishlist with options to:
 * - View product details
 * - Add products to cart
 * - Remove products from wishlist
 * - Clear entire wishlist
 * 
 * Features:
 * - Authentication protection
 * - Real-time synchronization with Firebase
 * - Responsive design for all screen sizes
 * - Animated transitions for better user experience
 * - Empty state handling with redirect to products
 * - Optimized Firebase operations to minimize API calls
 * 
 * @returns {JSX.Element} Wishlist component
 */
function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const { items, loading, error } = useSelector((state) => state.wishlist);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const { removeFromWishlist } = useWishlist();

  useEffect(() => {
    // Redirect to sign-in if user is not authenticated
    if (!user) {
      navigate('/signin');
      return;
    }

    logger.user.action("View wishlist page");
  }, [user, navigate]);

  /**
   * Handles adding a product to the cart
   * @param {Object} product - The product to add to cart
   */
  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/signin');
      return;
    }

    dispatch(addToCart({ productId: product.id, quantity: 1 }));
    logger.user.action("Add to cart from wishlist", { productId: product.id });
    toast.success('Product added to cart');
  };

  /**
   * Handles removing a product from the wishlist
   * @param {string} productId - ID of the product to remove
   */
  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlist(productId);
  };

  /**
   * Handles clearing the entire wishlist after confirmation
   * Uses a batch operation to minimize API calls
   */
  const handleClearWishlist = async () => {
    if (!user || items.length === 0) return;
    
    setClearLoading(true);
    
    try {
      logger.user.action("Clear wishlist", { count: items.length });
      
      // Batch operation for deleting all wishlist items
      const batch = writeBatch(db);
      
      // Add all deletions to the batch
      items.forEach(item => {
        const docRef = doc(db, `users/${user.uid}/wishlist/${item.id}`);
        batch.delete(docRef);
      });
      
      // Execute the batch operation (single API call)
      await batch.commit();
      
      // Update Redux state
      dispatch(setWishlistItems([]));
      setConfirmClear(false);
      
      logger.info("Wishlist cleared successfully", { count: items.length }, "Wishlist");
      toast.success('Wishlist cleared successfully');
    } catch (error) {
      logger.error("Failed to clear wishlist", error, "Wishlist");
      toast.error('Failed to clear wishlist');
    } finally {
      setClearLoading(false);
    }
  };

  /**
   * Formats price with proper currency formatting
   * @param {number} price - The price to format
   * @returns {string} Formatted price
   */
  const formatPrice = (price) => {
    if (!price) return "₹0";
    
    const priceStr = price.toString();
    const [integerPart, decimalPart] = priceStr.split('.');

    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);
    const formattedInteger = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherDigits ? "," : "") + lastThreeDigits;

    return `₹${decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger}`;
  };

  // If user is not logged in
  if (!user) {
    return null; // Redirect happens in useEffect
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty wishlist state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Heart size={64} className="text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Explore our products and add items to your wishlist to keep track of things you love.
        </p>
        <Link 
          to="/products" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
          <Heart size={24} className="mr-2 text-red-500" />
          My Wishlist
        </h1>
        
        {items.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            disabled={clearLoading}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center text-sm"
          >
            {clearLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                Clearing...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-1" />
                Clear All
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Wishlist items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {items.map(item => (
            <m.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <Link to={`/product/${item.id}`} className="block">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>
              
              <div className="p-4">
                <Link to={`/product/${item.id}`} className="block">
                  <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">{item.name}</h3>
                </Link>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <ShoppingCart size={16} className="mr-1" />
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Confirm clear wishlist modal */}
      <AnimatePresence>
        {confirmClear && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setConfirmClear(false)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3">Clear Wishlist?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove all {items.length} items from your wishlist? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                  disabled={clearLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearWishlist}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  disabled={clearLoading}
                >
                  {clearLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Clearing...
                    </>
                  ) : (
                    'Clear All'
                  )}
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Wishlist; 