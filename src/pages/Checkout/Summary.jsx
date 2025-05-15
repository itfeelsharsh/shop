import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

function CheckoutSummary() {
  const cartItems = useSelector(state => state.cart.items);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCol = collection(db, "products");
      const productSnapshot = await getDocs(productsCol);
      const productList = productSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure price is a number
          price: data.price !== undefined ? parseFloat(data.price) : 0,
          // Ensure stock is a number if needed
          stock: data.stock !== undefined ? parseInt(data.stock, 10) : 0
        };
      });
      setProducts(productList);
    };
    fetchProducts();
  }, []);

  const cartDetails = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const total = cartDetails.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const formatPrice = (price) => {
    const priceStr = price.toString();
    const [integerPart, decimalPart] = priceStr.split('.');

    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);
    const formattedInteger = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherDigits ? "," : "") + lastThreeDigits;

    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg w-full border border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Order Summary</h1>
        {cartDetails.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {cartDetails.map(item => (
                <li key={item.productId} className="flex justify-between items-center py-4">
                  <span className="text-lg font-medium text-gray-700">{item.product.name} x {item.quantity}</span>
                  <span className="text-lg font-semibold text-gray-800">₹{formatPrice((item.product.price * item.quantity).toFixed(2))}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold mt-6 border-t pt-4">
              <span>Total:</span>
              <span>₹{formatPrice(total.toFixed(2))}</span>
            </div>
            <Link to="/checkout/shipping" className="mt-6 block w-full bg-blue-600 text-white text-center font-semibold py-3 rounded-lg transition-transform transform hover:scale-105 duration-200 shadow-md hover:shadow-lg">
              Continue to Shipping
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckoutSummary;
