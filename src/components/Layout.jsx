import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { pageTransition, scrollReveal } from '../utils/animations';
import { useInView } from 'react-intersection-observer';

const Layout = ({ children }) => {
  const location = useLocation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          ref={ref}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-grow"
        >
          {/* Page Title Section */}
          <motion.div
            variants={scrollReveal}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
          >
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <motion.h1 
                className="text-4xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {getPageTitle(location.pathname)}
              </motion.h1>
              <motion.p
                className="mt-2 text-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {getPageDescription(location.pathname)}
              </motion.p>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={scrollReveal}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            {children}
          </motion.div>
        </motion.main>
      </AnimatePresence>

      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

// Helper function to get page titles
const getPageTitle = (pathname) => {
  const titles = {
    '/': 'Welcome to KamiKoto',
    '/products': 'Our Premium Collection',
    '/about': 'About Us',
    '/contact': 'Get in Touch',
    '/cart': 'Your Shopping Cart',
    '/my-account': 'Your Profile',
    '/signin': 'Sign In',
    '/signup': 'Create Account'
  };
  return titles[pathname] || 'KamiKoto';
};

// Helper function to get page descriptions
const getPageDescription = (pathname) => {
  const descriptions = {
    '/': 'Discover our curated collection of premium products',
    '/products': 'Explore our handpicked selection of exceptional items',
    '/about': 'Learn about our story and mission',
    '/contact': 'We\'d love to hear from you',
    '/cart': 'Review and manage your selected items',
    '/my-account': 'Manage your account and preferences',
    '/signin': 'Welcome back to KamiKoto',
    '/signup': 'Join our community of satisfied customers'
  };
  return descriptions[pathname] || '';
};

// Scroll to Top Button Component
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default Layout; 