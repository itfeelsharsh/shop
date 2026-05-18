import React from 'react';
import { Link } from 'react-router-dom';
import { m } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { 
  Instagram, 
  Twitter,
  Truck,
  Sparkles,
  ShieldCheck,
  RefreshCw
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

  return (
    <m.footer
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="bg-[#FCFCF9] border-t border-zinc-200 text-gray-600 pt-20 pb-12 mt-20 relative z-10 hidden md:block overflow-hidden font-sans"
    >
      {/* Decorative top red accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D32F2F]/30 to-transparent"></div>

      {/* Subtle Dotted Sketchbook Grid Background (Maximalist Texture) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none opacity-60"></div>

      {/* Architectural Crop Marks (Theme Visual Ornaments) */}
      <div className="absolute top-6 left-6 text-[9px] font-mono text-zinc-400 font-semibold select-none tracking-widest pointer-events-none">

      </div>
      <div className="absolute top-6 right-6 text-[9px] font-mono text-zinc-400 font-semibold select-none tracking-widest pointer-events-none">
  
      </div>

      {/* Crop Mark Corners */}
      <div className="absolute top-0 left-0 w-4 h-[1px] bg-zinc-300/80"></div>
      <div className="absolute top-0 left-0 w-[1px] h-4 bg-zinc-300/80"></div>
      <div className="absolute top-0 right-0 w-4 h-[1px] bg-zinc-300/80"></div>
      <div className="absolute top-0 right-0 w-[1px] h-4 bg-zinc-300/80"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Professional clear warning banner */}
        <div className="mb-16 bg-red-50 border-2 border-[#D32F2F] rounded-2xl p-6 md:p-8 max-w-4xl mx-auto shadow-sm select-none text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D32F2F] flex items-center justify-center text-white flex-shrink-0 font-black text-xl font-mono">
              !
            </div>
            <div>
              <h3 className="text-base font-black text-[#D32F2F] uppercase tracking-wider font-mono">
                LEGAL NOTICE: 
              </h3>
              <p className="text-sm font-bold text-red-950 mt-1 uppercase tracking-tight">
                This is demo project, NOT a REAL e-com store.
              </p>
              <p className="text-xs text-red-750/90 mt-2 font-medium leading-relaxed">
                Any registration details, checkout simulations, card credentials, or orders placed on this platform are used purely to demonstrate front-end and back-end integration features. No currency transactions occur, no items will be fulfilled, and no physical packages will be shipped.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Brand info - Restructured to 12 cols total */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-12 lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
          
              <Link to="/" className="text-2xl font-black tracking-tight text-gray-900 hover:opacity-90 transition-opacity">
                KamiKoto Stationeries Private Limited <span className="text-[#D32F2F] font-black">.</span>
              </Link>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed text-sm max-w-sm">
              Proudly scamming you since 2024. <br></br> Thank you for your support.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-white hover:bg-[#D32F2F] border border-zinc-200 hover:border-[#D32F2F] flex items-center justify-center text-zinc-500 hover:text-white transition-all duration-300 shadow-sm hover:scale-105"
                title="Follow on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-white hover:bg-[#D32F2F] border border-zinc-200 hover:border-[#D32F2F] flex items-center justify-center text-zinc-500 hover:text-white transition-all duration-300 shadow-sm hover:scale-105"
                title="Follow on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-6 lg:col-span-3 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">Shop Collection</h4>
            <ul className="space-y-4">
              {[
                { label: 'All Products', path: '/products' },
                { label: 'Notebooks', path: '/products?category=notebooks' },
                { label: 'Writing Tools', path: '/products?category=writing' },
                { label: 'Accessories', path: '/products?category=accessories' }
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors duration-300 flex items-center group relative py-1.5 w-fit"
                  >
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D32F2F] group-hover:w-full transition-all duration-300"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care (4 cols) */}
          <div className="md:col-span-6 lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">Customer Care</h4>
            <ul className="space-y-4">
              {[
                { label: 'Return Policy', path: '/return-policy' },
                { label: 'Shipping Info', path: '/shipping-info' },
                { label: 'Privacy Policy', path: '/privacy-policy' },
                { label: 'Terms of Service', path: '/terms-of-service' }
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors duration-300 flex items-center group relative py-1.5 w-fit"
                  >
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D32F2F] group-hover:w-full transition-all duration-300"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>



        {/* Bottom Bar: Copyright & Ornamental Tag */}
        <div className="pt-8 mt-4 border-t border-zinc-200 flex justify-between items-center text-zinc-400 font-semibold text-[10px] font-mono">
          <p>© {new Date().getFullYear()} KamiKoto. All rights reserved.</p>
          <p className="tracking-[0.25em] opacity-50 select-none hidden sm:block">DESIGNED FOR CREATIVES</p>
        </div>

      </div>
    </m.footer>
  );
};

export default Footer;
