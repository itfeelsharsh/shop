import React from 'react';
import { m } from "framer-motion";

const LoadingBar = ({ progress = 0, isIndeterminate = false }) => {
  // Animation variants for the loading bar
  const barVariants = {
    initial: { 
      scaleX: 0,
      opacity: 0 
    },
    animate: { 
      scaleX: isIndeterminate ? [0, 1, 1] : progress / 100,
      opacity: 1,
      transition: {
        duration: isIndeterminate ? 1.5 : 0.5,
        ease: isIndeterminate ? [0.4, 0, 0.2, 1] : "easeInOut",
        repeat: isIndeterminate ? Infinity : 0,
        repeatType: "loop"
      }
    }
  };

  // Animation variants for the loading pulse
  const pulseVariants = {
    initial: {
      opacity: 0.3
    },
    animate: {
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  // Animation variants for the shimmer effect
  const shimmerVariants = {
    initial: {
      x: "-100%"
    },
    animate: {
      x: "100%",
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 1.5,
        ease: "linear"
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Background track */}
      <m.div
        className="h-2 bg-gray-200 rounded-full overflow-hidden"
        variants={pulseVariants}
        initial="initial"
        animate="animate"
      >
        {/* Progress bar */}
        <m.div
          className="h-full bg-blue-600 rounded-full relative"
          variants={barVariants}
          initial="initial"
          animate="animate"
        >
          {/* Shimmer effect */}
          <m.div
            className="absolute inset-0 w-full h-full"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          >
            <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </m.div>
        </m.div>
      </m.div>

      {/* Progress percentage */}
      {!isIndeterminate && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-4 text-sm text-gray-600"
        >
          {Math.round(progress)}%
        </m.div>
      )}

      {/* Loading text for indeterminate state */}
      {isIndeterminate && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute left-0 top-4 text-sm text-gray-600"
        >
          Loading...
        </m.div>
      )}
    </div>
  );
};

export default LoadingBar;
