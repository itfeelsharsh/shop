import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom"; 
import { m } from "framer-motion"; 
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import DynamicBanner from "../components/DynamicBanner";

/**
 * Home Page Component
 * 
 * The main landing page for the shop featuring:
 * - Dynamic banner system with slideshow capabilities
 * - Featured products section
 * - Call to action for product exploration
 * 
 * @returns {JSX.Element} The Home page component
 */
function Home() {
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    /**
     * Fetches products marked to be shown on the home page
     */
    const fetchProducts = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  /**
   * Handles adding a product to the cart
   * @param {Object} product - The product to add to cart
   */
  const handleAddToCart = useCallback((product) => {
    dispatch(addToCart({
      productId: product.id,
      quantity: 1
    }));
  }, [dispatch]);

  return (
    <m.div
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeInOut" }} 
      className="container mx-auto px-4 py-8 bg-gray-50"
    >
      {/* Dynamic Banner Component */}
      <DynamicBanner />

      {/* Featured Products Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
      
      {/* Call to Action for Mobile */}
      <div className="block md:hidden mt-12 mb-6 text-center">
        <Link to="/products">
          <button className="animate-pulse bg-blue-600 text-white py-4 px-8 rounded-full shadow-lg transform transition duration-500 hover:scale-105">
            Explore Our Complete Collection
          </button>
        </Link>
      </div>
    </m.div>
  );
}

export default Home;
