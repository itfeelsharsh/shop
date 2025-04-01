import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to the top of the page when navigating
 * between different routes in the application.
 * 
 * This component doesn't render anything visible - it just performs the scroll action.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top with smooth animation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop; 