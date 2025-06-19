import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { m, AnimatePresence } from 'framer-motion';
import { useContentLoader } from '../hooks/useContentLoader';

/**
 * Dynamic Banner Component with Preloaded Data Support
 * 
 * This component displays banner data with optimal performance by using preloaded data.
 * Features:
 * - Uses preloaded banner data for instant display
 * - Falls back to fresh data fetching if preloaded data is unavailable
 * - Displays a slideshow when multiple banners are available
 * - Handles automatic rotation between banners
 * - Provides manual navigation controls
 * - Falls back to default banner when no custom banners are available
 * - Enhanced error handling and loading states
 * 
 * @returns {JSX.Element} The enhanced DynamicBanner component
 */
const DynamicBanner = () => {
  // State for banner data and UI
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoadingFresh, setIsLoadingFresh] = useState(false);
  const [slideshowEnabled, setSlideshowEnabled] = useState(true);

  // Get preloaded data from the content loader
  const { getCachedData, preloadedData } = useContentLoader();

  // Fetch banners on component mount
  useEffect(() => {
    const initializeBanners = async () => {
      try {
        // Try to get preloaded banners first
        const cachedBanners = getCachedData('banners');
        
        if (cachedBanners && cachedBanners.length > 0) {
          console.log('✅ Using preloaded banner data');
          setBanners(cachedBanners);
          setLoading(false);
          
          // Still fetch slideshow settings
          await fetchSlideshowSettings();
          return;
        }
        
        // Fallback: fetch fresh data if preloaded data is not available
        console.log('🔄 Fetching fresh banner data...');
        setIsLoadingFresh(true);
        
        // Get active banners from Firestore
        const bannersQuery = query(
          collection(db, 'banners'),
          where('active', '==', true)
        );
        const bannersSnapshot = await getDocs(bannersQuery);
        
        const bannersData = bannersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort banners by order property
        bannersData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setBanners(bannersData);
        
        // Get slideshow settings
        await fetchSlideshowSettings();
        
        console.log('✅ Fresh banner data loaded');
        
      } catch (error) {
        console.error('❌ Error initializing banners:', error);
        // Set empty array to show default banner
        setBanners([]);
      } finally {
        setLoading(false);
        setIsLoadingFresh(false);
      }
    };
    
    initializeBanners();
  }, [getCachedData]);

  // Monitor preloaded data changes and update banners when available
  useEffect(() => {
    const preloadedBanners = preloadedData?.banners;
    if (preloadedBanners && preloadedBanners.length > 0 && banners.length === 0) {
      console.log('🖼️ Updating with newly preloaded banners');
      setBanners(preloadedBanners);
      setLoading(false);
    }
  }, [preloadedData, banners.length]);

  /**
   * Fetches slideshow settings from Firestore
   */
  const fetchSlideshowSettings = async () => {
    try {
      const settingsCollection = collection(db, 'settings');
      const settingsSnapshot = await getDocs(settingsCollection);
      const settingsData = settingsSnapshot.docs.find(doc => doc.id === 'bannerSettings');
      
      if (settingsData) {
        setSlideshowEnabled(settingsData.data().slideshowEnabled ?? true);
      }
    } catch (error) {
      console.error('⚠️ Error fetching slideshow settings:', error);
      // Keep default enabled state
    }
  };

  // Automatic slideshow timer
  useEffect(() => {
    // Only set up timer if we have multiple banners and slideshow is enabled
    if (banners.length > 1 && slideshowEnabled) {
      const timer = setInterval(() => {
        setTimeout(() => {
          setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
        }, 300);
      }, 5000); // Change banner every 5 seconds
      
      return () => clearInterval(timer);
    }
  }, [banners, slideshowEnabled]);

  /**
   * Handle navigation to the previous banner
   */
  const goToPrevBanner = () => {
    setTimeout(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === 0 ? banners.length - 1 : prevIndex - 1
      );
    }, 300);
  };

  /**
   * Handle navigation to the next banner
   */
  const goToNextBanner = () => {
    setTimeout(() => {
      setCurrentBannerIndex((prevIndex) => 
        (prevIndex + 1) % banners.length
      );
    }, 300);
  };

  // Enhanced loading state with better UX
  if (loading || isLoadingFresh) {
    return (
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-[200px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse mb-6 rounded-lg overflow-hidden relative"
      >
        {/* Loading shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
        
        {/* Loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 px-4 py-2 rounded-full shadow-lg">
            <span className="text-gray-600 text-sm font-medium">
              {isLoadingFresh ? '🔄 Loading banners...' : '🖼️ Preparing banners...'}
            </span>
          </div>
        </div>
      </m.div>
    );
  }

  // If no banners are found, use default banner with enhanced styling
  if (banners.length === 0) {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full mb-6 rounded-lg overflow-hidden shadow-lg"
      >
        <m.img
          src="/banners/3.webp"
          alt="KamiKoto Default Banner"
          className="w-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEI0NTEzIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LYW1pS290bzwvdGV4dD4KICA8dGV4dCB4PSI1MCUiIHk9IjY1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdXIgUHJlbWl1bSBTdGF0aW9uZXJ5IERlc3RpbmF0aW9uPC90ZXh0Pgo8L3N2Zz4K'; // Fallback SVG banner
          }}
        />
        
        {/* Default banner overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Welcome to KamiKoto</h1>
            <p className="text-sm md:text-lg opacity-90">Your Premium Stationery Destination</p>
          </div>
        </div>
      </m.div>
    );
  }

  return (
    <div className="relative w-full mb-6 rounded-lg overflow-hidden shadow-lg">
      {/* Banner Slideshow */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <m.img
            key={currentBannerIndex}
            src={banners[currentBannerIndex].imageUrl}
            alt={`KamiKoto Banner ${currentBannerIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/banners/3.webp'; // Fallback to default banner on error
            }}
          />
        </AnimatePresence>
        
        {/* Navigation Controls (only if there are multiple banners) */}
        {banners.length > 1 && (
          <>
            <m.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrevBanner}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              aria-label="Previous banner"
            >
              <ChevronLeft size={20} />
            </m.button>
            <m.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNextBanner}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              aria-label="Next banner"
            >
              <ChevronRight size={20} />
            </m.button>
            
            {/* Enhanced Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {banners.map((_, index) => (
                <m.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-3 h-3 rounded-full focus:outline-none transition-all duration-200 ${
                    index === currentBannerIndex 
                      ? 'bg-white shadow-lg' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Banner count indicator */}
        {banners.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/30 text-white px-2 py-1 rounded-full text-xs font-medium">
            {currentBannerIndex + 1} / {banners.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicBanner; 