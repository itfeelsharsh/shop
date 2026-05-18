import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';
import {
  Truck, ShieldCheck,
  Minus, Plus, Loader2, CheckCircle2
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import WishlistButton from '../components/WishlistButton';
import { Helmet } from 'react-helmet-async';
import ProductReviews from '../components/ProductReviews';
import ProductReviewForm from '../components/ProductReviewForm';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';

/**
 * Peak 2020 Premium Product View
 * 
 * Features a minimalist, cinematic layout with sophisticated typography,
 * high-fidelity interactive elements, and a clean informational hierarchy.
 * All fake reviews and hardcoded ratings have been removed.
 */
function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.currentUser);
  const [isAdding, setIsAdding] = useState(false);

  // High-fidelity image gallery states
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const productImages = useMemo(() => {
    const list = [];
    if (product) {
      if (product.image) list.push(product.image);
      if (product.image2) list.push(product.image2);
      if (product.image3) list.push(product.image3);
    }
    return list;
  }, [product]);

  // Reset active image on navigating between products
  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);

          // Fetch similar products
          const productsRef = collection(db, "products");
          const typeQuery = query(productsRef, where("type", "==", productData.type), limit(5));
          const querySnapshot = await getDocs(typeQuery);
          const similar = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(prod => prod.id !== productData.id);
          setSimilarProducts(similar);
        } else {
          toast.error("Product not found!");
          navigate('/products');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("An error occurred while fetching the product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (mrp, price) => {
    if (!mrp || !price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/signin');
      return;
    }

    if (!product?.stock || product.stock <= 0) {
      toast.warning('This product is currently out of stock');
      return;
    }

    setIsAdding(true);
    // Simulate a slight delay for smooth animation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    dispatch(addToCart({ productId: product.id, quantity }));
    toast.success(`Added ${quantity} item(s) to cart!`);
    setIsAdding(false);
  };



  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
        <p className="text-gray-500 font-medium tracking-tight">Refining details...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <>
      <Helmet>
        <title>{product ? `${product.name} | KamiKoto` : 'Loading Product... | KamiKoto'}</title>
        <meta name="description" content={product ? product.description : 'Explore premium stationery at KamiKoto.'} />
      </Helmet>

      <div className="bg-white pb-12">
        <div className="container mx-auto px-4">
          {/* Product Main Section */}

          {/* Product Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-24">
            {/* Left - Image Gallery Style */}
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5"
            >
              <div className="sticky top-32 space-y-6">
                <div className="bg-gray-50 rounded-[40px] overflow-hidden aspect-[4/5] relative group shadow-sm border border-gray-100/80">
                  <AnimatePresence mode="wait">
                    <m.img
                      key={activeImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={productImages[activeImageIndex] || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  {product.mrp && product.mrp > product.price && (
                    <div className="absolute top-8 left-8 bg-black text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-2xl z-10">
                      {calculateDiscount(product.mrp, product.price)}% OFF
                    </div>
                  )}
                </div>

                {/* Multiple Images Selector thumbnails */}
                {productImages.length > 1 && (
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                    {productImages.map((imgUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-20 h-20 rounded-2xl overflow-hidden border-2 bg-gray-50 shadow-sm transition-all duration-300 ${activeImageIndex === index ? 'border-gray-900 scale-105 ring-2 ring-gray-900/10' : 'border-transparent hover:border-gray-300'}`}
                      >
                        <img src={imgUrl} alt={`${product.name} View ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </m.div>

            {/* Right - Product Info */}
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7 space-y-8 bg-white md:bg-gray-50/30 md:border md:border-gray-100 md:rounded-[40px] md:p-8"
            >
              {/* Brand, Name, and Tags */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {product.brand && (
                    <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      {product.brand}
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4.5xl font-black text-gray-900 tracking-tight leading-[1.05]">
                  {product.name}
                </h1>

                {/* Database tags from shopAdmin */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Section - Shopify-like Redesign */}
              <div className="space-y-4 py-4 border-y border-gray-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-4xl font-extrabold text-[#b91c1c] tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-gray-400 line-through font-medium">
                        {formatPrice(product.mrp)}
                      </span>
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase rounded tracking-wider">
                        Sale
                      </span>
                    </div>
                  )}
                </div>
                
                {product.mrp && product.mrp > product.price && (
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    You save {formatPrice(product.mrp - product.price)} ({calculateDiscount(product.mrp, product.price)}% off)
                  </p>
                )}

                <p className="text-xs text-gray-400 font-medium">
                  Tax included. Shipping calculated at checkout.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    {product.stock > 0 ? `In Stock (Only ${product.stock} available)` : 'Sold Out'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Description</h3>
                <p className="text-base text-gray-600 leading-relaxed font-medium">
                  {isDescExpanded 
                    ? product.description 
                    : `${product.description?.slice(0, 180)}${product.description?.length > 180 ? '...' : ''}`}
                  {product.description?.length > 180 && (
                    <button
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="ml-1.5 text-cyan-600 hover:text-cyan-700 font-extrabold text-xs uppercase tracking-wider focus:outline-none"
                    >
                      {isDescExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </p>
              </div>

              {/* Actions */}
              {product.stock > 0 && (
                <div className="space-y-6 pt-2">
                  <div className="flex items-center justify-between bg-gray-50/50 border border-gray-100 rounded-3xl p-3.5">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Quantity</span>
                    <div className="flex items-center bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black focus:outline-none"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-base font-black text-gray-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black focus:outline-none"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="primary"
                      size="large"
                      onClick={handleAddToCart}
                      isLoading={isAdding}
                      loadingText="Adding to Cart..."
                      disabled={!product.stock || product.stock <= 0}
                      className="h-16 text-lg font-black tracking-tight shadow-lg shadow-cyan-900/10 hover:shadow-xl hover:shadow-cyan-900/20 transition-all rounded-[20px] bg-cyan-600 hover:bg-cyan-700 text-white border-none flex-grow btn-shiny-ribbon"
                    >
                      Add to Cart
                    </Button>
                    <WishlistButton product={product} size="lg" className="!bg-gray-50 hover:!bg-gray-100 border-none !rounded-[20px] shadow-sm w-16 h-16 flex items-center justify-center flex-shrink-0" />
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/60">
                  <Truck className="w-6 h-6 text-gray-900 flex-shrink-0" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-900 leading-tight">Priority Shipping</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/60">
                  <ShieldCheck className="w-6 h-6 text-gray-900 flex-shrink-0" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-900 leading-tight">Secure Checkout</span>
                </div>
              </div>
            </m.div>
          </div>          {/* Specifications & Features Section (Replacing the generic Accordion) */}
          <div className="max-w-4xl mx-auto mb-24 space-y-12">
            {/* Features (if any exist) */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Core Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications (if any exist) */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Specifications</h3>
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden shadow-sm">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-3 px-6 py-4 text-sm">
                      <span className="font-bold text-gray-900 col-span-1">{spec.key}</span>
                      <span className="text-gray-500 col-span-2 font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Origin & Import Details (if applicable) */}
            {(product.origin || (product.importDetails && product.importDetails.isImported) || (product.warranty && product.warranty.available)) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                {product.origin && (
                  <div className="border border-gray-100 rounded-2xl p-5 text-center bg-gray-50/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Origin</span>
                    <span className="text-sm font-extrabold text-gray-900">{product.origin}</span>
                  </div>
                )}
                {product.importDetails && product.importDetails.isImported && (
                  <div className="border border-gray-100 rounded-2xl p-5 text-center bg-gray-50/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Import Country</span>
                    <span className="text-sm font-extrabold text-gray-900">{product.importDetails.country || 'International'}</span>
                  </div>
                )}
                {product.warranty && product.warranty.available && (
                  <div className="border border-gray-100 rounded-2xl p-5 text-center bg-gray-50/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Warranty Period</span>
                    <span className="text-sm font-extrabold text-gray-900">{product.warranty.period || 'Covered'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Additional Info & Warranty/Guarantee Details (if any exist) */}
            {(product.additionalInfo || (product.warranty && product.warranty.details) || (product.guarantee && product.guarantee.details)) && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Additional Information</h3>
                <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 text-sm text-gray-600 leading-relaxed font-medium space-y-3">
                  {product.additionalInfo && <p>{product.additionalInfo}</p>}
                  {product.warranty && product.warranty.details && <p><strong className="text-gray-900">Warranty Details:</strong> {product.warranty.details}</p>}
                  {product.guarantee && product.guarantee.details && <p><strong className="text-gray-900">Guarantee Details:</strong> {product.guarantee.details}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <section className="max-w-4xl mx-auto mb-24">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tighter">Community Reviews</h2>
              <ProductReviewForm productId={product.id} />
            </div>
            <ProductReviews productId={product.id} />
          </section>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <section className="pt-24 border-t border-gray-100">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-12">You might also like...</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {similarProducts.map((similarProduct) => (
                  <ProductCard key={similarProduct.id} product={similarProduct} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductView;
