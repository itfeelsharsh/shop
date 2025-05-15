import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { removeFromCart, updateQuantity } from '../redux/cartSlice';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
// Auth imports commented out as they're not currently used
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { auth } from '../firebase/config';

/**
 * Cart component that displays cart items and popular products recommendation
 */
function Cart() {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [user] = useAuthState(auth); // Commented out since it's not being used

  useEffect(() => {
    /**
     * Fetches all products from Firestore to match with cart items
     * and also gets products that should be shown on home page (popular products)
     */
    const fetchProducts = async () => {
      try {
        const productsCol = collection(db, "products");
        const productSnapshot = await getDocs(productsCol);
        const productList = productSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure price is a number
            price: data.price !== undefined ? parseFloat(data.price) : 0,
            // Ensure mrp is a number if it exists
            mrp: data.mrp !== undefined ? parseFloat(data.mrp) : null,
            // Ensure stock is a number
            stock: data.stock !== undefined ? parseInt(data.stock, 10) : 0
          };
        });
        
        // Set all products for cart items
        setProducts(productList);
        
        // Filter popular products (those shown on home page)
        const homeProducts = productList.filter(product => product.showOnHome);
        setPopularProducts(homeProducts);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  /**
   * Removes an item from the cart
   * @param {string} productId - The ID of the product to remove
   */
  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  /**
   * Updates the quantity of an item in the cart
   * @param {string} productId - The ID of the product to update
   * @param {number} quantity - The new quantity
   */
  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ productId, quantity }));
  };

  // Match cart items with product details
  const cartDetails = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean); // Remove null items

  // Calculate total cost of items in cart
  // const subtotal = cartDetails.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  /**
   * Format price with Indian currency format
   * @param {number} price - The price to format
   * @returns {string} Formatted price string
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeInOut" }} 
      className="bg-gray-50 min-h-screen"
    >
      <div className="container mx-auto px-4 py-12">
        {/* Cart Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Shopping Cart</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Review and manage the items in your cart before proceeding to checkout
          </p>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-lg mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
              <ShoppingBag className="text-gray-500" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link 
              to="/products"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800">Cart Items ({cartDetails.length})</h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cartDetails.map(item => (
                    <div key={item.productId} className="p-6 flex flex-col md:flex-row items-center">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="md:ml-6 flex-grow mt-4 md:mt-0 text-center md:text-left">
                        <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.product.type}</p>
                        <p className="text-blue-600 font-semibold mt-2">{formatPrice(item.product.price)}</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center mt-4 md:mt-0">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => handleQuantityChange(item.productId, Math.max(1, item.quantity - 1))}
                            className="p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                            className="w-12 p-1 text-center border-x border-gray-300 focus:outline-none"
                            min="1"
                          />
                          <button 
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        {/* Remove Button */}
                        <button 
                          onClick={() => handleRemove(item.productId)} 
                          className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                <Link 
                  to="/checkout" 
                  className="bg-blue-600 text-white text-center py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition duration-200 font-medium"
                >
                  <div className="flex items-center justify-center">
                    <span>Checkout</span>
                    <ChevronRight size={18} className="ml-2" />
                  </div>
                </Link>
                
                <Link 
                  to="/products" 
                  className="border border-gray-300 bg-white text-gray-700 text-center py-3 px-6 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Popular Products Recommendation */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularProducts.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </m.div>
  );
}

export default Cart;
