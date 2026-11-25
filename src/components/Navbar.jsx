import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  HomeIcon,
  TagIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { m, AnimatePresence } from 'framer-motion';
import logger from '../utils/logger';
import defaultPfp from '../assets/defaultpfp.png';
import brandLogo from '../assets/kamikoto-logo-transparent-darkish-logo-for-better-visibility.png';
import Button from './Button';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [profilePic, setProfilePic] = useState(defaultPfp);
  const [userName, setUserName] = useState('User');
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Search Overlay States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchProducts, setSearchProducts] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // Get cart items from Redux store
  const cartItems = useSelector(state => state.cart.items);
  
  const cartItemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const [animateCart, setAnimateCart] = useState(false);

  useEffect(() => {
    if (cartItemCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  const mainNavItems = [
    { name: 'Home', href: '/', icon: HomeIcon, exact: true },
    { name: 'Products', href: '/products', icon: TagIcon },
    { name: 'About Project', href: '/about-project', icon: InformationCircleIcon },
  ];

  const bottomNavItems = [
    { name: 'Home', href: '/', icon: HomeIcon, exact: true },
    { name: 'Search', href: '#', icon: MagnifyingGlassIcon, isAction: true },
    { name: 'Products', href: '/products', icon: TagIcon },
    { name: 'Cart', href: '/cart', icon: ShoppingBagIcon, count: cartItemCount },
    { name: 'Account', href: user ? '/my-account' : '/signin', icon: UserCircleIcon },
  ];

  // Lazy-load products for high-performance navbar search
  useEffect(() => {
    if (isSearchOpen && searchProducts.length === 0) {
      const loadProductsForSearch = async () => {
        setIsSearchLoading(true);
        try {
          const cached = sessionStorage.getItem('products_cache');
          if (cached) {
            setSearchProducts(JSON.parse(cached));
            setIsSearchLoading(false);
            return;
          }
          console.log("Preloading products for navbar search...");
          const snapshot = await getDocs(collection(db, "products"));
          const productsArray = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSearchProducts(productsArray);
          sessionStorage.setItem('products_cache', JSON.stringify(productsArray));
        } catch (error) {
          console.error("Failed to fetch products for navbar search:", error);
        } finally {
          setIsSearchLoading(false);
        }
      };
      loadProductsForSearch();
    }
  }, [isSearchOpen, searchProducts.length]);

  // High-performance local search filter
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const term = searchQuery.toLowerCase().trim();
    return searchProducts.filter(product => 
      product.name?.toLowerCase().includes(term) ||
      product.brand?.toLowerCase().includes(term) ||
      product.type?.toLowerCase().includes(term)
    ).slice(0, 5); // Limit to top 5 results for instantaneous rendering
  }, [searchQuery, searchProducts]);

  // Clean-up search on route change
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  // Set up real-time listener for user profile updates
  useEffect(() => {
    if (!user) {
      setProfilePic(defaultPfp);
      setUserName('User');
      return;
    }

    const cachedProfile = sessionStorage.getItem(`profile_${user.uid}`);
    if (cachedProfile) {
      try {
        const profileData = JSON.parse(cachedProfile);
        setProfilePic(profileData.profilePic || user.photoURL || defaultPfp);
        setUserName(profileData.name || user.displayName || 'User');
      } catch (e) {
        logger.error("Failed to parse cached profile", e, "Navbar");
      }
    } else {
      setProfilePic(user.photoURL || defaultPfp);
      setUserName(user.displayName || 'User');
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const name = userData.name || user.displayName || 'User';
        const pic = userData.profilePic || user.photoURL || defaultPfp;
        
        sessionStorage.setItem(`profile_${user.uid}`, JSON.stringify({
          profilePic: pic,
          name: name
        }));

        setProfilePic(pic);
        setUserName(name);
      } else {
        const name = user.displayName || 'User';
        const pic = user.photoURL || defaultPfp;
        setProfilePic(pic);
        setUserName(name);
      }
    }, (error) => {
      logger.error("Failed to fetch profile data in real-time", error, "Navbar");
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      logger.user.action("Sign out");
      await signOut(auth);
      toast.success("Successfully signed out!");
    } catch (error) {
      logger.error("Sign out failed", error, "Auth");
      toast.error("Error signing out: " + (error.message || "Please try again."));
    }
  };

  const formatPrice = (price) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <>
      <nav className="hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-2">
          <Link to="/" className="group inline-flex items-center gap-2" aria-label="KamiKoto home">
            <img src={brandLogo} alt="" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold tracking-tight text-gray-950">
              KamiKoto<span className="text-red-700">.</span>
            </span>
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Everyday essentials</span>
        </div>
      </nav>

      <nav
        className={`
          sticky top-0 left-0 right-0 z-50 rounded-t-[28px]
          transition-all duration-300 backdrop-blur-xl
          hidden md:block
          ${isScrolled 
            ? 'bg-[#FFF7F7]/95 shadow-sm border-b border-[#F3E3E3]'
            : 'bg-[#FFF9F9]/90 border-b border-[#F6E9E9]'}
        `}
      >
        <div className="mx-auto max-w-7xl px-2 sm:px-8">
          <div className="flex h-[72px] items-center justify-between">
            <div className="flex-shrink-0">
              <Link to="/" className="group inline-flex items-center gap-3" aria-label="KamiKoto home">
                <img src={brandLogo} alt="" className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105" />
                <span className="text-[25px] font-bold tracking-tight text-gray-950">
                  KamiKoto<span className="text-red-700">.</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {mainNavItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={classNames(
                      location.pathname === item.href
                        ? 'text-gray-950 after:scale-x-100'
                        : 'text-gray-500 after:scale-x-0 hover:text-gray-950 hover:after:scale-x-100',
                      'relative flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors after:absolute after:inset-x-4 after:bottom-1.5 after:h-0.5 after:origin-left after:rounded-full after:bg-red-700 after:transition-transform'
                    )}
                  >
                    <item.icon className={`h-[18px] w-[18px] transition-colors ${location.pathname === item.href ? 'text-red-700' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Interactive Search Bar Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                title="Search Products"
                aria-label="Search products"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <div className="relative">
                <Link
                  to="/cart"
                  className={classNames(
                    "relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-all duration-300 hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2",
                    animateCart ? "scale-110 text-gray-950" : ""
                  )}
                  aria-label={`Cart${cartItemCount ? `, ${cartItemCount} items` : ''}`}
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <div className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-700 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {cartItemCount}
                    </div>
                  )}
                </Link>
              </div>
              
              {user ? (
                <div className="relative h-9">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2">
                      <img
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                        src={profilePic}
                        alt={userName}
                      />
                      <span className="text-sm font-semibold text-gray-700 hidden lg:inline">{userName}</span>
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl border border-gray-200 bg-white py-1 shadow-xl shadow-gray-950/10 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/my-account"
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'flex items-center px-4 py-2 text-sm font-medium text-gray-700'
                              )}
                            >
                              <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                              My Account
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/wishlist"
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'flex items-center px-4 py-2 text-sm font-medium text-gray-700'
                              )}
                            >
                              <HeartIcon className="mr-3 h-5 w-5 text-gray-400" />
                              My Wishlist
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'flex w-full items-center px-4 py-2 text-sm font-medium text-gray-700 text-left'
                              )}
                            >
                              <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/signin"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950"
                  >
                    Sign in
                  </Link>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigate('/signup')}
                    className="!rounded-lg !bg-[#D32F2F] !px-4 !py-2 !text-sm !font-semibold !shadow-none hover:!bg-[#B71C1C]"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modern, High-Performance Frosted Search Modal (Intersection of Minimalist+Maximalist) */}
      <AnimatePresence>
        {isSearchOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/85 backdrop-blur-2xl flex flex-col justify-start pt-14 md:pt-24 px-4 overflow-y-auto"
          >
            {/* Close Trigger */}
            <button
              onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
              className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-red-50 border border-gray-100 rounded-full text-gray-500 hover:text-red-600 transition-all duration-300"
              aria-label="Close search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-full max-w-2xl mx-auto">
              <m.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-2">Instant Search</span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Looking for something?</h3>
              </m.div>

              {/* Input Capsule */}
              <div className="relative mb-8 shadow-sm">
                <div className="absolute inset-y-0 left-1.5 pl-4.5 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  autoFocus
                  type="text"
                  placeholder="Type notebook, pen, ruler..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 placeholder-gray-400 font-medium text-base shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Instant Search Results Panel */}
              <div className="bg-white/80 border border-gray-100 rounded-[28px] p-5 shadow-xl backdrop-blur-md">
                {isSearchLoading ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Caching Collection...</span>
                  </div>
                ) : searchQuery ? (
                  filteredSearchResults.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Matches Found</h4>
                      <div className="divide-y divide-gray-50">
                        {filteredSearchResults.map(product => (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="flex items-center gap-4 py-3.5 hover:bg-gray-50/50 rounded-2xl px-2 transition-all group"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-gray-50 flex-shrink-0"
                            />
                            <div className="flex-grow min-w-0">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{product.brand}</span>
                              <h4 className="text-sm font-bold text-gray-900 truncate leading-tight group-hover:text-red-600 transition-colors">{product.name}</h4>
                            </div>
                            <div className="text-sm font-black text-gray-900 flex-shrink-0">
                              {formatPrice(product.price)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-sm font-bold text-gray-900 mb-1">No matches found</p>
                      <p className="text-xs text-gray-400 font-medium">Try searching for generic terms like "notebook" or "writing".</p>
                    </div>
                  )
                ) : (
                  <div className="py-6">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 mb-3">Popular Searches</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Notebook", "Pen", "Pencil", "Planner"].map(term => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-4 py-2 bg-gray-50 hover:bg-red-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:text-red-600 transition-all duration-300"
                        >
                          {term} Collection
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Bottom Tab Navigation (for mobile) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] border-t border-[#F3E3E3] bg-[#FFF9F9]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden"
      >
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-3">
          {bottomNavItems.map((item) => {
            const isActive = item.isAction 
              ? isSearchOpen 
              : ((item.exact && location.pathname === item.href) || (!item.exact && location.pathname.startsWith(item.href) && item.href !== '/') || (item.href === '/' && location.pathname === '/'));
            
            if (item.isAction) {
              return (
                <button
                  key={item.name}
                  onClick={() => setIsSearchOpen(true)}
                  className={classNames(
                    isActive ? 'text-gray-900' : 'text-gray-500',
                    'flex flex-col items-center justify-center flex-1 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-tighter transition-all duration-300 focus:outline-none bg-transparent border-none'
                  )}
                >
                  <div className="relative">
                    <div className={classNames(isActive ? 'bg-gray-900 text-white' : 'bg-transparent', 'p-2 rounded-xl transition-all duration-200') }>
                      <item.icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                  </div>
                  <span className={classNames(isActive ? 'text-gray-900' : 'text-gray-500','truncate text-[10px]')}>{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  'flex flex-col items-center justify-center flex-1 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-tighter transition-all duration-300 focus:outline-none'
                )}
              >
                <div className="relative flex items-center justify-center">
                  <div className={classNames(isActive ? 'bg-gray-900 text-white shadow-md' : 'bg-transparent text-gray-500', 'p-2 rounded-xl transition-all duration-300') }>
                    {item.name === 'Account' && user ? (
                      <img
                        src={profilePic}
                        alt={userName}
                        className={`h-6 w-6 rounded-full object-cover ring-2 transition-all duration-300 ${isActive ? 'ring-white scale-105' : 'ring-transparent'}`}
                      />
                    ) : (
                      <item.icon className={`h-6 w-6 ${isActive ? 'text-white' : ''}`} />
                    )}
                  </div>
                  {item.name === 'Cart' && item.count > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                      {item.count > 9 ? '9+' : item.count}
                    </span>
                  )}
                </div>
                <span className={classNames(isActive ? 'text-gray-900' : 'text-gray-500', 'truncate text-[10px]')}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
