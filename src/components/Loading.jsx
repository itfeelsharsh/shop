import React from 'react';
import { motion } from 'framer-motion';
import { spinnerVariants, shimmer } from '../utils/animations';

const Loading = ({ fullScreen = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        flex flex-col items-center justify-center
        ${fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : 'p-8'}
      `}
    >
      {/* Spinner */}
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className="relative"
      >
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-blue-100" />
        
        {/* Spinning segment */}
        <motion.div
          className="absolute top-0 left-0 w-16 h-16"
        >
          <div className="w-4 h-4 rounded-full bg-blue-600 shadow-lg" />
        </motion.div>
      </motion.div>

      {/* Loading text with shimmer effect */}
      <div className="mt-4 relative overflow-hidden">
        <motion.div
          className="text-lg font-medium text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading
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

      {/* Progress bar */}
      <motion.div
        className="mt-4 w-48 h-1 bg-gray-200 rounded-full overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          animate={{
            x: [-192, 0],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Loading; 