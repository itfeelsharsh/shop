import React, { Fragment, useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  HomeIcon,
  TagIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { getDoc, doc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import logger from '../utils/logger';
import defaultPfp from '../assets/defaultpfp.png';
import Button from './Button';

/**
 * Utility function to combine CSS classes conditionally
 * @param  {...string} classes - CSS class names to combine
 * @returns {string} - Combined class names
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [profilePic, setProfilePic] = useState('');
  const [userName, setUserName] = useState('User');
  const [profileLoading, setProfileLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Get cart items from Redux store
  const cartItems = useSelector(state => state.cart.items);
  
  // Use useMemo to avoid recalculating on every render
  const cartItemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Define navigation items for both top navbar and bottom tab bar
  const mainNavItems = [
    { name: 'Home', href: '/', icon: HomeIcon, exact: true }, // Added exact for better active state matching
    { name: 'Products', href: '/products', icon: TagIcon },
    // Additional navigation items can be added here when needed
  ];

  // Define items for the bottom tab navigation, including essentials like Cart and Account
  const bottomNavItems = [
    { name: 'Home', href: '/', icon: HomeIcon, exact: true },
    { name: 'Products', href: '/products', icon: TagIcon },
    { name: 'Cart', href: '/cart', icon: ShoppingBagIcon, count: cartItemCount }, // Added count for cart badge
    { name: 'Account', href: user ? '/my-account' : '/signin', icon: UserCircleIcon }, // Dynamic link based on auth state
  ];

  /**
   * Fetches user profile data from Firestore
   * Uses caching mechanism to avoid redundant fetches
   * Has proper error handling to prevent app crashes
   */
  const fetchProfileData = useCallback(async () => {
    // Skip if user not authenticated or if already loading
    if (!user || profileLoading) return;
    
    // Use cached profile data from sessionStorage if available
    const cachedProfile = sessionStorage.getItem(`profile_${user.uid}`);
    if (cachedProfile) {
      try {
        const profileData = JSON.parse(cachedProfile);
        setProfilePic(profileData.profilePic || defaultPfp);
        setUserName(profileData.name || 'User');
        return;
      } catch (error) {
        // If parse fails, proceed with fetch
        logger.error("Failed to parse cached profile", error, "Navbar");
      }
    }
    
    try {
      setProfileLoading(true);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Cache the profile data
        sessionStorage.setItem(`profile_${user.uid}`, JSON.stringify({
          profilePic: userData.profilePic || defaultPfp,
          name: userData.name || 'User'
        }));

        setProfilePic(userData.profilePic || defaultPfp);
        setUserName(userData.name || 'User');
      }
    } catch (error) {
      logger.error("Failed to fetch profile data", error, "Navbar");
      // Use default values on error
      setProfilePic(defaultPfp);
      setUserName('User');
    } finally {
      setProfileLoading(false);
    }
  }, [user, profileLoading]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user, fetchProfileData]);

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

  /**
   * Handle user sign out with proper error handling and logging
   */
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

  return (
    <>
      {/* Top Navigation Bar (for desktop and tablet) */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300 backdrop-blur-md
          hidden md:block {/* Hidden on mobile, block on md and larger */}
          ${isScrolled 
            ? 'bg-white/95 shadow-lg' 
            : 'bg-white/50'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  className="h-10 w-auto"
                  src="/kamikoto-logo-with-name-tagline-dark-brown-bg.png"
                  alt="KamiKoto"
                />
                <span className="font-bold text-xl text-gray-800">KamiKoto</span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {mainNavItems.map((item) => ( // Changed to mainNavItems
                <div
                  key={item.name}
                  className="relative"
                >
                  <Link
                    to={item.href}
                    className={classNames(
                      location.pathname === item.href
                        ? 'text-gray-900 bg-gray-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                      'flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300'
                    )}
                  >
                    <item.icon className={`h-5 w-5 mr-2 transition-transform duration-300 ${location.pathname === item.href ? 'scale-110' : ''}`} />
                    {item.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <Link
                  to="/cart"
                  className="text-gray-600 hover:text-gray-900 transition-all duration-300 relative p-2 rounded-xl hover:bg-gray-50"
                >
                  <ShoppingBagIcon className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm">
                      {cartItemCount}
                    </div>
                  )}
                </Link>
              </div>
              
              {user ? (
                <div className="relative h-9">
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <div>
                        <Menu.Button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                          <img
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                            src={profilePic}
                            alt={userName}
                          />
                          <span className="text-sm font-medium text-gray-700">{userName}</span>
                        </Menu.Button>
                      </div>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/my-account"
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'flex items-center px-4 py-2 text-sm text-gray-700'
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
                                'flex items-center px-4 py-2 text-sm text-gray-700'
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
                                'flex w-full items-center px-4 py-2 text-sm text-gray-700'
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
                    className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigate('/signup')}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for the fixed top navbar (only for desktop/tablet) */}
      <div className="hidden md:block h-16"></div>

      {/* Bottom Tab Navigation (for mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
          {bottomNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={classNames(
                ((item.exact && location.pathname === item.href) || (!item.exact && location.pathname.startsWith(item.href) && item.href !== '/') || (item.href === '/' && location.pathname === '/'))
                  ? 'text-gray-900'
                  : 'text-gray-400',
                'flex flex-col items-center justify-center flex-1 pt-1 pb-1 text-[10px] font-bold uppercase tracking-tighter transition-all duration-300 focus:outline-none'
              )}
            >
              <div className="relative">
                {item.name === 'Account' && user ? (
                  <img
                    src={profilePic}
                    alt={userName}
                    className={`h-6 w-6 mb-1 rounded-full object-cover ring-2 transition-all duration-300 ${location.pathname === item.href ? 'ring-gray-900 scale-110' : 'ring-transparent'}`}
                  />
                ) : (
                  <item.icon className={`h-6 w-6 mb-1 transition-transform duration-300 ${((item.exact && location.pathname === item.href) || (!item.exact && location.pathname.startsWith(item.href) && item.href !== '/') || (item.href === '/' && location.pathname === '/')) ? 'scale-110' : ''}`} />
                )}
                {item.name === 'Cart' && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-gray-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                    {item.count > 9 ? '9+' : item.count}
                  </span>
                )}
              </div>
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
