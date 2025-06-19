import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom"; 
import { m } from "framer-motion"; 
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import DynamicBanner from "../components/DynamicBanner";
import { useContentLoader } from "../hooks/useContentLoader";

/**
 * Home Page Component
 * 
 * The main landing page for the shop featuring:
 * - Dynamic banner system with slideshow capabilities (preloaded for optimal performance)
 * - Featured products section (preloaded to ensure instant display)
 * - Call to action for product exploration
 * - Enhanced loading states and error handling
 * 
 * Uses preloaded data from the content loader hook for instant rendering
 * Falls back to fresh data fetching if preloaded data is unavailable
 * 
 * @returns {JSX.Element} The Home page component
 */
function Home() {
  const [products, setProducts] = useState([]);
  const [isLoadingFresh, setIsLoadingFresh] = useState(false);
  const dispatch = useDispatch();
  
  // Get preloaded data from the content loader
  const { getCachedData, preloadedData } = useContentLoader();

  useEffect(() => {
    /**
     * Fetches products marked to be shown on the home page
     * First tries to use preloaded data, then falls back to fresh fetch if needed
     */
    const initializeProducts = async () => {
      try {
        // Try to get preloaded products first
        const cachedProducts = getCachedData('products');
        
        if (cachedProducts && cachedProducts.length > 0) {
          console.log('✅ Using preloaded products data');
          setProducts(cachedProducts);
          return;
        }
        
        // Fallback: fetch fresh data if preloaded data is not available
        console.log('🔄 Fetching fresh products data...');
        setIsLoadingFresh(true);
        
        const productsCol = collection(db, "products");
        const productSnapshot = await getDocs(productsCol);
        const productList = productSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure stock is a number, defaulting to 0 if undefined or not a number
            stock: data.stock !== undefined ? parseInt(data.stock, 10) : 0,
            // Ensure price is a number, defaulting to 0 if undefined or not a number
            price: data.price !== undefined ? parseFloat(data.price) : 0,
            // Also ensure mrp is a number if it exists
            mrp: data.mrp !== undefined ? parseFloat(data.mrp) : null
          };
        });

        const filteredProducts = productList.filter(product => product.showOnHome);
        setProducts(filteredProducts);
        console.log('✅ Fresh products data loaded');
        
      } catch (error) {
        console.error("❌ Error initializing products:", error);
        // Set empty array to prevent loading state from hanging
        setProducts([]);
      } finally {
        setIsLoadingFresh(false);
      }
    };
    
    initializeProducts();
  }, [getCachedData]);

  // Monitor preloaded data changes and update products when available
  useEffect(() => {
    const preloadedProducts = preloadedData?.products;
    if (preloadedProducts && preloadedProducts.length > 0 && products.length === 0) {
      console.log('📦 Updating with newly preloaded products');
      setProducts(preloadedProducts);
    }
  }, [preloadedData, products.length]);

  /**
   * Handles adding a product to the cart with enhanced error handling
   * @param {Object} product - The product to add to cart
   */
  const handleAddToCart = useCallback((product) => {
    try {
      dispatch(addToCart({
        productId: product.id,
        quantity: 1
      }));
    } catch (error) {
      console.error('❌ Error adding product to cart:', error);
    }
  }, [dispatch]);

  return (
    <m.div
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeInOut" }} 
      className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen"
    >
      {/* Dynamic Banner Component - now uses preloaded data */}
      <DynamicBanner />

      {/* Featured Products Section */}
      <div className="mb-8">
        <m.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-800 mb-6 text-center"
        >
          Featured Products
        </m.h2>
        
        {/* Loading state for fresh data fetch */}
        {isLoadingFresh && products.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}
        
        {/* Products grid with enhanced animations */}
        {products.length > 0 && (
          <m.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, staggerChildren: 0.1 }}
          >
            {products.map((product, index) => (
              <m.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              </m.div>
            ))}
          </m.div>
        )}
        
        {/* No products fallback */}
        {!isLoadingFresh && products.length === 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-500 text-lg mb-4">
              🛍️ No featured products available at the moment
            </div>
            <Link to="/products" className="text-blue-600 hover:text-blue-800 font-medium">
              Browse all products →
            </Link>
          </m.div>
        )}
      </div>
      
      {/* Call to Action for Mobile with enhanced styling */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="block md:hidden mt-12 mb-6 text-center"
      >
        <Link to="/products">
          <button className="animate-pulse bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-full shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-xl font-semibold">
            ✨ Explore Our Complete Collection ✨
          </button>
        </Link>
      </m.div>
    </m.div>
  );
}

export default Home;
