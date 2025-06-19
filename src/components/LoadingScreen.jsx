import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spinnerVariants, shimmer } from '../utils/animations';

/**
 * Comprehensive loading screen with detailed progress tracking
 * Shows loading status for different content types (banners, products, images, auth)
 * and provides real-time feedback on loading progress
 * 
 * @param {Object} props Component properties
 * @param {string} props.message - Custom loading message to display
 * @param {number} props.progress - Current loading progress (0-100)
 * @param {string} props.logoSrc - Path to the logo image to display
 * @param {string} props.backgroundColor - Background color of the loading screen
 * @param {boolean} props.showTips - Whether to show loading tips
 * @param {boolean} props.fullScreen - Whether to display as fullscreen overlay or inline
 * @param {Object} props.loadingStates - Object containing loading states for different content types
 * @param {Array} props.errors - Array of error messages during loading
 * @returns {JSX.Element} The enhanced loading screen component
 */
const LoadingScreen = ({ 
  message = "Loading awesome things...", 
  progress = null,
  logoSrc = "/logo192.png",
  backgroundColor = "#8B4513",
  showTips = true,
  fullScreen = true,
  loadingStates = {},
  errors = []
}) => {
  // Enhanced loading tips with more variety
  const loadingTips = [
    "🎨 Arranging stationery in perfect order...",
    "✏️ Sharpening pencils to perfection...",
    "🖋️ Brewing ink for your next masterpiece...",
    "📚 Organizing notebooks by color...",
    "📐 Aligning paper to exact measurements...",
    "🖊️ Testing pens for optimal flow...",
    "🎯 Preparing your personalized experience...",
    "🚀 Loading premium quality products...",
    "💫 Creating the perfect shopping atmosphere...",
    "🌟 Optimizing everything for you..."
  ];
  
  // State for rotating tips
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // Rotate tips every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % loadingTips.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [loadingTips.length]);

  /**
   * Gets a user-friendly label for each loading state
   * @param {string} key - The loading state key
   * @returns {string} User-friendly label
   */
  const getLoadingStateLabel = (key) => {
    const labels = {
      banners: '🖼️ Loading banners',
      products: '📦 Loading products', 
      images: '🌅 Optimizing images',
      auth: '🔐 Initializing security'
    };
    return labels[key] || `Loading ${key}`;
  };

  /**
   * Gets loading state icon based on completion
   * @param {boolean} isLoading - Whether this state is still loading
   * @returns {string} Icon to display
   */
  const getLoadingStateIcon = (isLoading) => {
    return isLoading ? '⏳' : '✅';
  };

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
      {/* Logo with enhanced animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [0.8, 1.1, 0.9, 1],
          opacity: 1,
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="mb-8"
      >
        <img 
          src={logoSrc} 
          alt="KamiKoto Logo" 
          className="w-32 h-32 drop-shadow-2xl rounded-lg" 
        />
      </motion.div>
      
      {/* Enhanced spinner */}
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className="relative mb-6"
      >
        {/* Outer ring with gradient */}
        <div className="w-16 h-16 rounded-full border-4 border-white/20" />
        
        {/* Spinning segment with glow effect */}
        <motion.div className="absolute top-0 left-0 w-16 h-16">
          <div className="w-4 h-4 rounded-full bg-white shadow-lg shadow-white/50" />
        </motion.div>
      </motion.div>

      {/* Main loading text with enhanced animation */}
      <div className="mt-2 mb-6 relative overflow-hidden">
        <motion.div
          className="text-2xl font-bold text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message.split('...')[0]}
          <motion.span
            animate={{
              opacity: [0, 1, 0],
              transition: {
                duration: 1.2,
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
      
      {/* Detailed loading states */}
      {Object.keys(loadingStates).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 space-y-2"
        >
          <AnimatePresence mode="wait">
            {Object.entries(loadingStates).map(([key, isLoading], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 text-sm ${
                  isLoading ? 'text-white/80' : 'text-green-200'
                }`}
              >
                <span className="text-lg">
                  {getLoadingStateIcon(isLoading)}
                </span>
                <span className="font-medium">
                  {getLoadingStateLabel(key)}
                </span>
                {isLoading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      
      {/* Enhanced progress bar */}
      <motion.div
        className="w-80 h-3 bg-white/20 rounded-full overflow-hidden shadow-inner"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {progress !== null ? (
          /* Determinate progress bar with gradient */
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full relative overflow-hidden"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Moving shimmer effect */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              animate={{
                x: ['-100%', '100%'],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </motion.div>
          </motion.div>
        ) : (
          /* Indeterminate progress bar with enhanced animation */
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            animate={{
              x: [-320, 0],
              transition: {
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
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
      
      {/* Progress percentage with enhanced styling */}
      {progress !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white font-bold text-lg mt-3 drop-shadow-lg"
        >
          {Math.round(progress)}%
        </motion.div>
      )}

      {/* Rotating loading tips */}
      {showTips && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center max-w-md px-4 mt-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTipIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-sm text-white/80 font-medium"
            >
              {loadingTips[currentTipIndex]}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Error display */}
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <div className="text-yellow-200 text-xs font-medium">
            ⚠️ Some content may load asynchronously
          </div>
        </motion.div>
      )}

      {/* Development helper */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="fixed bottom-4 right-4 text-xs text-white/50 bg-black/20 px-2 py-1 rounded"
        >
          Press Ctrl+Shift+L to skip loading
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoadingScreen; 