import React from 'react';
import { motion } from 'framer-motion';
import { spinnerVariants, shimmer } from '../utils/animations';

/**
 * Discord-like loading screen with animated logo, spinner, progress indicator, and custom message
 * 
 * @param {Object} props Component properties
 * @param {string} props.message - Custom loading message to display (defaults to "Loading awesome things...")
 * @param {number} props.progress - Current loading progress (0-100) - when provided, shows determinate progress
 * @param {string} props.logoSrc - Path to the logo image to display
 * @param {string} props.backgroundColor - Background color of the loading screen
 * @param {boolean} props.showTips - Whether to show loading tips
 * @param {boolean} props.fullScreen - Whether to display as fullscreen overlay or inline
 * @returns {JSX.Element} The loading screen component
 */
const LoadingScreen = ({ 
  message = "Loading awesome things...", 
  progress = null,
  logoSrc = "/logo192.png",
  backgroundColor = "#8B4513",
  showTips = true,
  fullScreen = true
}) => {
  // Loading tips that rotate during loading
  const loadingTips = [
    "Arranging stationery in perfect order...",
    "Sharpening pencils to perfection...",
    "Brewing ink for your next masterpiece...",
    "Organizing notebooks by color...",
    "Aligning paper to exact measurements...",
    "Testing pens for optimal flow..."
  ];
  
  // Randomly select a tip
  const randomTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        flex flex-col items-center justify-center
        ${fullScreen ? 'fixed inset-0 z-50 loading-screen' : 'p-8'}
      `}
      style={fullScreen ? { backgroundColor } : {}}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{
          scale: [0.8, 1, 0.8],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="mb-6"
      >
        <img 
          src={logoSrc} 
          alt="Logo" 
          className="w-24 h-24 drop-shadow-lg" 
        />
      </motion.div>
      
      {/* Spinner from original Loading component */}
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className="relative mb-4"
      >
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-white/20" />
        
        {/* Spinning segment */}
        <motion.div className="absolute top-0 left-0 w-16 h-16">
          <div className="w-4 h-4 rounded-full bg-white shadow-lg" />
        </motion.div>
      </motion.div>

      {/* Main loading text with dots animation */}
      <div className="mt-2 mb-4 relative overflow-hidden">
        <motion.div
          className="text-xl font-medium text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message.split('...')[0]}
          <motion.span
            animate={{
              opacity: [0, 1, 0],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop"
              }
            }}
          >
            ...
          </motion.span>
        </motion.div>
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          variants={shimmer}
          initial="hidden"
          animate="visible"
        >
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </motion.div>
      </div>
      
      {/* Loading tips */}
      {showTips && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-white/70 mb-6 text-center max-w-md px-4"
        >
          {randomTip}
        </motion.div>
      )}
      
      {/* Progress bar container */}
      <motion.div
        className="w-64 h-2 bg-white/20 rounded-full overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Animated progress bar */}
        {progress !== null ? (
          /* Determinate progress bar */
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              variants={shimmer}
              initial="hidden"
              animate="visible"
            >
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </motion.div>
          </motion.div>
        ) : (
          /* Indeterminate progress bar */
          <motion.div
            className="h-full bg-white rounded-full"
            animate={{
              x: [-256, 0],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              variants={shimmer}
              initial="hidden"
              animate="visible"
            >
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Progress percentage */}
      {progress !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/80 text-sm mt-2"
        >
          {Math.round(progress)}%
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoadingScreen; 