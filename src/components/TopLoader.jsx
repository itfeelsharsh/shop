import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * TopLoader component provides a cinematic "thicc" loading bar at the top of the page.
 * It triggers on route changes and includes a deliberate delay to ensure the user
 * perceives the transition, consistent with "Peak 2020" premium design.
 */
const TopLoader = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Trigger loading on route change
    setLoading(true);
    
    // Deliberate delay for cinematic feel (Peak 2020)
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1200); // 1.2s delay for that premium "weighty" feel

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] h-[5px] bg-white shadow-sm"
        >
          {/* Main Progress Bar */}
          <m.div
            initial={{ width: "0%" }}
            animate={{ 
              width: ["0%", "30%", "70%", "90%"],
            }}
            transition={{ 
              duration: 1.5,
              times: [0, 0.2, 0.6, 1],
              ease: "easeInOut"
            }}
            className="h-full bg-gray-900"
          />
          
          {/* Shimmer Effect */}
          <m.div
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full"
          />
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default TopLoader;
