import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';
import {
  Truck, ShieldCheck, ArrowLeft, ShoppingCart, ChevronDown, ChevronUp,
  Star, Globe, Award, Minus, Plus, Loader2, Package, Heart
} from 'lucide-react';
import { m } from 'framer-motion';
import WishlistButton from '../components/WishlistButton';
import { Helmet } from 'react-helmet-async';
import ProductReviews from '../components/ProductReviews';
import ProductReviewForm from '../components/ProductReviewForm';
import ProductCard from '../components/ProductCard';

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

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/signin');
      return;
    }

    if (!product?.stock || product.stock <= 0) {
      toast.warning('This product is currently out of stock');
      return;
    }

    dispatch(addToCart({ productId: product.id, quantity }));
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Loader2 className="w-12 h-12 text-gray-900 animate-spin mb-4" />
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <>
      <Helmet>
        <title>{product.name} | KamiKoto</title>
        <meta name="description" content={product.description || product.name} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <m.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </m.button>

          {/* Product Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Left - Image */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 aspect-square sticky top-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </m.div>

            {/* Right - Product Info */}
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Brand */}
              {product.brand && (
                <span className="inline-block text-sm font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                  {product.brand}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg">
                  <Star className="w-5 h-5 fill-amber-500 stroke-amber-500" />
                  <span className="text-sm font-semibold text-amber-700">4.5</span>
                </div>
                <span className="text-sm text-gray-600">(128 reviews)</span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <>
                      <span className="text-2xl text-gray-400 line-through">
                        {formatPrice(product.mrp)}
                      </span>
                      <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {calculateDiscount(product.mrp, product.price)}% OFF
                      </span>
                    </>
                  )}
                </div>
                {product.mrp && product.mrp > product.price && (
                  <p className="text-sm text-green-600 font-semibold">
                    You save {formatPrice(product.mrp - product.price)}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 border border-gray-200">
                <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-900">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 hover:bg-gray-50 transition-all"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-16 text-center text-xl font-bold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 hover:bg-gray-50 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.stock || product.stock <= 0}
                  className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <div className="flex-shrink-0">
                  <WishlistButton product={product} size="lg" />
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-3 pt-4">
                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Free shipping on orders over ₹500</span>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">100% secure payment</span>
                </div>
              </div>
            </m.div>
          </div>

          {/* Product Details Accordion */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12"
          >
            {/* Description */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection('description')}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900">Product Description</h2>
                {expandedSections.description ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {expandedSections.description && (
                <div className="px-6 pb-6">
                  <p className="text-gray-700 leading-relaxed">{product.description || 'No description available.'}</p>
                </div>
              )}
            </div>

            {/* Shipping */}
            {product.importDetails?.isImported && (
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection('shipping')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-lg font-bold text-gray-900">Shipping & Import Details</h2>
                  {expandedSections.shipping ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {expandedSections.shipping && (
                  <div className="px-6 pb-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Globe className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Imported from {product.importDetails.country}</p>
                        {product.importDetails.deliveryNote && (
                          <p className="text-sm text-gray-600 mt-1">{product.importDetails.deliveryNote}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Warranty */}
            {product.warranty?.available && (
              <div>
                <button
                  onClick={() => toggleSection('warranty')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-lg font-bold text-gray-900">Warranty Information</h2>
                  {expandedSections.warranty ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {expandedSections.warranty && (
                  <div className="px-6 pb-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.warranty.period} Warranty</p>
                        <p className="text-sm text-gray-600 mt-1">{product.warranty.details}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </m.div>

          {/* Reviews Section */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <ProductReviewForm productId={product.id} />
              <div className="mt-8">
                <ProductReviews productId={product.id} />
              </div>
            </div>
          </m.div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {similarProducts.map((similarProduct) => (
                  <ProductCard
                    key={similarProduct.id}
                    product={similarProduct}
                    onAddToCart={(product) => {
                      dispatch(addToCart({ productId: product.id, quantity: 1 }));
                      toast.success('Added to cart!');
                    }}
                  />
                ))}
              </div>
            </m.div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductView;
