import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";

/**
 * Products component displays a complete product catalog with category sections
 * Features:
 * - Fetches products from Firestore database
 * - Organizes products by categories
 * - Provides search functionality
 * - Implements "load more" pagination per category
 * - Uses animations for enhanced user experience
 */
function Products() {
  // State management
  const [products, setProducts] = useState([]); // All products from database
  const [loading, setLoading] = useState(true); // Loading state for initial data fetch
  const [visibleCounts, setVisibleCounts] = useState({}); // Track number of visible products per category
  const [searchTerm, setSearchTerm] = useState(""); // User search input
  const dispatch = useDispatch(); // Redux dispatch for cart actions

  /**
   * Fetch all products from Firestore on component mount
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  /**
   * Predefined category order for consistent display
   * Categories are displayed in this exact order regardless of data order
   */
  const categoriesOrder = [
    "Notebooks and Journals",
    "Pens and Pencils",
    "Paper and Notepads",
    "Planners and Calendars",
    "Office Supplies",
    "Art Supplies",
    "Desk Accessories",
    "Cards and Envelopes",
    "Writing Accessories",
    "Gift Wrap and Packaging",
  ];

  /**
   * Filter and organize products by category
   * Applies search filter if search term exists
   */
  const categorizedProducts = categoriesOrder.map((category) => ({
    category,
    items: products.filter(
      (product) =>
        product.type === category &&
        (searchTerm === "" ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
  }));

  /**
   * Handles loading more products for a specific category
   * @param {string} category - The category to load more products for
   */
  const handleLoadMore = useCallback((category) => {
    setVisibleCounts((prevCounts) => ({
      ...prevCounts,
      [category]: (prevCounts[category] || 4) + 4, // Load 4 more items each time
    }));
  }, []);

  /**
   * Handles adding a product to the cart
   * Dispatches Redux action with product ID and quantity
   * @param {Object} product - The product to add to cart
   */
  const handleAddToCart = useCallback((product) => {
    dispatch(addToCart({
      productId: product.id,
      quantity: 1
    }));
  }, [dispatch]);

  // Show loading spinner while fetching products
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="container mx-auto px-4 py-8 bg-gray-50"
    >
      {/* Page Title */}
      <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">
        Our Premium Collection
      </h1>

      {/* Search Bar */}
      <div className="mb-8 relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 pr-12 text-gray-900 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      {/* Product Categories */}
      {categorizedProducts.map(({ category, items }, index) => {
        // Get visible items based on current count or default to 4
        const visibleItems = items.slice(0, visibleCounts[category] || 4);

        // Skip empty categories
        if (items.length === 0) return null;

        return (
          <div
            key={category}
            className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl"
          >
            {/* Category Banner */}
            <div className="relative h-50 overflow-hidden">
              <img
                src={`/banners/products/${index + 1}.webp`}
                alt={`${category} banner`}
                className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
              <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white capitalize">
                {category}
              </h2>
            </div>

            {/* Products Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleItems.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
              
              {/* Show More button - only display when there are more than 4 items and not all items are shown */}
              {items.length > 4 && !(visibleCounts[category] >= items.length) && (
                <div className="flex justify-center mt-8">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 font-medium shadow-md"
                    onClick={() => handleLoadMore(category)}
                  >
                    <span>Show More Products</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* No Results Message */}
      {products.length === 0 && (
        <div className="text-center text-gray-600 mt-8">
          <p className="text-xl">No products found matching your search.</p>
        </div>
      )}
    </motion.div>
  );
}

export default Products;
