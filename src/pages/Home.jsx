import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom"; // Ensure you have react-router-dom installed

function Home() {
  const [products, setProducts] = useState([]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner Image */}
      <img
        src="/banners/3.png"
        alt="KamiKoto Banner"
        className="w-full mb-6 mx-auto"
      />

      {/* Big Button for Mobile Devices */}
      <div className="block md:hidden mb-6 text-center">
        <Link to="/products">
          <button className="animate-pulse bg-blue-600 text-white py-4 px-8 rounded-full shadow-lg transform transition duration-500 hover:scale-105">
            Check Our Products
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default Home;
