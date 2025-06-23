import React from 'react';
import { motion } from 'framer-motion';

/**
 * Professional minimal loading screen with only a spinning wheel
 * Clean and distraction-free loading experience
 * 
 * @param {Object} props Component properties
 * @param {string} props.backgroundColor - Background color of the loading screen
 * @param {boolean} props.fullScreen - Whether to display as fullscreen overlay or inline
 * @returns {JSX.Element} The minimal professional loading screen component
 */
const LoadingScreen = ({ 
  backgroundColor = "#ffffff",
  fullScreen = true
}) => {
  // Professional spinner animation variants
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        flex items-center justify-center
        ${fullScreen ? 'fixed inset-0 z-50' : 'p-8'}
      `}
      style={fullScreen ? { backgroundColor } : {}}
    >
      {/* Professional spinning wheel - clean and minimal */}
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className="relative"
      >
        {/* Outer ring with subtle styling */}
        <div className="w-12 h-12 rounded-full border-2 border-gray-200" />
        
        {/* Spinning segment - professional blue accent */}
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-transparent border-t-blue-600" />
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen; 