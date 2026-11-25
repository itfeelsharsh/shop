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
import BrandLoader from './BrandLoader';
import noImageFallback from '../assets/noimgsimg.png';
import { hasOptions, normalizeOptions } from '../utils/productOptions';

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
  const hasPaidOptions = normalizeOptions(product?.options).some((group) =>
    group.values.some((value) => value.priceDelta > 0)
  );

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

    // Products with real choices (size, colour, ...) need a selection first.
    if (hasOptions(product)) {
      toast.info('Choose your options to continue');
      navigate(`/product/${product.id}`);
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
    <m.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-950/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 product-card-wrap"
      onClick={handleViewDetails}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && event.key === 'Enter') handleViewDetails();
      }}
      role="link"
      tabIndex={0}
      aria-label={`View ${product?.name || 'product'} details`}
    >
      {/* Product Image Section */}
      <div className="relative aspect-square overflow-hidden bg-[#f7f6f3]">
        {product?.mrp && product.mrp > product.price && (
          <div className="absolute left-3 top-3 z-20 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-red-800 shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
            {calculateDiscount(product.mrp, product.price)}% off
          </div>
        )}

        <img
          src={product?.image}
          alt={product?.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = noImageFallback;
          }}
        />

        {product?.isNew && (
          <div className="absolute bottom-3 left-3 z-10 rounded-full bg-[#D32F2F]/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            New
          </div>
        )}

        <div className="absolute right-3 top-3 z-20">
          <WishlistButton
            product={product}
            size="sm"
            className="!bg-white/95 !text-gray-700 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition-colors hover:!bg-white hover:!text-red-700"
          />
        </div>

        <div className="absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          <Button
            variant="secondary"
            size="small"
            icon={<Eye className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="!w-full !justify-center !rounded-lg !border-0 !bg-white/95 !font-semibold !text-gray-900 shadow-lg backdrop-blur-sm hover:!bg-white"
          >
            Quick View
          </Button>
        </div>
      </div>

      {/* Product Content */}
      <div className="flex flex-grow flex-col gap-2.5 p-4 sm:p-5">
        {/* Category/Brand & Stock */}
        <div className="flex items-center justify-between">
          <span className="max-w-[65%] truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            {product.brand || 'Premium Collection'}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${product?.stock > 0 ? 'bg-emerald-600' : 'bg-gray-400'}`} />
            <span className={`text-[10px] font-medium ${product?.stock > 0 ? 'text-emerald-700' : 'text-gray-500'}`}>
              {product?.stock > 0 ? 'In Stock' : 'Sold Out'}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-[1.35] tracking-tight text-gray-950 transition-colors group-hover:text-red-800 sm:text-base">
          {product?.name}
        </h3>

        {/* Rating */}
        <div className="flex min-h-4 items-center gap-1.5">
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
              <span className="text-xs font-medium text-gray-500">({productRating.total})</span>
            </div>
          ) : (
            <span className="text-[11px] font-medium text-gray-400">No reviews yet</span>
          )}
        </div>

        {/* Price section */}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-gray-100 pt-3">
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-lg font-bold leading-tight tracking-tight text-gray-950">
                {hasPaidOptions && <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">From</span>}
                {formatPrice(product?.price)}
              </span>
              {product?.mrp && product.mrp > product.price && (
                <span className="text-xs font-medium leading-tight text-gray-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>
            {product?.mrp && product.mrp > product.price && (
              <span className="mt-1 block truncate text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                Save {formatPrice(product.mrp - product.price)}
              </span>
            )}
          </div>

          <Button
            variant="secondary"
            size="small"
            isLoading={isAddingToCart}
            loadingText=""
            loadingIcon={<BrandLoader size={22} />}
            disabled={!product?.stock || product.stock <= 0}
            onClick={handleAddToCart}
            className="!h-10 !w-10 !shrink-0 !rounded-lg !bg-[#D32F2F] !p-0 !text-white !shadow-none hover:!bg-[#B71C1C] disabled:!bg-gray-200"
            icon={<ShoppingCart className="h-4 w-4" />}
            aria-label={`Add ${product?.name || 'product'} to cart`}
          />
        </div>
      </div>
    </m.article>
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
