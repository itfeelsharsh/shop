import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';
import {
  Truck, ShieldCheck, ChevronDown, ChevronUp,
  Minus, Plus, Loader2, Sparkles, CheckCircle2
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
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    shipping: false,
    warranty: false,
  });

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.currentUser);
  const [isAdding, setIsAdding] = useState(false);

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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

      <div className="min-h-screen bg-white pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs / Back */}
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-12 text-sm font-bold uppercase tracking-widest text-gray-400"
          >
            <button onClick={() => navigate('/products')} className="hover:text-black transition-colors">Collection</button>
            <span>/</span>
            <span className="text-black">{product.name}</span>
          </m.div>

          {/* Product Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-24">
            {/* Left - Image Gallery Style */}
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7"
            >
              <div className="sticky top-32 space-y-4">
                <div className="bg-gray-50 rounded-[40px] overflow-hidden aspect-[4/5] relative group">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                  />
                  {product.mrp && product.mrp > product.price && (
                    <div className="absolute top-8 left-8 bg-black text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-2xl">
                      {calculateDiscount(product.mrp, product.price)}% OFF
                    </div>
                  )}
                </div>
              </div>
            </m.div>

            {/* Right - Product Info */}
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 space-y-10"
            >
              <div className="space-y-4">
                {product.brand && (
                  <span className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                    {product.brand}
                  </span>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter leading-[0.95]">
                  {product.name}
                </h1>
              </div>

              {/* Price Section */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold text-gray-900 tracking-tighter">
                    {formatPrice(product.price)}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-2xl text-gray-300 line-through decoration-gray-400">
                      {formatPrice(product.mrp)}
                    </span>
                  )}
                </div>
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">In Stock & Ready to Ship</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-500">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">Limited Edition - Out of Stock</span>
                  </div>
                )}
              </div>

              <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                {product.description?.split('.')[0]}. Experience the pinnacle of Japanese craftsmanship in your daily workflow.
              </p>

              {/* Actions */}
              {product.stock > 0 && (
                <div className="space-y-8 pt-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all text-gray-400 hover:text-black"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-12 text-center text-lg font-bold text-gray-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all text-gray-400 hover:text-black"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <WishlistButton product={product} size="lg" className="!bg-gray-50 hover:!bg-gray-100 border-none" />
                  </div>

                  <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={handleAddToCart}
                    isLoading={isAdding}
                    loadingText="Adding to Cart..."
                    disabled={!product.stock || product.stock <= 0}
                    className="h-20 text-xl font-bold tracking-tight shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all rounded-[24px]"
                  >
                    Add to Cart
                  </Button>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col items-center text-center">
                  <Truck className="w-8 h-8 text-black mb-4" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Priority Shipping</span>
                </div>
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col items-center text-center">
                  <ShieldCheck className="w-8 h-8 text-black mb-4" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Secure Checkout</span>
                </div>
              </div>
            </m.div>
          </div>

          {/* Details Accordion */}
          <div className="max-w-4xl mx-auto mb-24">
            <div className="divide-y divide-gray-100">
              {[
                { id: 'description', title: 'The Craftsmanship', content: product.description },
                { id: 'shipping', title: 'Shipping & Delivery', content: 'We offer worldwide priority shipping. Orders are processed within 24 hours and delivered via premium couriers with full tracking.' },
                { id: 'warranty', title: 'Lifetime Warranty', content: 'Every KamiKoto product is backed by our lifetime warranty against manufacturing defects. Quality is our permanent promise.' }
              ].map((section) => (
                <div key={section.id} className="py-8">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between group"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight group-hover:translate-x-2 transition-transform">
                      {section.title}
                    </h2>
                    {expandedSections[section.id] ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections[section.id] && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-6 text-lg text-gray-500 leading-relaxed">
                          {section.content || 'Details coming soon.'}
                        </p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <section className="max-w-4xl mx-auto mb-24">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tighter">Community</h2>
              <ProductReviewForm productId={product.id} />
            </div>
            <ProductReviews productId={product.id} />
          </section>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <section className="pt-24 border-t border-gray-100">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tighter mb-12">Complete the Look</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
