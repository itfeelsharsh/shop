import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  return (
    <div className="border rounded shadow-lg p-4 flex flex-col">
      <img src={product.image} alt={product.name} className="h-40 object-contain mb-4" />
      <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
      <p className="text-gray-700 flex-grow mb-4">{product.description.substring(0, 100)}...</p>
      <div className="mt-auto flex justify-between items-center">
        <span className="text-blue-500 font-bold text-lg">₹{product.price}</span>
        <Link to={`/product/${product.id}`} className="bg-blue-500 text-white px-4 py-2 rounded transition duration-200 hover:bg-blue-600">
          View
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
