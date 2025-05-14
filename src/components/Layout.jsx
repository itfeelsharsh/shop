import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useInView } from 'react-intersection-observer';

/**
 * Layout component to wrap all pages with common structure
 * Contains the navbar, main content, and footer
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the layout
 * @returns {JSX.Element} Layout component with navbar, content area and footer
 */
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
      
      <main
        ref={ref}
        className="flex-grow pb-16 md:pb-0"
      >
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout; 