import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <motion.footer
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="bg-gradient-to-b from-gray-800 to-gray-900 text-white py-12"
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
          variants={containerVariants}
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="text-center md:text-left">
            <motion.h3 
              className="text-2xl font-bold mb-4"
              whileHover={{ scale: 1.05 }}
            >
              KamiKoto
            </motion.h3>
            <motion.p 
              className="text-gray-400"
              variants={itemVariants}
            >
              Crafting exceptional shopping experiences for our valued customers.
            </motion.p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <motion.li 
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
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Notice */}
          <motion.div variants={itemVariants} className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-4">Legal Notice</h4>
            <motion.div 
              className="space-y-2 text-gray-400"
              variants={itemVariants}
            >
              <p className="text-sm">
                DISCLAIMER: This website is not a commercial enterprise. KamiKoto is a fictitious entity created solely for educational and skill development purposes. No real products are sold, and no actual transactions occur herein. Any resemblance to real businesses, products, or services is purely coincidental.
              </p>
             
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          variants={itemVariants}
          className="pt-8 mt-8 border-t border-gray-700 text-center text-gray-400"
        >
          <p>© {new Date().getFullYear()} KamiKoto. No rights reserved.</p>
          <motion.div 
            className="mt-4 text-sm"
            variants={itemVariants}
          >
            <span>Made with </span>
            <motion.span
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
            </motion.span>
            <span> by <a href="https://harshbanker.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Harsh Banker</a></span>
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
