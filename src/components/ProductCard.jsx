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
import Button from './Button';

/**
 * Premium ProductCard Component
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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

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
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full cursor-pointer group border border-gray-100/80"
      onClick={handleViewDetails}
    >
      {/* Product Image Section */}
      <div className="relative overflow-hidden aspect-[4/5] bg-gray-50">
        {/* Shiny corner green ribbon if there is a discount */}
        {product?.mrp && product.mrp > product.price && (
          <div className="absolute top-0 left-0 overflow-hidden w-20 h-20 pointer-events-none z-20">
            <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 text-white text-[9px] font-extrabold uppercase py-1.5 shadow-md w-[130px] text-center transform -rotate-45 -translate-x-[36px] translate-y-[16px] tracking-wider border border-white/20 select-none btn-shiny-ribbon">
              {calculateDiscount(product.mrp, product.price)}% OFF
            </div>
          </div>
        )}

        <img
          src={product?.image}
          alt={product?.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />

        {/* Dynamic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="flex flex-col gap-2">
            {product?.isNew && (
              <m.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg"
              >
                NEW ARRIVAL
              </m.div>
            )}
          </div>

          <div className="transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <WishlistButton product={product} size="sm" />
          </div>
        </div>

        {/* Center Quick View */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
          <Button
            variant="secondary"
            size="small"
            icon={<Eye className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="bg-white/95 backdrop-blur-sm border-none shadow-xl hover:bg-white"
          >
            Quick View
          </Button>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-3.5 sm:p-5 flex flex-col gap-2 sm:gap-3 flex-grow">
        {/* Category/Brand & Stock */}
        <div className="flex items-center justify-between">
          <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] truncate max-w-[65%]">
            {product.brand || 'Premium Collection'}
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${product?.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider ${product?.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {product?.stock > 0 ? 'In Stock' : 'Sold Out'}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-xs sm:text-base font-bold text-gray-900 line-clamp-2 leading-tight min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-[#D32F2F] transition-colors">
          {product?.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          {productRating.total > 0 ? (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < Math.round(productRating.average) ? 'fill-amber-400 stroke-amber-400' : 'fill-gray-100 stroke-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400">({productRating.total})</span>
            </div>
          ) : (
            <span className="text-[8px] sm:text-[10px] font-medium text-gray-300">No reviews yet</span>
          )}
        </div>

        {/* Price section */}
        <div className="flex items-end justify-between mt-auto pt-2.5 sm:pt-3 border-t border-gray-50 gap-1.5">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-sm sm:text-lg font-black text-gray-900 leading-tight">
                {formatPrice(product?.price)}
              </span>
              {product?.mrp && product.mrp > product.price && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium leading-tight">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>
            {product?.mrp && product.mrp > product.price && (
              <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase tracking-wide mt-0.5 block truncate">
                SAVE {formatPrice(product.mrp - product.price)}
              </span>
            )}
          </div>

          {/* Mini Add to Cart */}
          <Button
            variant="primary"
            size="small"
            isLoading={isAddingToCart}
            loadingText=""
            disabled={!product?.stock || product.stock <= 0}
            onClick={handleAddToCart}
            className="!rounded-full w-8 h-8 sm:w-9 sm:h-9 !p-0 shadow-md hover:shadow-red-200 flex-shrink-0 flex items-center justify-center bg-[#D32F2F] hover:bg-[#C62828] text-white btn-shiny-ribbon"
            icon={<ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          />
        </div>
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
