import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy, limit, startAfter, where } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { Helmet } from "react-helmet-async";
import Button from "../components/Button";

const ProductSkeleton = () => (
  <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
    <div className="aspect-[4/5] bg-gray-100" />
    <div className="p-5 flex flex-col gap-3 flex-grow">
      <div className="flex justify-between">
        <div className="h-3 w-16 bg-gray-100 rounded-full" />
        <div className="h-3 w-12 bg-gray-100 rounded-full" />
      </div>
      <div className="h-5 w-full bg-gray-100 rounded-lg" />
      <div className="h-5 w-2/3 bg-gray-100 rounded-lg" />
      <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
        <div className="h-6 w-20 bg-gray-100 rounded-lg" />
        <div className="h-10 w-10 bg-gray-100 rounded-full" />
      </div>
    </div>
  </div>
);

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // High-performance search debounce states
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selected category state for top horizontal selector
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination & Infinite Scroll states
  const [visibleCount, setVisibleCount] = useState(12);
  const observerRef = useRef(null);

  const [filters, setFilters] = useState({
    priceRange: { min: "", max: "" },
    brands: [],
    origin: "",
    importStatus: "",
    warranty: false,
    guarantee: false,
    inStock: false
  });

  const [availableBrands, setAvailableBrands] = useState([]);
  const dispatch = useDispatch();
  const [user] = useAuthState(auth);

  // Pagination cursor & control states
  const lastVisibleRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);

  // Search input debouncer effect (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
      setVisibleCount(12); // Reset infinite scroll to first page on search
    }, 250);

    return () => clearTimeout(handler);
  }, [inputValue]);

  // Fetch paginated chunk from Firestore
  const fetchProductsPage = useCallback(async (isInitial = false, retries = 3, delay = 500) => {
    if (isFullyLoaded) return;
    
    if (isInitial && retries === 3) {
      setLoading(true);
      setProducts([]);
      lastVisibleRef.current = null;
      setHasMore(true);
    } else if (!isInitial && retries === 3) {
      setIsPaginating(true);
    }

    try {
      let q = query(collection(db, "products"));
      
      if (activeCategory !== "All") {
        q = query(q, where("type", "==", activeCategory));
      }
      
      q = query(q, orderBy("name"), limit(12));
      
      if (!isInitial && lastVisibleRef.current) {
        q = query(q, startAfter(lastVisibleRef.current));
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot && querySnapshot.docs) {
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        if (isInitial) {
          setProducts(fetchedProducts);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = fetchedProducts.filter(p => !existingIds.has(p.id));
            return [...prev, ...newProducts];
          });
        }
        
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        lastVisibleRef.current = lastDoc || null;
        
        if (fetchedProducts.length < 12) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
      setLoading(false);
      setIsPaginating(false);
    } catch (error) {
      console.error(`Error fetching paginated products (retries left: ${retries}):`, error);
      if (retries > 0) {
        setTimeout(() => {
          fetchProductsPage(isInitial, retries - 1, delay * 2);
        }, delay);
      } else {
        setLoading(false);
        setIsPaginating(false);
      }
    }
  }, [activeCategory, isFullyLoaded]);

  // Fetch all products for search or filters
  const fetchAllProducts = useCallback(async (retries = 3, delay = 500) => {
    if (isFullyLoaded) return;
    if (retries === 3) setLoading(true);
    
    try {
      console.log("Searching or filtering triggered: Loading full product catalog...");
      const querySnapshot = await getDocs(collection(db, "products"));
      
      if (querySnapshot && querySnapshot.docs) {
        const productsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setProducts(productsArray);
        setIsFullyLoaded(true);
        setHasMore(false);
        
        // Cache to sessionStorage so subsequent runs are read-free
        const now = Date.now();
        sessionStorage.setItem('products_cache', JSON.stringify(productsArray));
        sessionStorage.setItem('products_fetch_time', now.toString());
      }
      setLoading(false);
    } catch (error) {
      console.error(`Error loading full catalog (retries left: ${retries}):`, error);
      if (retries > 0) {
        setTimeout(() => {
          fetchAllProducts(retries - 1, delay * 2);
        }, delay);
      } else {
        setLoading(false);
      }
    }
  }, [isFullyLoaded]);

  // Handle active filters count calculation
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'priceRange') {
        return count + (value.min || value.max ? 1 : 0);
      }
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return count + (value !== "" && value !== false ? 1 : 0);
    }, 0);
  }, [filters]);

  // Proactively fetch all products to perform full client-side search/filtering
  useEffect(() => {
    if ((searchTerm !== "" || activeFiltersCount > 0) && !isFullyLoaded && !loading && !isPaginating) {
      fetchAllProducts();
    }
  }, [searchTerm, activeFiltersCount, isFullyLoaded, loading, isPaginating, fetchAllProducts]);

  // Initialize and check cache or fetch page 1
  useEffect(() => {
    const checkCacheAndInit = () => {
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
          setIsFullyLoaded(true);
          setHasMore(false);
          setLoading(false);
          return true;
        }
      } catch (e) {
        console.warn("sessionStorage access failed during init:", e);
      }
      return false;
    };

    const hasCache = checkCacheAndInit();
    if (!hasCache) {
      setIsFullyLoaded(false);
      fetchProductsPage(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeCategory]);

  // Derive unique brands from active collection
  useEffect(() => {
    if (products.length > 0) {
      const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
      setAvailableBrands(brands);
    }
  }, [products]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setVisibleCount(12); // Reset infinite scroll pagination
  };

  const resetFilters = () => {
    setFilters({
      priceRange: { min: "", max: "" },
      brands: [],
      origin: "",
      importStatus: "",
      warranty: false,
      guarantee: false,
      inStock: false
    });
    setVisibleCount(12);
  };

  // High-performance IntersectionObserver infinite scroll trigger
  useEffect(() => {
    if (!observerRef.current || loading || isPaginating) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (isFullyLoaded) {
          setVisibleCount((prev) => prev + 12);
        } else if (hasMore) {
          fetchProductsPage(false);
        }
      }
    }, {
      rootMargin: "250px", // Trigger slightly before reaching the bottom
      threshold: 0.01
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, isPaginating, isFullyLoaded, hasMore, fetchProductsPage]);

  const categories = useMemo(() => [
    "All",
    "Notebooks and Journals",
    "Pens and Pencils",
    "Paper and Notepads",
    "Planners and Calendars",
    "Office Supplies",
    "Art Supplies",
    "Desk Accessories",
    "Cards and Envelopes",
    "Writing Accessories",
    "Gift Wrap and Packaging"
  ], []);

  // Highly optimized product filter computation
  const filteredProducts = useMemo(() => {
    const processed = products.map(product => ({
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      originalPrice: product.originalPrice ?
        (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice)
        : null,
      stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) : product.stock,
    }));

    return processed.filter((product) => {
      // Category filter (Top Pill bar)
      if (activeCategory !== "All" && product.type !== activeCategory) return false;

      // Price filter
      if (filters.priceRange.min && product.price < parseFloat(filters.priceRange.min)) return false;
      if (filters.priceRange.max && product.price > parseFloat(filters.priceRange.max)) return false;

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;

      // Origin filter
      if (filters.origin && product.origin?.toLowerCase() !== filters.origin.toLowerCase()) return false;

      // Import status
      if (filters.importStatus) {
        const isImported = product.importDetails?.isImported;
        if (filters.importStatus === 'imported' && !isImported) return false;
        if (filters.importStatus === 'local' && isImported) return false;
      }

      // Extras
      if (filters.warranty && !product.warranty?.available) return false;
      if (filters.guarantee && !product.guarantee?.available) return false;
      if (filters.inStock && product.stock <= 0) return false;

      // Debounced Search term matching
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();

      return (
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.slug?.toLowerCase().includes(term) ||
        product.origin?.toLowerCase().includes(term) ||
        product.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    });
  }, [products, activeCategory, searchTerm, filters]);

  // Paginated chunk currently visible on screen
  const visibleProducts = useMemo(() => {
    if (isFullyLoaded) {
      return filteredProducts.slice(0, visibleCount);
    }
    return filteredProducts;
  }, [filteredProducts, visibleCount, isFullyLoaded]);

  const handleAddToCart = useCallback((product) => {
    dispatch(addToCart({
      productId: product.id,
      quantity: 1
    }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>Loading Premium Products... | KamiKoto</title>
        </Helmet>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8 animate-pulse">
            <div className="h-10 w-64 bg-gray-100 rounded-xl mb-4" />
            <div className="h-5 w-48 bg-gray-50 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Shop Premium Products | KamiKoto</title>
        <meta name="description" content="Explore our curated collection of premium notebooks, journals, writing tools, and desk accessories." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <m.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Store Collection</span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mt-1.5 mb-2">Shop All Products</h1>
          <p className="text-gray-500 text-sm font-medium">Enjoy free shipping on all orders above ₹500.</p>
        </m.div>

        {/* High-Performance Debounced Search and Filter Bar */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-[24px] p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Lag-free instant input container */}
            <div className="relative w-full flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search collection (e.g., notebook, pen)..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200/80 rounded-2xl focus:bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 placeholder-gray-400 text-sm shadow-sm"
              />
              {inputValue && (
                <button
                  onClick={() => setInputValue("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
              icon={<SlidersHorizontal className="w-4 h-4" />}
              className="h-[48px] w-full sm:w-auto btn-shopify px-6 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              Advanced Filters
              {activeFiltersCount > 0 && (
                <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-black">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-1">Active:</span>
                {Object.entries(filters).map(([key, value]) => {
                  if (key === 'priceRange' && (value.min || value.max)) {
                    return (
                      <div key={key} className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm text-gray-800 px-3 py-1 rounded-xl text-xs font-semibold">
                        <span>Price: {value.min ? `₹${value.min}` : 'Min'} - {value.max ? `₹${value.max}` : 'Max'}</span>
                        <button onClick={() => handleFilterChange('priceRange', { min: "", max: "" })} className="text-gray-400 hover:text-gray-900">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }
                  if (Array.isArray(value) && value.length > 0) {
                    return value.map(item => (
                      <div key={`${key}-${item}`} className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm text-gray-800 px-3 py-1 rounded-xl text-xs font-semibold">
                        <span>Brand: {item}</span>
                        <button onClick={() => handleFilterChange(key, value.filter(v => v !== item))} className="text-gray-400 hover:text-gray-900">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ));
                  }
                  if (typeof value === 'string' && value) {
                    return (
                      <div key={key} className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm text-gray-800 px-3 py-1 rounded-xl text-xs font-semibold">
                        <span>Origin: {value}</span>
                        <button onClick={() => handleFilterChange(key, "")} className="text-gray-400 hover:text-gray-900">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }
                  if (typeof value === 'boolean' && value) {
                    return (
                      <div key={key} className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm text-gray-800 px-3 py-1 rounded-xl text-xs font-semibold">
                        <span>{key === 'warranty' ? 'Warranty' : key === 'guarantee' ? 'Guarantee' : 'In Stock'}</span>
                        <button onClick={() => handleFilterChange(key, false)} className="text-gray-400 hover:text-gray-900">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={resetFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-bold underline ml-2"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ transform: "translateZ(0)", willChange: "height, opacity" }}
              className="mb-8 bg-gray-50 border border-gray-100 rounded-[28px] p-6 overflow-hidden shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Price Range filter */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Price Range</h4>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 focus:bg-white transition-all text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Brands filter */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Filter by Brand</h4>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {availableBrands.map(brand => (
                      <label key={brand} className="flex items-center space-x-2.5 cursor-pointer hover:bg-white/80 p-1.5 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={(e) => {
                            const newBrands = e.target.checked
                              ? [...filters.brands, brand]
                              : filters.brands.filter(b => b !== brand);
                            handleFilterChange('brands', newBrands);
                          }}
                          className="rounded border-gray-200 text-gray-900 focus:ring-gray-900 w-4 h-4"
                        />
                        <span className="text-sm text-gray-700 font-medium">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Country of Origin / Availability */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Import / Origin</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Origin country"
                        value={filters.origin}
                        onChange={(e) => handleFilterChange('origin', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                      />
                      <select
                        value={filters.importStatus}
                        onChange={(e) => handleFilterChange('importStatus', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                      >
                        <option value="">All Statuses</option>
                        <option value="imported">Imported</option>
                        <option value="local">Local</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="rounded border-gray-200 text-gray-900 focus:ring-gray-900 w-4 h-4"
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600">In Stock Only</span>
                    </label>
                    
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.warranty}
                        onChange={(e) => handleFilterChange('warranty', e.target.checked)}
                        className="rounded border-gray-200 text-gray-900 focus:ring-gray-900 w-4 h-4"
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600">With Warranty</span>
                    </label>
                  </div>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Premium Shopify-style Category Pills Bar */}
        <div className="relative mb-10 pb-2 border-b border-gray-100">
          <div 
            className="flex overflow-x-auto gap-2.5 py-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 transform-gpu"
            style={{ WebkitOverflowScrolling: 'touch', willChange: 'transform' }}
          >
            {categories.map((category) => {
              const isSelected = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setVisibleCount(12); // Reset page on category change
                  }}
                  className={`
                    whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex-shrink-0
                    ${isSelected 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'}
                  `}
                >
                  {category === "All" ? "All Products" : category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Total Count Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-gray-500">
            Showing <span className="text-gray-900 font-bold">{Math.min(filteredProducts.length, visibleCount)}</span> of <span className="text-gray-900 font-bold">{filteredProducts.length}</span> premium products
          </p>
        </div>

        {/* Unified Products Grid */}
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          /* Empty / No Results State */
          <div className="text-center py-20 bg-gray-50/50 border border-gray-100 rounded-[32px] max-w-xl mx-auto px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-gray-100 shadow-md rounded-2xl mb-4 text-red-600 font-black">
              ✦
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products matching filters</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">We couldn't find matches. Try clearing some filters or searching for another term.</p>
            <Button
              variant="primary"
              onClick={() => { resetFilters(); setInputValue(""); setActiveCategory("All"); }}
              className="btn-shopify bg-gray-900 hover:bg-red-600 text-white text-xs font-bold rounded-xl py-2 px-5"
            >
              Reset All Filters
            </Button>
          </div>
        )}

        {/* Infinite Scroll Trigger & loading status */}
        {((isFullyLoaded && filteredProducts.length > visibleCount) || (!isFullyLoaded && hasMore)) && (
          <div 
            ref={observerRef} 
            className="h-24 flex items-center justify-center mt-12 border-t border-gray-100 pt-8"
          >
            <div className="flex flex-col items-center gap-2">
              {/* Sleek loading animation */}
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Loading more products...</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-16"></div>
    </div>
  );
}

export default Products;
