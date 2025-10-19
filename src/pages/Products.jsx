import React, { useEffect, useState, useCallback, useMemo } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { Search, Filter, X, SlidersHorizontal, Loader2 } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";

/**
 * Modern Products Page
 *
 * Features:
 * - Advanced search and filtering
 * - Organized by categories
 * - Modern, minimalistic design
 * - Smooth animations
 * - Responsive grid layout
 */
function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCounts, setVisibleCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    priceRange: { min: "", max: "" },
    brands: [],
    types: [],
    origin: "",
    importStatus: "",
    warranty: false,
    guarantee: false,
    inStock: false
  });

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);

  const dispatch = useDispatch();
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const cachedProducts = sessionStorage.getItem('products_cache');
        const lastFetchTime = sessionStorage.getItem('products_fetch_time');
        const now = Date.now();

        const authStateKey = user ? `auth_${user.uid}` : 'no_auth';
        const lastAuthState = sessionStorage.getItem('last_auth_state');
        const authStateChanged = lastAuthState !== authStateKey;

        sessionStorage.setItem('last_auth_state', authStateKey);

        if (cachedProducts && lastFetchTime &&
            (now - parseInt(lastFetchTime)) < 5 * 60 * 1000 &&
            !authStateChanged) {
          setProducts(JSON.parse(cachedProducts));
          setLoading(false);
          return;
        }

        console.log("Fetching fresh products data...", { authStateKey, isAuthenticated: !!user });
        const querySnapshot = await getDocs(collection(db, "products"));

        if (querySnapshot && querySnapshot.docs) {
          const productsArray = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setProducts(productsArray);
          sessionStorage.setItem('products_cache', JSON.stringify(productsArray));
          sessionStorage.setItem('products_fetch_time', now.toString());
          console.log(`Successfully fetched ${productsArray.length} products`);
        } else {
          console.error("Query snapshot is invalid", querySnapshot);
          throw new Error("Failed to get valid product data");
        }

      } catch (error) {
        console.error("Error fetching products:", error);

        const cachedProducts = sessionStorage.getItem('products_cache');
        if (cachedProducts) {
          console.log("Using cached products as fallback after fetch error");
          setProducts(JSON.parse(cachedProducts));
        } else {
          console.log("No cache available for fallback, showing empty products list");
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      // Cleanup if needed
    };
  }, [user]);

  useEffect(() => {
    if (products.length > 0) {
      const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
      const types = [...new Set(products.map(p => p.type).filter(Boolean))];
      setAvailableBrands(brands);
      setAvailableTypes(types);
    }
  }, [products]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      priceRange: { min: "", max: "" },
      brands: [],
      types: [],
      origin: "",
      importStatus: "",
      warranty: false,
      guarantee: false,
      inStock: false
    });
  };

  const categoriesOrder = useMemo(() => [
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
  ], []);

  const categorizedProducts = useMemo(() => {
    const processedProducts = products.map(product => ({
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      originalPrice: product.originalPrice ?
        (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice)
        : null,
      stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) : product.stock,
    }));

    return categoriesOrder.map((category) => ({
      category,
      items: processedProducts.filter((product) => {
        if (product.type !== category) return false;

        if (filters.priceRange.min && product.price < parseFloat(filters.priceRange.min)) return false;
        if (filters.priceRange.max && product.price > parseFloat(filters.priceRange.max)) return false;

        if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
        if (filters.types.length > 0 && !filters.types.includes(product.type)) return false;

        if (filters.origin && product.origin !== filters.origin) return false;

        if (filters.importStatus) {
          const isImported = product.importDetails?.isImported;
          if (filters.importStatus === 'imported' && !isImported) return false;
          if (filters.importStatus === 'local' && isImported) return false;
        }

        if (filters.warranty && !product.warranty?.available) return false;
        if (filters.guarantee && !product.guarantee?.available) return false;
        if (filters.inStock && product.stock <= 0) return false;

        if (searchTerm === "") return true;

        const term = searchTerm.toLowerCase();

        if (product.name?.toLowerCase().includes(term)) return true;
        if (product.description?.toLowerCase().includes(term)) return true;
        if (product.brand?.toLowerCase().includes(term)) return true;
        if (product.slug?.toLowerCase().includes(term)) return true;
        if (product.origin?.toLowerCase().includes(term)) return true;
        if (product.additionalInfo?.toLowerCase().includes(term)) return true;
        if (product.tags?.some(tag => tag.toLowerCase().includes(term))) return true;

        if (product.warranty?.available) {
          if (product.warranty.details?.toLowerCase().includes(term)) return true;
          if (product.warranty.period?.toLowerCase().includes(term)) return true;
        }

        if (product.guarantee?.available) {
          if (product.guarantee.details?.toLowerCase().includes(term)) return true;
          if (product.guarantee.period?.toLowerCase().includes(term)) return true;
        }

        if (product.importDetails?.isImported) {
          if (product.importDetails.country?.toLowerCase().includes(term)) return true;
          if (product.importDetails.deliveryNote?.toLowerCase().includes(term)) return true;
        }

        return false;
      }),
    }));
  }, [products, searchTerm, categoriesOrder, filters]);

  const handleLoadMore = useCallback((category) => {
    setVisibleCounts((prevCounts) => ({
      ...prevCounts,
      [category]: (prevCounts[category] || 12) + 12,
    }));
  }, []);

  const handleAddToCart = useCallback((product) => {
    dispatch(addToCart({
      productId: product.id,
      quantity: 1
    }));
  }, [dispatch]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).reduce((count, value) => {
      if (typeof value === 'object') {
        return count + Object.values(value).filter(v => v !== "" && v !== false).length;
      }
      return count + (value !== "" && value !== false && value.length > 0 ? 1 : 0);
    }, 0);
  }, [filters]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Loader2 className="w-12 h-12 text-gray-900 animate-spin mb-4" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Collection</h1>
          <p className="text-gray-600">Explore our premium stationery products</p>
        </m.div>

        {/* Search and Filter Bar */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  showFilters
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-gray-900 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => {
                    if (key === 'priceRange' && (value.min || value.max)) {
                      return (
                        <div key={key} className="flex items-center gap-2 bg-gray-100 text-gray-900 px-3 py-1.5 rounded-lg text-sm">
                          <span>Price: {value.min ? `₹${value.min}` : 'Min'} - {value.max ? `₹${value.max}` : 'Max'}</span>
                          <button
                            onClick={() => handleFilterChange('priceRange', { min: "", max: "" })}
                            className="text-gray-700 hover:text-gray-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }
                    if (Array.isArray(value) && value.length > 0) {
                      return value.map(item => (
                        <div key={`${key}-${item}`} className="flex items-center gap-2 bg-gray-100 text-gray-900 px-3 py-1.5 rounded-lg text-sm">
                          <span>{key === 'brands' ? 'Brand' : 'Type'}: {item}</span>
                          <button
                            onClick={() => handleFilterChange(key, value.filter(v => v !== item))}
                            className="text-gray-700 hover:text-gray-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ));
                    }
                    if (typeof value === 'string' && value) {
                      return (
                        <div key={key} className="flex items-center gap-2 bg-gray-100 text-gray-900 px-3 py-1.5 rounded-lg text-sm">
                          <span>{key === 'origin' ? 'Origin' : 'Import'}: {value}</span>
                          <button
                            onClick={() => handleFilterChange(key, "")}
                            className="text-gray-700 hover:text-gray-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }
                    if (typeof value === 'boolean' && value) {
                      return (
                        <div key={key} className="flex items-center gap-2 bg-gray-100 text-gray-900 px-3 py-1.5 rounded-lg text-sm">
                          <span>{key === 'warranty' ? 'With Warranty' : key === 'guarantee' ? 'With Guarantee' : 'In Stock'}</span>
                          <button
                            onClick={() => handleFilterChange(key, false)}
                            className="text-gray-700 hover:text-gray-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })}
                  <button
                    onClick={resetFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 underline font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Price Range</label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange.min}
                        onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange.max}
                        onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Brands</label>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                      {availableBrands.map(brand => (
                        <label key={brand} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={(e) => {
                              const newBrands = e.target.checked
                                ? [...filters.brands, brand]
                                : filters.brands.filter(b => b !== brand);
                              handleFilterChange('brands', newBrands);
                            }}
                            className="rounded text-gray-900 focus:ring-gray-900"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Product Types */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Product Types</label>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                      {availableTypes.map(type => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.types.includes(type)}
                            onChange={(e) => {
                              const newTypes = e.target.checked
                                ? [...filters.types, type]
                                : filters.types.filter(t => t !== type);
                              handleFilterChange('types', newTypes);
                            }}
                            className="rounded text-gray-900 focus:ring-gray-900"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Origin */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Origin</label>
                    <input
                      type="text"
                      placeholder="Country of origin"
                      value={filters.origin}
                      onChange={(e) => handleFilterChange('origin', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  {/* Import Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Import Status</label>
                    <select
                      value={filters.importStatus}
                      onChange={(e) => handleFilterChange('importStatus', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="">All Products</option>
                      <option value="imported">Imported Products</option>
                      <option value="local">Local Products</option>
                    </select>
                  </div>

                  {/* Additional Filters */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Additional Filters</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.warranty}
                          onChange={(e) => handleFilterChange('warranty', e.target.checked)}
                          className="rounded text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm text-gray-700">With Warranty</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.guarantee}
                          onChange={(e) => handleFilterChange('guarantee', e.target.checked)}
                          className="rounded text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm text-gray-700">With Guarantee</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                          className="rounded text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm text-gray-700">In Stock Only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>

        {/* Product Categories */}
        <div className="space-y-8">
          {categorizedProducts.map(({ category, items }, index) => {
            const visibleItems = items.slice(0, visibleCounts[category] || 12);

            if (items.length === 0) return null;

            return (
              <m.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Category Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">{category}</h2>
                  <p className="text-gray-300 text-sm mt-1">{items.length} items</p>
                </div>

                {/* Products Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {visibleItems.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {items.length > 12 && !(visibleCounts[category] >= items.length) && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => handleLoadMore(category)}
                        className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              </m.div>
            );
          })}
        </div>

        {/* No Results */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-12"></div>
    </div>
  );
}

export default Products;
