import React from 'react';
import { Link } from 'react-router-dom';
import { m } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { Instagram, Twitter, } from 'lucide-react';

const Footer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.08,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <m.footer
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="bg-white border-t border-gray-200 text-gray-600 pt-16 pb-8 mt-20 relative z-10 hidden md:block font-sans"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">
              KamiKoto
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
Scamming you since 1871, <br></br> PROUDLY.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-900 flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300"
                title="Follow on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-900 flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300"
                title="Follow on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: 'All Products', path: '/products' },
                { label: 'Notebooks', path: '/products?category=notebooks' },
                { label: 'Writing Tools', path: '/products?category=writing' },
         
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Support</h4>
            <ul className="space-y-3">
              {[
                { label: 'Shipping Info', path: '/shipping-info' },
                { label: 'Return Policy', path: '/return-policy' },
                { label: 'Contact Us', path: '/contact' }
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', path: '/privacy-policy' },
                { label: 'Terms of Service', path: '/terms-of-service' }
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 1871 KamiKoto Stationeries Pvt. Ltd. - NO rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            This is a Demo project.
          </p>
        </div>

      </div>
    </m.footer>
  );
};

export default Footer;
