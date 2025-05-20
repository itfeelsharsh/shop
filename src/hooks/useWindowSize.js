import { useState, useEffect } from 'react';

/**
 * Custom hook to track window dimensions
 * Used for responsive components and effects like confetti
 * 
 * @returns {Object} Object containing current window width and height
 */
function useWindowSize() {
  // Initialize with default values to avoid null
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Only add listener if window exists (for SSR compatibility)
    if (typeof window === 'undefined') {
      return;
    }

    /**
     * Handler to call on window resize
     */
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures effect is only run on mount and unmount

  return windowSize;
}

export default useWindowSize; 