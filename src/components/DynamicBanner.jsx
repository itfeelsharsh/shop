import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { m, AnimatePresence } from 'framer-motion';

/**
 * Dynamic Banner Component
 * 
 * This component fetches banner data from Firestore and displays it on the homepage.
 * Features:
 * - Displays a slideshow when multiple banners are available
 * - Handles automatic rotation between banners
 * - Provides manual navigation controls
 * - Falls back to default banner when no custom banners are available
 * 
 * @returns {JSX.Element} The DynamicBanner component
 */
const DynamicBanner = () => {
  // State for banner data
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slideshowEnabled, setSlideshowEnabled] = useState(true);

  // Fetch banners on component mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
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
        bannersData.sort((a, b) => a.order - b.order);
        setBanners(bannersData);
        
        // Get slideshow setting
        const settingsCollection = collection(db, 'settings');
        const settingsSnapshot = await getDocs(settingsCollection);
        const settingsData = settingsSnapshot.docs.find(doc => doc.id === 'bannerSettings');
        
        if (settingsData) {
          setSlideshowEnabled(settingsData.data().slideshowEnabled ?? true);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanners();
  }, []);

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

  // If no banners are available, use the default banner
  if (loading) {
    return (
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-[200px] bg-gray-200 animate-pulse mb-6 rounded-lg overflow-hidden"
      ></m.div>
    );
  }

  // If no banners are found, use default banner
  if (banners.length === 0) {
    return (
      <m.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        src="/banners/3.webp"
        alt="KamiKoto Banner"
        className="w-full mb-6 mx-auto rounded-lg"
      />
    );
  }

  return (
    <div className="relative w-full mb-6 rounded-lg overflow-hidden">
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
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Previous banner"
            >
              <ChevronLeft size={20} />
            </m.button>
            <m.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNextBanner}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Next banner"
            >
              <ChevronRight size={20} />
            </m.button>
            
            {/* Indicator Dots */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {banners.map((_, index) => (
                <m.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-2 h-2 rounded-full focus:outline-none ${index === currentBannerIndex ? 'bg-white' : 'bg-white/50'}`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DynamicBanner; 