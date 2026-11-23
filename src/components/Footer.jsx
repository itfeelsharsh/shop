import React from 'react';
import { Link } from 'react-router-dom';
import { m } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { ArrowUpRight, Instagram, Twitter } from 'lucide-react';
import brandLogo from '../assets/kamikoto-logo-transparent-darkish-logo-for-better-visibility.png';

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
      className="relative z-10 mt-16 hidden border-t border-gray-200 bg-white pb-8 pt-12 font-sans text-gray-600 md:block sm:mt-20 sm:pt-16"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-12 lg:mb-14 lg:grid-cols-4">
          
          {/* Brand Column */}
          <div className="col-span-2 space-y-4 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 text-lg font-bold tracking-tight text-gray-950 transition-colors hover:text-red-800">
              <img src={brandLogo} alt="" className="h-9 w-9 object-contain" />
              KamiKoto<span className="-ml-3 text-red-700">.</span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-gray-500">
              Thoughtfully made essentials for writing, planning, and everyday creativity.
            </p>
            {/* Social Icons */}
            <div className="flex gap-2 pt-1">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-950 hover:bg-gray-950 hover:text-white"
                title="Follow on Instagram"
                aria-label="Follow KamiKoto on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-950 hover:bg-gray-950 hover:text-white"
                title="Follow on Twitter"
                aria-label="Follow KamiKoto on X"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-950">Shop</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'All Products', path: '/products' },
                { label: 'Notebooks', path: '/products?category=notebooks' },
                { label: 'Writing Tools', path: '/products?category=writing' },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className="group inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-red-800"
                  >
                    {item.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-950">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Shipping Info', path: '/shipping-info' },
                { label: 'Return Policy', path: '/return-policy' },
                { label: 'Contact Us', path: '/contact' }
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className="group inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-red-800"
                  >
                    {item.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-950">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy Policy', path: '/privacy-policy' },
                { label: 'Terms of Service', path: '/terms-of-service' }
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className="group inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-red-800"
                  >
                    {item.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} KamiKoto Stationeries Pvt. Ltd.
          </p>
          <p>Made for the things you make.</p>
        </div>

      </div>
    </m.footer>
  );
};

export default Footer;
