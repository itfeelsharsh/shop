import React from 'react';
import { Link } from 'react-router-dom';
import { m } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { Mail, Phone, MapPin, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <m.footer
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="bg-gray-950 text-white pt-20 pb-10 mt-20 border-t border-gray-900 hidden md:block"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <m.div variants={itemVariants} className="space-y-6">
            <Link to="/" className="text-3xl font-black tracking-tighter hover:opacity-80 transition-opacity">
              KamiKoto<span className="text-gray-500">.</span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm max-w-xs">
              Redefining the stationery experience with a curated collection of premium tools for the modern creative.
            </p>
          </m.div>

          {/* Contact Info Section */}
          <m.div variants={itemVariants} className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Contact</h4>
            <div className="space-y-4 text-gray-400 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 shrink-0" />
                <p>North Sentinel Island, A&N Islands, India</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-600 shrink-0" />
                <p>1800-6969-6969</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600 shrink-0" />
                <p>hello@kamikoto.com</p>
              </div>
            </div>
          </m.div>

          {/* Quick Links */}
          <m.div variants={itemVariants} className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Company</h4>
            <ul className="space-y-3">
              {['About', 'Privacy Policy', 'Terms of Service', 'Return Policy', 'Shipping Info'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-[1px] bg-white mr-0 group-hover:mr-2 transition-all"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </m.div>

          {/* Legal Notice */}
          <m.div variants={itemVariants} className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Notice</h4>
            <p className="text-xs text-gray-500 leading-relaxed italic">
              KamiKoto is a fictitious entity created for educational purposes. No real products are sold, and no actual transactions occur.
            </p>
          </m.div>
        </div>

        {/* Bottom Bar */}
        <m.div 
          variants={itemVariants}
          className="pt-10 mt-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} KamiKoto. All rights ignored.
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>by</span>
            <a 
              href="https://harshbanker.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              Harsh Banker <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </m.div>
      </div>
    </m.footer>
  );
};

export default Footer;
