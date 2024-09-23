import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCounts, setVisibleCounts] = useState({});
  const [expandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsArray);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categoriesOrder = [
    'Notebooks and Journals',
    'Pens and Pencils',
    'Paper and Notepads',
    'Planners and Calendars',
    'Office Supplies',
    'Art Supplies',
    'Desk Accessories',
    'Cards and Envelopes',
    'Writing Accessories',
    'Gift Wrap and Packaging',
  ];

  const categorizedProducts = categoriesOrder.map((category) => ({
    category,
    items: products.filter(product => 
      product.type === category && 
      (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
  }));

  const handleLoadMore = useCallback((category) => {
    setVisibleCounts(prevCounts => ({
      ...prevCounts,
      [category]: (prevCounts[category] || 3) + 3,
    }));
  }, []);

  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">Our Premium Collection</h1>
      
      <div className="mb-8 relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 pr-12 text-gray-900 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {categorizedProducts.map(({ category, items }, index) => {
        const isExpanded = expandedCategories[category];
        const visibleItems = isExpanded ? items : items.slice(0, visibleCounts[category] || 3);

        if (items.length === 0) return null;

        return (
          <div key={category} className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:shadow-xl">
            <div className="relative h-39 overflow-hidden">
              <img 
                src={`/banners/products/${index + 1}.png`}
                alt={`${category} banner`}
                className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
              <h2 className="absolute bottom-4 left-4 text-3xl font-bold text-white capitalize">{category}</h2>
            </div>

            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-full' : 'max-h-[1000px] overflow-hidden'}`}>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {visibleItems.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {!isExpanded && items.length > visibleItems.length && (
                  <div className="text-center mt-6">
                    <button
                      className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadMore(category);
                      }}
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {products.length === 0 && (
        <div className="text-center text-gray-600 mt-8">
          <p className="text-xl">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
}

export default Products;