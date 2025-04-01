import React, { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  TagIcon,
  InformationCircleIcon,
  PhoneIcon,
  UserCircleIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { getDoc, doc } from 'firebase/firestore';
import { useSelector } from 'react-redux';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [profilePic, setProfilePic] = useState('');
  const [userName, setUserName] = useState('User');
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get cart items from Redux store
  const cartItems = useSelector(state => state.cart.items);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfilePic(userData.profilePic || 'https://via.placeholder.com/40');
          setUserName(userData.name || 'User');
        }
      }
    };
    fetchProfileData();
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
      await signOut(auth);
      toast.success("Successfully signed out!");
    } catch (error) {
      toast.error("Error signing out: " + (error.message || "Please try again."));
    }
  };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: TagIcon },
    { name: 'About', href: '/about', icon: InformationCircleIcon },
    { name: 'Contact', href: '/contact', icon: PhoneIcon },
  ];

  const navbarVariants = {
    hidden: { 
      y: -100,
      opacity: 0 
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1
      }
    }
  };

  const menuItemVariants = {
    hidden: { 
      opacity: 0,
      x: -20,
      filter: "blur(8px)"
    },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 100,
        delay: i * 0.1,
        duration: 0.8
      }
    }),
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const badgeVariants = {
    initial: { scale: 0 },
    animate: { 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    },
    exit: { 
      scale: 0,
      opacity: 0
    }
  };

  return (
    <>
      <motion.nav
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300 backdrop-blur-md
          ${isScrolled 
            ? 'bg-white/95 shadow-lg' 
            : 'bg-white/50'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center space-x-2">
                <img
                  className="h-10 w-auto"
                  src="/kamikoto-logo-with-name-tagline-dark-brown-bg.png"
                  alt="KamiKoto"
                />
                <span className="font-bold text-xl text-gray-800">KamiKoto</span>
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item, i) => (
                <motion.div
                  key={item.name}
                  custom={i}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="relative"
                >
                  <Link
                    to={item.href}
                    className={classNames(
                      location.pathname === item.href
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600',
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200'
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-1.5" />
                    {item.name}
                    {location.pathname === item.href && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <Link
                      to="/cart"
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <ShoppingBagIcon className="h-6 w-6" />
                      <AnimatePresence>
                        {cartItemCount > 0 && (
                          <motion.span
                            variants={badgeVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="absolute top-2 -right-0.5 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                          >
                            {cartItemCount > 99 ? '99+' : cartItemCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.div>

                  <div className="relative h-9">
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Menu.Button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <img
                              className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                              src={profilePic}
                              alt={userName}
                            />
                            <span className="text-sm font-medium text-gray-700">{userName}</span>
                          </Menu.Button>
                        </motion.div>
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
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/signin"
                      className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    >
                      Sign in
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/signup"
                      className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      Sign up
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden rounded-lg p-2 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              <div className="w-6 h-5 flex flex-col justify-between">
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  className="h-0.5 w-6 bg-gray-600 transform transition-all duration-300 rounded-full"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="h-0.5 w-6 bg-gray-600 transition-all duration-300 rounded-full"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className="h-0.5 w-6 bg-gray-600 transform transition-all duration-300 rounded-full"
                />
              </div>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-white border-t border-gray-100 shadow-lg"
            >
              <div className="px-4 pt-2 pb-3 space-y-1">
                {navigation.map((item, i) => (
                  <motion.div
                    key={item.name}
                    variants={menuItemVariants}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <Link
                      to={item.href}
                      className={classNames(
                        location.pathname === item.href
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600',
                        'flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {user ? (
                  <>
                    <motion.div
                      variants={menuItemVariants}
                      custom={navigation.length}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <Link
                        to="/cart"
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center relative">
                          <ShoppingBagIcon className="h-5 w-5 mr-3" />
                          Cart
                          {cartItemCount > 0 && (
                            <span className="absolute top-1 left-4 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                              {cartItemCount > 99 ? '99+' : cartItemCount}
                            </span>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      variants={menuItemVariants}
                      custom={navigation.length + 0.5}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <Link
                        to="/my-account"
                        className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserCircleIcon className="h-5 w-5 mr-3" />
                        My Account
                      </Link>
                    </motion.div>
                    
                    <motion.button
                      variants={menuItemVariants}
                      custom={navigation.length + 1}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSignOut}
                      className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                    >
                      Sign out
                    </motion.button>
                  </>
                ) : (
                  <div className="pt-4 space-y-2">
                    <motion.div 
                      variants={menuItemVariants} 
                      custom={navigation.length}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <Link
                        to="/signin"
                        className="block w-full text-center bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign in
                      </Link>
                    </motion.div>
                    <motion.div 
                      variants={menuItemVariants} 
                      custom={navigation.length + 1}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <Link
                        to="/signup"
                        className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <div className="h-16"></div>
    </>
  );
}
