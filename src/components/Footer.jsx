import React from 'react';
import { Link } from 'react-router-dom';
import { m } from "framer-motion";
import { useInView } from 'react-intersection-observer';

const Footer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Container animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0,
      y: 50
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <m.footer
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="bg-gradient-to-b from-gray-800 to-gray-900 text-white py-12 hidden md:block"
    >
      <div className="container mx-auto px-4">
        <m.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
          variants={containerVariants}
        >
          {/* Brand Section */}
          <m.div variants={itemVariants} className="text-center md:text-left">
            <m.h3 
              className="text-2xl font-bold mb-4"
              whileHover={{ scale: 1.05 }}
            >
              KamiKoto
            </m.h3>
            <m.p 
              className="text-gray-400"
              variants={itemVariants}
            >
              Crafting exceptional shopping experiences for our valued customers.
            </m.p>
          </m.div>

          {/* Contact Info Section */}
          <m.div variants={itemVariants} className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <m.div 
              className="space-y-2 text-gray-400"
              variants={itemVariants}
            >
              {/* Location with icon */}
              <p className="flex items-center justify-center md:justify-start">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
                North Sentinel Island, A&N Islands, India
              </p>
              
              {/* Phone with icon */}
              <p className="flex items-center justify-center md:justify-start">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
                1800-6969-6969
              </p>
              
              {/* Email with icon */}
              <p className="flex items-center justify-center md:justify-start">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                please.help.me@kamikoto.nsi
              </p>
            </m.div>
          </m.div>

          {/* Quick Links */}
          <m.div variants={itemVariants} className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About', 'Privacy Policy', 'Terms of Service', 'Return Policy', 'Shipping Info'].map((item) => (
                <m.li 
                  key={item}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                >
                  <Link 
                    to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </m.li>
              ))}
            </ul>
          </m.div>

          {/* Legal Notice */}
          <m.div variants={itemVariants} className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-4">Legal Notice</h4>
            <m.div 
              className="space-y-2 text-gray-400"
              variants={itemVariants}
            >
              <p className="text-sm">
                DISCLAIMER: This website is not a commercial enterprise. KamiKoto is a fictitious entity created solely for educational and skill development purposes. No real products are sold, and no actual transactions occur herein. Any resemblance to real businesses, products, or services is purely coincidental.
              </p>
             
            </m.div>
          </m.div>
        </m.div>

        {/* Bottom Bar */}
        <m.div 
          variants={itemVariants}
          className="pt-8 mt-8 border-t border-gray-700 text-center text-gray-400"
        >
          <p>© {new Date().getFullYear()} KamiKoto. No rights reserved.</p>
          <m.div 
            className="mt-4 text-sm"
            variants={itemVariants}
          >
            <span>Made with </span>
            <m.span
              animate={{
                scale: [1, 1.2, 1],
                color: ['#fff', '#ff6b6b', '#fff']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              ❤️ 
            </m.span>
            <span> by <a href="https://harshbanker.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Harsh Banker</a></span>
          </m.div>
        </m.div>
      </div>
    </m.footer>
  );
};

export default Footer;
