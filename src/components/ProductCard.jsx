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
 * Modern ProductCard Component
 *
 * Features:
 * - Clean, minimalistic design
 * - Smooth animations and hover effects
 * - Responsive layout
 * - Rating and wishlist integration
 * - Stock status indicators
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

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

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

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to add items to your cart');
      return;
    }

    if (!product?.stock || product.stock <= 0) {
      toast.warning('This product is currently out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      await onAddToCart(product);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '₹0.00';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || !currentPrice || isNaN(originalPrice) || isNaN(currentPrice)) {
      return 0;
    }
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer group border border-gray-100"
      onClick={handleViewDetails}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <img
          src={product?.image}
          alt={product?.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <div className="flex flex-col gap-2">
            {product?.mrp && product.mrp > product.price && (
              <div className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                {calculateDiscount(product.mrp, product.price)}% OFF
              </div>
            )}
            {product?.isNew && (
              <div className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                NEW
              </div>
            )}
          </div>

          {/* Wishlist button */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <WishlistButton product={product} size="sm" />
          </div>
        </div>

        {/* Quick view button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        {/* Brand and Stock */}
        <div className="flex items-center justify-between">
          {product?.brand && (
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {product.brand}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {product?.stock && product.stock > 0 ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-600 font-medium">In Stock</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem]">
          {product?.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          {productRating.total > 0 ? (
            <>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
                <Star className="w-3 h-3 fill-amber-500 stroke-amber-500" />
                <span className="text-xs font-semibold text-amber-700">
                  {productRating.average.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-gray-500">({productRating.total} reviews)</span>
            </>
          ) : (
            <span className="text-xs text-gray-400">No reviews yet</span>
          )}
        </div>

        {/* Price section */}
        <div className="flex flex-col gap-1 mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product?.price)}
            </span>
            {product?.mrp && product.mrp > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>

          {product?.mrp && product.mrp > product.price && (
            <span className="text-xs font-medium text-green-600">
              You save {formatPrice(product.mrp - product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || !product?.stock || product.stock <= 0}
          className={`w-full mt-2 text-sm font-semibold rounded-lg py-2.5 transition-all duration-200 flex items-center justify-center gap-2 ${
            isAddingToCart || !product?.stock || product.stock <= 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isAddingToCart ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding...
            </>
          ) : (!product?.stock || product.stock <= 0) ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </m.div>
  );
});

ProductCard.displayName = 'ProductCard';

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
