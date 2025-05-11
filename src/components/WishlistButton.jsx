import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { db, auth } from '../firebase/config';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import useWishlist from '../utils/useWishlist';

/**
 * WishlistButton Component
 * 
 * Button component for adding/removing products from user's wishlist
 * Features:
 * - Visual toggle between added/not added state
 * - Firebase integration for persistent storage
 * - Authentication checking with redirect to sign in
 * - Toast notifications for user feedback
 * 
 * @param {Object} props
 * @param {Object} props.product - Product object to add to wishlist
 * @param {string} props.size - Size of the button ('sm', 'md', 'lg')
 * @param {string} props.className - Additional CSS classes for the button
 * @returns {JSX.Element} WishlistButton component
 */
const WishlistButton = ({ product, size = 'md', className = '' }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const { addToWishlist, removeFromWishlist, isInWishlist: checkIfInWishlist } = useWishlist();

  // Size maps for the component
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeMap = {
    sm: 18,
    md: 22,
    lg: 26,
  };

  /**
   * Check if product is in wishlist when component mounts
   * or when user/product changes
   */
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || !product) return;
      
      try {
        const result = await checkIfInWishlist(product.id);
        setIsInWishlist(result);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [user, product, checkIfInWishlist]);

  /**
   * Handles adding/removing product from wishlist
   * with appropriate authentication checks
   */
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to add items to your wishlist');
      navigate('/signin');
      return;
    }

    if (!product) {
      toast.error('Unable to add product to wishlist');
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await removeFromWishlist(product.id);
        setIsInWishlist(false);
      } else {
        // Add to wishlist
        await addToWishlist(product);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={`rounded-full flex items-center justify-center transition-all duration-300 ease-in-out ${
        isInWishlist 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      } ${sizeMap[size]} ${className}`}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={iconSizeMap[size]}
        className={`${isInWishlist ? 'fill-red-500' : ''} ${isLoading ? 'opacity-50' : ''}`}
      />
    </button>
  );
};

WishlistButton.propTypes = {
  product: PropTypes.object.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default WishlistButton; 