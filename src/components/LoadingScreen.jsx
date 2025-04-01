import React from 'react';
import { motion } from 'framer-motion';
import { shimmer } from '../utils/animations';

/**
 * Discord-like loading screen with animated logo, progress indicator, and custom message
 * 
 * @param {Object} props Component properties
 * @param {string} props.message - Custom loading message to display (defaults to "Loading awesome things...")
 * @param {number} props.progress - Current loading progress (0-100) - when provided, shows determinate progress
 * @param {string} props.logoSrc - Path to the logo image to display
 * @param {string} props.backgroundColor - Background color of the loading screen
 * @param {boolean} props.showTips - Whether to show loading tips
 * @returns {JSX.Element} The loading screen component
 */
const LoadingScreen = ({ 
  message = "Loading awesome things...", 
  progress = null,
  logoSrc = "/logo192.png",
  backgroundColor = "#8B4513",
  showTips = true
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
  
  // Animation for the pulsing logo
  const logoAnimation = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: {
      scale: [0.8, 1, 0.8],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };
  
  // Animation for the loading bar
  const barAnimation = {
    initial: { width: "0%" },
    animate: progress !== null 
      ? { width: `${progress}%`, transition: { duration: 0.5, ease: "easeOut" }}
      : {
          width: ["0%", "100%"],
          transition: {
            duration: 2,
            ease: [0.4, 0, 0.2, 1],
            repeat: Infinity
          }
        }
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundColor }}
    >
      {/* Logo */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={logoAnimation}
        className="mb-8"
      >
        <img 
          src={logoSrc} 
          alt="Logo" 
          className="w-32 h-32 drop-shadow-lg" 
        />
      </motion.div>
      
      {/* Main loading message */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-6 text-center"
      >
        {message}
      </motion.h2>
      
      {/* Loading tips */}
      {showTips && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-white/70 mb-8 text-center max-w-md px-4"
        >
          {randomTip}
        </motion.div>
      )}
      
      {/* Loading bar container */}
      <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mb-4">
        {/* Animated loading bar */}
        <motion.div
          className="h-full bg-white rounded-full relative"
          initial="initial"
          animate="animate"
          variants={barAnimation}
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
      </div>
      
      {/* Progress percentage */}
      {progress !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/80 text-sm"
        >
          {Math.round(progress)}%
        </motion.div>
      )}
    </div>
  );
};

export default LoadingScreen; 