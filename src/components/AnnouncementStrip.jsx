import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Bell, X } from 'react-feather';

/**
 * Announcement Strip Component
 * 
 * This component displays announcements in a strip below the navbar
 * Features:
 * - Fetches active announcements from Firestore
 * - Displays announcements with links if provided
 * - Allows dismissing individual announcements
 * - Auto-rotates between multiple announcements if available
 * - Handles missing index errors with fallback query
 * - Text is centered in the announcement strip
 * 
 * @returns {JSX.Element} The AnnouncementStrip component or null if no announcements
 */
const AnnouncementStrip = () => {
  // State for announcement data
  const [announcements, setAnnouncements] = useState([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnnouncementEnabled, setIsAnnouncementEnabled] = useState(true);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(() => {
    // Load dismissed announcements from localStorage
    const saved = localStorage.getItem('dismissedAnnouncements');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter out dismissed announcements
  const activeAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.includes(announcement.id)
  );

  // Fetch announcements on component mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Get announcement settings
        const settingsCollection = collection(db, 'settings');
        const settingsSnapshot = await getDocs(settingsCollection);
        const settingsData = settingsSnapshot.docs.find(doc => doc.id === 'announcementSettings');
        
        if (settingsData) {
          const isEnabled = settingsData.data().enabled ?? true;
          setIsAnnouncementEnabled(isEnabled);
          
          // If announcements are disabled globally, don't fetch them
          if (!isEnabled) {
            setLoading(false);
            return;
          }
        }
        
        // Try first with the ordered query (requires composite index)
        try {
          const announcementsQuery = query(
            collection(db, 'announcements'),
            where('active', '==', true),
            orderBy('priority', 'desc')
          );
          
          const announcementsSnapshot = await getDocs(announcementsQuery);
          const announcementsData = announcementsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setAnnouncements(announcementsData);
        } catch (indexError) {
          // If index error occurs, use fallback query without ordering
          console.log('Missing index for announcements query, using fallback query');
          const fallbackQuery = query(
            collection(db, 'announcements'),
            where('active', '==', true)
          );
          
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const fallbackData = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sort in memory instead (not as efficient but works without index)
          const sortedData = fallbackData.sort((a, b) => 
            (b.priority || 0) - (a.priority || 0)
          );
          
          setAnnouncements(sortedData);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, []);

  // Automatic rotation between announcements
  useEffect(() => {
    if (activeAnnouncements.length > 1) {
      const timer = setInterval(() => {
        setCurrentAnnouncementIndex((prevIndex) => 
          (prevIndex + 1) % activeAnnouncements.length
        );
      }, 7000); // Change announcement every 7 seconds
      
      // Clean up interval on component unmount
      return () => clearInterval(timer);
    }
  }, [activeAnnouncements]);

  /**
   * Dismisses an announcement by adding it to the dismissed list
   * @param {string} id - ID of the announcement to dismiss
   */
  const dismissAnnouncement = (id) => {
    try {
      const newDismissed = [...dismissedAnnouncements, id];
      setDismissedAnnouncements(newDismissed);
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
      
      // If we just dismissed the current announcement, update the index if needed
      if (activeAnnouncements.length > 1 && 
          id === activeAnnouncements[currentAnnouncementIndex]?.id) {
        if (currentAnnouncementIndex >= activeAnnouncements.length - 1) {
          setCurrentAnnouncementIndex(0);
        }
      }
    } catch (error) {
      console.error('Error dismissing announcement:', error);
      // Fail gracefully - if localStorage fails, continue without saving dismissed state
    }
  };

  // Don't render anything if loading, announcements are disabled, or all have been dismissed
  if (loading || !isAnnouncementEnabled || activeAnnouncements.length === 0) {
    return null;
  }

  // Get the current announcement to display
  const currentAnnouncement = activeAnnouncements[
    currentAnnouncementIndex % activeAnnouncements.length
  ];

  return (
    <div
      className="w-full py-2 px-3 md:px-4 shadow-sm transition-all"
      style={{ 
        backgroundColor: currentAnnouncement.backgroundColor || '#E5F6FD',
        color: currentAnnouncement.textColor || '#1E88E5'
      }}
      data-testid="announcement-strip"
    >
      <div className="container mx-auto flex items-center justify-center relative">
        {/* Bell icon and announcement text centered */}
        <div className="flex items-center justify-center flex-grow">
          {/* Responsive bell icon size */}
          <Bell size={16} className="mr-2 flex-shrink-0 md:mr-3" />
          {/* Main announcement text container */}
          <div className="flex items-center text-sm text-center">
            {/* Announcement text */}
            <span>{currentAnnouncement.text}</span>
            
            {/* Optional link - added truncate for long link text */}
            {currentAnnouncement.link && currentAnnouncement.linkText && (
              <a 
                href={currentAnnouncement.link}
                target="_blank"
                rel="noopener noreferrer"
                // Added truncate and slightly smaller text for link on mobile
                className="ml-2 font-medium underline hover:opacity-80 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-xs"
                aria-label={`Learn more about: ${currentAnnouncement.linkText}`}
              >
                {currentAnnouncement.linkText}
              </a>
            )}
            
            {/* Indicator dots for multiple announcements */}
            {activeAnnouncements.length > 1 && (
              <div className="ml-3 flex space-x-1" aria-hidden="true">
                {activeAnnouncements.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentAnnouncementIndex 
                        ? 'bg-current' 
                        : 'bg-current opacity-30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Dismiss button positioned absolutely to maintain centering */}
        {/* Increased padding and icon size for better tap target on mobile */}
        <button
          onClick={() => dismissAnnouncement(currentAnnouncement.id)}
          className="p-1.5 sm:p-1 absolute right-0 sm:right-1 md:right-0 rounded-full hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-current"
          aria-label="Dismiss announcement"
        >
          <X size={16} /> {/* Increased icon size slightly from 14 to 16 */}
        </button>
      </div>
    </div>
  );
};

export default AnnouncementStrip; 