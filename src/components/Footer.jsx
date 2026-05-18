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
      className="bg-[#0A0A0C] border-t border-zinc-900 text-zinc-300 pt-20 pb-12 mt-20 relative z-10 hidden md:block overflow-hidden"
    >
      {/* Decorative top red accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent"></div>

      {/* Subtle Dotted Sketchbook Grid Background (Maximalist Texture) */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c1c1f_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50"></div>

      {/* Architectural Crop Marks (Theme Visual Ornaments) */}
      <div className="absolute top-6 left-6 text-[9px] font-mono text-zinc-700 select-none tracking-widest pointer-events-none">
        [ 34.7398° N, 135.5023° E ]
      </div>
      <div className="absolute top-6 right-6 text-[9px] font-mono text-zinc-700 select-none tracking-widest pointer-events-none">
        [ KOTO // EST. 2026 ]
      </div>

      {/* Crop Mark Corners */}
      <div className="absolute top-0 left-0 w-4 h-[1px] bg-zinc-800/80"></div>
      <div className="absolute top-0 left-0 w-[1px] h-4 bg-zinc-800/80"></div>
      <div className="absolute top-0 right-0 w-4 h-[1px] bg-zinc-800/80"></div>
      <div className="absolute top-0 right-0 w-[1px] h-4 bg-zinc-800/80"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Sleek Ticker Capsule Notice */}
        <div className="mb-16 bg-zinc-950/60 border border-zinc-900/80 rounded-full px-6 py-3 text-[10px] tracking-widest text-zinc-400 font-bold uppercase text-center max-w-3xl mx-auto flex items-center justify-center gap-2.5 shadow-inner select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-zinc-650 font-semibold font-mono">[DEMO STORE]</span>
          This website is a demo store for portfolio purposes. No real orders or payments are processed.
        </div>

        {/* Main Footer Links & Brand info - Restructured to 12 cols total */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-12 lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/10 ring-1 ring-white/10">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <Link to="/" className="text-2xl font-black tracking-tight text-white hover:opacity-90 transition-opacity">
                KamiKoto<span className="text-red-500 font-black">.</span>
              </Link>
            </div>
            <p className="text-zinc-400 font-light leading-relaxed text-sm max-w-sm">
              Refining the modern creative workflow. We source, build, and deliver premium stationery tools for designers, architects, and writers globally.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-zinc-950/80 hover:bg-red-500 border border-zinc-900 hover:border-red-500 flex items-center justify-center text-zinc-450 hover:text-white transition-all duration-300 shadow-sm hover:scale-105"
                title="Follow on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-zinc-950/80 hover:bg-red-500 border border-zinc-900 hover:border-red-500 flex items-center justify-center text-zinc-450 hover:text-white transition-all duration-300 shadow-sm hover:scale-105"
                title="Follow on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-6 lg:col-span-3 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono">Shop Collection</h4>
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
                    className="text-sm text-zinc-450 hover:text-white transition-colors duration-300 flex items-center group relative py-1.5 w-fit"
                  >
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-red-500 group-hover:w-full transition-all duration-300"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care (4 cols) */}
          <div className="md:col-span-6 lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono">Customer Care</h4>
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
                    className="text-sm text-zinc-450 hover:text-white transition-colors duration-300 flex items-center group relative py-1.5 w-fit"
                  >
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-red-500 group-hover:w-full transition-all duration-300"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Premium Shopify-style Trust Badges Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 py-12 border-y border-zinc-900/80 mb-12">
          
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-950/30 border border-zinc-900/60 hover:border-zinc-800 transition-all duration-300 group">
            <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-red-500 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-[11px] tracking-wider text-zinc-100 uppercase font-mono">Free India Delivery</h5>
              <p className="text-[11px] text-zinc-500 font-light mt-0.5 leading-normal">On all premium orders above ₹500</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-950/30 border border-zinc-900/60 hover:border-zinc-800 transition-all duration-300 group">
            <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-red-500 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-[11px] tracking-wider text-zinc-100 uppercase font-mono">Premium Materials</h5>
              <p className="text-[11px] text-zinc-500 font-light mt-0.5 leading-normal">Curated authentic Japanese papers</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-950/30 border border-zinc-900/60 hover:border-zinc-800 transition-all duration-300 group">
            <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-red-500 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-[11px] tracking-wider text-zinc-100 uppercase font-mono">Secure Checkouts</h5>
              <p className="text-[11px] text-zinc-500 font-light mt-0.5 leading-normal">UPI, Cards & Netbanking options</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-950/30 border border-zinc-900/60 hover:border-zinc-800 transition-all duration-300 group">
            <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-red-500 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-[11px] tracking-wider text-zinc-100 uppercase font-mono">Easy Return Policy</h5>
              <p className="text-[11px] text-zinc-500 font-light mt-0.5 leading-normal">Simple 7-day storefront returns</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Ornamental Tag */}
        <div className="pt-8 mt-4 border-t border-zinc-900 flex justify-between items-center text-zinc-500 text-[10px] font-mono">
          <p>© {new Date().getFullYear()} KamiKoto. All rights reserved.</p>
          <p className="tracking-[0.25em] opacity-40 select-none hidden sm:block">DESIGNED FOR CREATIVES</p>
        </div>

      </div>
    </m.footer>
  );
};

export default Footer;
