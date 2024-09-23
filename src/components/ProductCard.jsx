
import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  return (
    <div className="border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="h-40 w-full object-contain transition-transform duration-300 transform hover:scale-105"
      />
      {/* <img src={`${product.image}`} alt={product.name} className="h-40 object-contain mb-4" /> */}
      <div className="p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">{product.name}</h2>
        <p className="text-gray-700 flex-grow">{product.description.substring(0, 100)}...</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-blue-600 font-bold text-lg">₹{product.price}</span>
          <Link
            to={`/product/${product.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-blue-500"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
