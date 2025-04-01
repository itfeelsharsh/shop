import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom"; 
import { motion } from "framer-motion"; 
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";

function Home() {
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCol = collection(db, "products");
      const productSnapshot = await getDocs(productsCol);
      const productList = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredProducts = productList.filter(product => product.showOnHome);
      setProducts(filteredProducts);
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
    <motion.div
    initial={{ opacity: 0, y: 50 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.6, ease: "easeInOut" }} 
    className="container mx-auto px-4 py-8 bg-gray-50"
  >
      {/* Banner Image */}
      <img
        src="/banners/3.webp"
        alt="KamiKoto Banner"
        className="w-full mb-6 mx-auto"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
      <br /><br /><br />
      <div className="block md:hidden mb-6 text-center">
        <Link to="/products">
          <button className="animate-pulse bg-blue-600 text-white py-4 px-8 rounded-full shadow-lg transform transition duration-500 hover:scale-105">
            Explore More Products
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default Home;
