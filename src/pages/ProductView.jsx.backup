import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';
import { Truck, ShieldCheck, ArrowLeft, Package2, ShoppingCart, ChevronDown, ChevronUp, Tag, Star, Globe, AlertTriangle, Info, Award, MessageSquare } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import WishlistButton from '../components/WishlistButton';
import { Helmet } from 'react-helmet-async';
import ProductReviews from '../components/ProductReviews';
import ProductReviewForm from '../components/ProductReviewForm';

/**
 * Product details page component
 * Shows complete information about a single product
 * Optimized for both desktop and mobile viewing
 * Enhanced with social media meta tags for better sharing
 * 
 * @returns {JSX.Element} ProductView component
 */
function ProductView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showWarrantyInfo, setShowWarrantyInfo] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.currentUser);

  useEffect(() => {
    /**
     * Signals to prerendering services that the page content is ready
     * This is important for social media crawlers
     */
    const signalPrerender = () => {
      if (window.prerenderReady !== undefined) {
        window.prerenderReady = true;
      }
    };

    const fetchProduct = async () => {
      try {
        // With the new system, the URL parameter is directly the document ID
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          setActiveImage(productData.image);
          
          // After fetching the product, fetch similar products
          await fetchSimilarProducts(productData);
          
          // Signal that the page is ready for prerendering
          signalPrerender();
        } else {
          toast.error("Product not found!");
          // Even in error state, signal prerender to avoid timeout
          signalPrerender();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("An error occurred while fetching the product.");
        // Signal prerender even on error
        signalPrerender();
      } finally {
        setLoading(false);
      }
    };
    
    /**
     * Fetches products that are similar to the current product based on category or brand
     * @param {Object} currentProduct - The product to find similar products for
     */
    const fetchSimilarProducts = async (currentProduct) => {
      try {
        setLoadingSimilar(true);
        
        // Query products with the same category/type
        const productsRef = collection(db, "products");
        const typeQuery = query(
          productsRef, 
          where("type", "==", currentProduct.type),
          limit(5)
        );
        
        const querySnapshot = await getDocs(typeQuery);
        const similarProductsData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          // Filter out the current product using the correct ID
          .filter(prod => prod.id !== currentProduct.id);
          
        setSimilarProducts(similarProductsData);
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoadingSimilar(false);
      }
    };
    
    fetchProduct();
    
    // Return cleanup function
    return () => {
      // Reset prerender status when component unmounts
      if (window.prerenderReady !== undefined) {
        window.prerenderReady = false;
      }
    };
  }, [id]);

  /**
   * Adds the current product to the cart
   * Shows error message if user is not logged in
   */
  const handleAddToCart = () => {
    if (!user) {
      toast.error("You must be logged in to add items to your cart.");
      return;
    }
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
    toast.success("Product added to cart!");
  };

  /**
   * Handles adding a similar product to cart
   * @param {Object} product - The product to add to cart
   */
  const handleAddSimilarToCart = (product) => {
    if (!user) {
      toast.error("You must be logged in to add items to your cart.");
      return;
    }
    dispatch(addToCart({
      productId: product.id,
      quantity: 1
    }));
  };

  /**
   * Formats price with Indian currency format
   * @param {number} price - Price to format
   * @returns {string} Formatted price string
   */
  const formatPrice = (price) => {
    const priceStr = price.toString();
    const [integerPart, decimalPart] = priceStr.split('.');

    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);
    const formattedInteger = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherDigits ? "," : "") + lastThreeDigits;

    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  /**
   * Updates the active product image
   * @param {string} image - URL of the image to display
   */
  const handleImageClick = (image) => {
    setActiveImage(image);
  };

  /**
   * Toggles product description visibility on mobile
   */
  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  /**
   * Toggles additional information visibility
   */
  const toggleAdditionalInfo = () => {
    setShowAdditionalInfo(!showAdditionalInfo);
  };

  /**
   * Toggles warranty and guarantee information visibility
   */
  const toggleWarrantyInfo = () => {
    setShowWarrantyInfo(!showWarrantyInfo);
  };

  /**
   * Calculates discount percentage if MRP is higher than selling price
   * @returns {number|null} Discount percentage or null if no discount
   */
  const calculateDiscountPercentage = () => {
    if (!product) return null;
    if (product.mrp && product.price && product.mrp > product.price) {
      return Math.round((product.mrp - product.price) / product.mrp * 100);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/products" className="text-blue-600 hover:underline">Return to Products</Link>
      </div>
    );
  }

  // Prepare meta description from product description (truncated)
  const metaDescription = product.description ? 
    product.description.substring(0, 155) + (product.description.length > 155 ? '...' : '') : 
    `Buy ${product.name} online`;

  // Calculate discount percentage for display
  const discountPercentage = calculateDiscountPercentage();

  return (
    <>
      {/* SEO and Social Media Meta Tags - Optimized for WhatsApp, Discord, and all social platforms */}
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{product.name} | KamiKoto - Premium Stationery</title>
        <meta name="description" content={metaDescription} />

        {/* OpenGraph Tags for Facebook/Instagram/WhatsApp/Discord */}
        <meta property="og:title" content={`${product.name} - ₹${formatPrice(product.price)}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={product.image} />
        <meta property="og:image:secure_url" content={product.image} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={product.name} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="KamiKoto - Premium Stationery" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:price:amount" content={product.price} />
        <meta property="og:price:currency" content="INR" />
        {product.stock > 0 && <meta property="product:availability" content="in stock" />}
        {product.brand && <meta property="product:brand" content={product.brand} />}

        {/* Twitter Card Tags - Enhanced */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@KamiKoto" />
        <meta name="twitter:title" content={`${product.name} - ₹${formatPrice(product.price)}`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={product.image} />
        <meta name="twitter:image:alt" content={product.name} />
        <meta name="twitter:label1" content="Price" />
        <meta name="twitter:data1" content={`₹${formatPrice(product.price)}`} />
        <meta name="twitter:label2" content="Availability" />
        <meta name="twitter:data2" content={product.stock > 0 ? "In Stock" : "Out of Stock"} />

        {/* WhatsApp Specific Meta Tags */}
        <meta property="og:rich_attachment" content="true" />

        {/* Discord Embed Enhancement */}
        <meta name="theme-color" content="#3B82F6" />

        {/* Product Schema.org Markup for Rich Snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": [product.image, product.image2, product.image3].filter(Boolean),
            "description": product.description,
            "sku": product.id,
            "brand": {
              "@type": "Brand",
              "name": product.brand || "KamiKoto"
            },
            "offers": {
              "@type": "Offer",
              "url": window.location.href,
              "priceCurrency": "INR",
              "price": product.price,
              "priceValidUntil": new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition"
            }
          })}
        </script>

        {/* Additional Meta Tags */}
        <meta name="keywords" content={`${product.name}, ${product.brand || ''}, ${product.type || ''}, ${product.tags?.join(', ') || ''}, stationery, online shopping, buy stationery online`} />
        <link rel="canonical" href={window.location.href} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Link to="/products" className="inline-flex items-center text-blue-600 hover:underline mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Products
          </Link>
          <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-12">
            <div className="flex flex-col lg:flex-row">
              {/* Product Images Section */}
              <div className="lg:w-1/2 p-4">
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex mt-4 space-x-4 overflow-x-auto pb-2">
                  {product.image && (
                    <img
                      src={product.image}
                      alt="Thumbnail 1"
                      onClick={() => handleImageClick(product.image)}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${activeImage === product.image ? 'border-blue-500' : 'border-gray-300'}`}
                    />
                  )}
                  {product.image2 && (
                    <img
                      src={product.image2}
                      alt="Thumbnail 2"
                      onClick={() => handleImageClick(product.image2)}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${activeImage === product.image2 ? 'border-blue-500' : 'border-gray-300'}`}
                    />
                  )}
                  {product.image3 && (
                    <img
                      src={product.image3}
                      alt="Thumbnail 3"
                      onClick={() => handleImageClick(product.image3)}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${activeImage === product.image3 ? 'border-blue-500' : 'border-gray-300'}`}
                    />
                  )}
                </div>
              </div>

              {/* Product Details Section - Restructured for mobile */}
              <div className="lg:w-1/2 p-6 flex flex-col justify-between">
                <div className="flex flex-col">
                  {/* Product Name */}
                  <h1 className="text-3xl font-bold mb-2 text-gray-900">{product.name}</h1>
                  
                  {/* Product Type/Category Badge */}
                  {product.type && (
                    <div className="mb-3 flex items-center">
                      <Tag size={16} className="mr-2 text-blue-600" />
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {product.type}
                      </span>
                    </div>
                  )}
                  
                  {/* Brand Information if available */}
                  {product.brand && (
                    <div className="mb-3">
                      <div className="flex items-center">
                        <div className="mr-2 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
                          <span className="text-sm font-bold text-gray-700">
                            {product.brand.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs block">Brand</span>
                          <span className="font-semibold text-base bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {product.brand}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Product Tags Display */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Price Section with MRP and Discount */}
                  <div className="mb-5 flex items-center">
                    <span className="text-3xl font-bold text-blue-600">₹{formatPrice(product.price)}</span>
                    {product.mrp > product.price && (
                      <>
                        <span className="ml-4 text-xl text-gray-500 line-through">
                          ₹{formatPrice(product.mrp)}
                        </span>
                        {discountPercentage && (
                          <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            {discountPercentage}% OFF
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Stock Information */}
                  <div className="mb-4">
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        In Stock ({product.stock} available)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Out of Stock
                      </span>
                    )}
                  </div>
                  
                  {/* Add to Cart Button - Positioned high for mobile */}
                  <div className="flex items-center space-x-4 mb-6">
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.stock}
                      className={`flex-1 py-3 px-6 rounded-lg text-white font-medium flex items-center justify-center space-x-2 ${product.stock ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                      <ShoppingCart size={20} />
                      <span>{product.stock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>
                    <WishlistButton product={product} size="lg" />
                  </div>
                  
                  {/* Origin & Import Information */}
                  {(product.origin || (product.importDetails && product.importDetails.isImported)) && (
                    <div className="mb-5 bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-start">
                        <Globe className="mr-2 text-blue-600 flex-shrink-0 mt-1" size={18} />
                        <div>
                          <h3 className="font-medium text-gray-900">Origin & Import Details</h3>
                          {product.origin && (
                            <div className="text-sm text-gray-700 mt-1">
                              Country of Origin: <span className="font-medium">{product.origin}</span>
                            </div>
                          )}
                          
                          {product.importDetails && product.importDetails.isImported && (
                            <div className="mt-1">
                              <div className="text-sm text-gray-700">
                                <span className="font-medium">Imported Product</span>
                                {product.importDetails.country && (
                                  <span> from {product.importDetails.country}</span>
                                )}
                              </div>
                              {product.importDetails.deliveryNote && (
                                <div className="text-sm text-amber-700 mt-1 flex items-start">
                                  <AlertTriangle size={14} className="mr-1 flex-shrink-0 mt-0.5" />
                                  <span>{product.importDetails.deliveryNote}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping and General Warranty Info */}
                  <div className="mb-4 space-y-3 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center text-gray-700">
                      <Truck className="mr-2 text-blue-600 flex-shrink-0" size={20} />
                      <span>Free shipping on orders over ₹1,000 across India</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <ShieldCheck className="mr-2 text-blue-600 flex-shrink-0" size={20} />
                      <span>Warranty as per the manufacturer</span>
                    </div>
                  </div>
                  
                  {/* Collapsible Warranty & Guarantee Section */}
                  {((product.warranty && product.warranty.available) || 
                    (product.guarantee && product.guarantee.available)) && (
                    <div className="border-t pt-4 mb-4">
                      <button 
                        onClick={toggleWarrantyInfo}
                        className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-2"
                      >
                        <span className="flex items-center">
                          <Award className="mr-2 text-green-600" size={18} />
                          Warranty & Guarantee Information
                        </span>
                        {showWarrantyInfo ? 
                          <ChevronUp size={20} className="text-gray-500" /> :
                          <ChevronDown size={20} className="text-gray-500" />
                        }
                      </button>
                      
                      <div className={`transition-all duration-300 overflow-hidden ${showWarrantyInfo ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 md:max-h-screen md:opacity-100'}`}>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          {product.warranty && product.warranty.available && (
                            <div className="mb-3">
                              <h4 className="font-medium text-gray-900 flex items-center">
                                <ShieldCheck size={16} className="mr-2 text-green-600" />
                                Warranty
                              </h4>
                              <div className="ml-6 mt-1">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Period:</span> {product.warranty.period}
                                </p>
                                {product.warranty.details && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    <span className="font-medium">Details:</span> {product.warranty.details}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {product.guarantee && product.guarantee.available && (
                            <div>
                              <h4 className="font-medium text-gray-900 flex items-center">
                                <ShieldCheck size={16} className="mr-2 text-blue-600" />
                                Guarantee
                              </h4>
                              <div className="ml-6 mt-1">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Period:</span> {product.guarantee.period}
                                </p>
                                {product.guarantee.details && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    <span className="font-medium">Details:</span> {product.guarantee.details}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Collapsible Description Section */}
                  <div className="border-t pt-4 mb-4">
                    <button 
                      onClick={toggleDescription}
                      className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-2"
                    >
                      <span className="flex items-center">
                        <Star className="mr-2 text-blue-600" size={18} />
                        Product Description
                      </span>
                      {showDescription ? 
                        <ChevronUp size={20} className="text-gray-500" /> :
                        <ChevronDown size={20} className="text-gray-500" />
                      }
                    </button>
                    
                    <div className={`transition-all duration-300 overflow-hidden ${showDescription ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 md:max-h-screen md:opacity-100'}`}>
                      <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                    </div>
                  </div>
                  
                  {/* Collapsible Additional Information Section */}
                  {product.additionalInfo && (
                    <div className="border-t pt-4">
                      <button 
                        onClick={toggleAdditionalInfo}
                        className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-2"
                      >
                        <span className="flex items-center">
                          <Info className="mr-2 text-blue-600" size={18} />
                          Additional Information
                        </span>
                        {showAdditionalInfo ? 
                          <ChevronUp size={20} className="text-gray-500" /> :
                          <ChevronDown size={20} className="text-gray-500" />
                        }
                      </button>
                      
                      <div className={`transition-all duration-300 overflow-hidden ${showAdditionalInfo ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 md:max-h-screen md:opacity-100'}`}>
                        <p className="text-gray-700 whitespace-pre-line">{product.additionalInfo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Reviews Section */}
          <div className="bg-white shadow-xl rounded-lg overflow-hidden my-8 p-6">
            <div className="flex items-center mb-6">
              <MessageSquare className="mr-3 text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            </div>
            
            {/* Display reviews component */}
            <ProductReviews productId={id} />
            
            {/* Review form component */}
            <ProductReviewForm 
              productId={id} 
              onReviewSubmitted={() => {
                // Refresh the reviews after submission
                toast.success("Thank you for your review!");
              }} 
            />
          </div>
          
          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <div className="mt-16 mb-12">
              <div className="flex items-center mb-8">
                <Package2 className="mr-3 text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">
                  More {product.type || 'Products'} You Might Like
                </h2>
              </div>
              
              {loadingSimilar ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {similarProducts.map(similarProduct => (
                    <div 
                      key={similarProduct.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full"
                    >
                      {/* Product Image */}
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={similarProduct.image || '/placeholder-image.jpg'} 
                          alt={similarProduct.name} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{similarProduct.name}</h3>
                        
                        {similarProduct.type && (
                          <div className="mt-1 mb-2">
                            <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              {similarProduct.type}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
                          {similarProduct.description}
                        </p>
                        
                        <div className="flex items-baseline mb-4">
                          <span className="text-xl font-bold text-blue-600">
                            ₹{formatPrice(similarProduct.price)}
                          </span>
                          {similarProduct.mrp > similarProduct.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              ₹{formatPrice(similarProduct.mrp)}
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/product/${similarProduct.id}`} 
                            className="flex-grow bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                          >
                            View Product
                          </Link>
                          <button
                            onClick={() => handleAddSimilarToCart(similarProduct)}
                            className="p-2 bg-gray-100 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            aria-label="Add to cart"
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductView;
