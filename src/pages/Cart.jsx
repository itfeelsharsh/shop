
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { removeFromCart, updateQuantity } from '../redux/cartSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';


function Cart() {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCol = collection(db, "products");
      const productSnapshot = await getDocs(productsCol);
      const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    };
    fetchProducts();
  }, []);

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ productId, quantity }));
  };

  const cartDetails = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product); 

  const total = cartDetails.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <motion.div
    initial={{ opacity: 0, y: 50 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.6, ease: "easeInOut" }} 
    className="container mx-auto px-4 py-8 bg-gray-50"
  >
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-semibold mb-6 text-center text-gray-900">Your Cart</h1>
      {cartDetails.length === 0 ? (
        <p className="text-lg text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col">
          {cartDetails.map(item => (
            <div key={item.productId} className="flex items-center bg-white rounded-lg shadow-lg p-4 mb-4 transition-transform duration-300 transform hover:shadow-xl">
              <img src={item.product.image} alt={item.product.name} className="h-24 w-24 object-contain mr-4 rounded-md shadow-md" />
              <div className="flex-grow">
                <h2 className="text-xl font-medium text-gray-800">{item.product.name}</h2>
                <p className="text-gray-600">Price: ₹{item.product.price}</p>
              </div>
              <input 
                type="number" 
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                className="w-16 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              />
              <button onClick={() => handleRemove(item.productId)} className="text-red-600 font-semibold hover:text-red-500 transition duration-150 ml-4">Remove</button>
            </div>
          ))}
          <div className="mt-6 flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
            <span className="text-2xl font-bold text-gray-800">Total: ₹{total}</span>
            <Link to="/checkout/summary" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 hover:bg-blue-500">Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </div>
    </motion.div>

  );
}

export default Cart;
