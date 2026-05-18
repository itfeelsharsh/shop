import React from 'react';
import { Link } from 'react-router-dom';
import { m } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { 
  Send, 
  Instagram, 
  Twitter 
} from 'lucide-react';

const Footer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <m.footer
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="bg-gradient-to-b from-white via-red-50/10 to-white border-t border-gray-100 text-gray-900 pt-20 pb-12 mt-20 relative z-10 hidden md:block"
    >
      {/* Decorative top red gradient highlight strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Alert Banner - Demo purposes disclaimer with subtle red/white bg theme inserts */}
        <div className="mb-12 bg-gradient-to-r from-red-50/40 via-white to-red-50/40 border border-red-100/50 rounded-2xl p-4 sm:p-5 text-[11px] text-red-700/80 font-semibold leading-relaxed italic text-center max-w-4xl mx-auto shadow-sm">
          This website is a demo store for portfolio purposes. No real orders or payments are processed.
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <Link to="/" className="text-3xl font-black tracking-tighter hover:opacity-80 transition-opacity inline-block">
                KamiKoto<span className="text-red-600 font-extrabold">.</span>
              </Link>
            </div>
            <p className="text-gray-500 leading-relaxed text-sm max-w-sm">
              Refining the modern creative workflow. We source, build, and deliver premium stationery tools for designers, architects, and writers globally.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-50 hover:bg-red-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-red-600 transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-50 hover:bg-red-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-red-600 transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Shop Collection</h4>
            <ul className="space-y-3.5">
              {[
                { label: 'All Products', path: '/products' },
                { label: 'Notebooks', path: '/products?category=notebooks' },
                { label: 'Writing Tools', path: '/products?category=writing' },
                { label: 'Accessories', path: '/products?category=accessories' }
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className="text-sm text-gray-600 hover:text-red-600 hover:font-medium transition-all flex items-center group"
                  >
                    <span className="w-0 group-hover:w-1.5 h-[1.5px] bg-red-600 mr-0 group-hover:mr-2 transition-all"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer Care</h4>
            <ul className="space-y-3.5">
              {[
                { label: 'Return Policy', path: '/return-policy' },
                { label: 'Shipping Info', path: '/shipping-info' },
                { label: 'Privacy Policy', path: '/privacy-policy' },
                { label: 'Terms of Service', path: '/terms-of-service' }
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className="text-sm text-gray-600 hover:text-red-600 hover:font-medium transition-all flex items-center group"
                  >
                    <span className="w-0 group-hover:w-1.5 h-[1.5px] bg-red-600 mr-0 group-hover:mr-2 transition-all"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shopify-like Newsletter subscription box (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Join the Collective</h4>
            <p className="text-sm text-gray-500 leading-normal">
              Subscribe to receive updates, access to exclusive launches, and secret stationery drop alerts.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Successfully subscribed!"); }} className="relative max-w-sm">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full bg-gray-50 hover:bg-gray-100 text-sm px-4 py-3 pr-12 rounded-2xl border border-transparent focus:border-gray-200 focus:bg-white focus:ring-1 focus:ring-gray-900 transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gray-900 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Top Info Banner / Trust Badges - Moved inside the footer with subtle red-and-white card gradient inserts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12 border-y border-gray-100 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-white flex items-center justify-center border border-red-100/50 flex-shrink-0 text-red-600 shadow-sm">
              🇮🇳
            </div>
            <div>
              <h5 className="font-bold text-sm tracking-tight text-gray-900">Free India Delivery</h5>
              <p className="text-xs text-gray-400 mt-0.5">On all premium orders above ₹500</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-white flex items-center justify-center border border-red-100/50 flex-shrink-0 text-red-600 shadow-sm">
              ✦
            </div>
            <div>
              <h5 className="font-bold text-sm tracking-tight text-gray-900">Premium Materials</h5>
              <p className="text-xs text-gray-400 mt-0.5">Curated authentic Japanese papers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-white flex items-center justify-center border border-red-100/50 flex-shrink-0 text-red-600 shadow-sm">
              ✓
            </div>
            <div>
              <h5 className="font-bold text-sm tracking-tight text-gray-900">Secure Checkouts</h5>
              <p className="text-xs text-gray-400 mt-0.5">UPI, Cards & Netbanking options</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-white flex items-center justify-center border border-red-100/50 flex-shrink-0 text-red-600 shadow-sm">
              ⇄
            </div>
            <div>
              <h5 className="font-bold text-sm tracking-tight text-gray-900">Easy Return Policy</h5>
              <p className="text-xs text-gray-400 mt-0.5">Simple 7-day storefront returns</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 mt-4 border-t border-gray-100 flex justify-center text-center">
          <p className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} KamiKoto. All rights reserved.
          </p>
        </div>
      </div>
    </m.footer>
  );
};

export default Footer;
