import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Bell, X, ArrowRight } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

const AnnouncementStrip = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnnouncementEnabled, setIsAnnouncementEnabled] = useState(true);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(() => {
    const saved = localStorage.getItem('dismissedAnnouncements');
    return saved ? JSON.parse(saved) : [];
  });

  const activeAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.includes(announcement.id)
  );

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const settingsCollection = collection(db, 'settings');
        const settingsSnapshot = await getDocs(settingsCollection);
        const settingsData = settingsSnapshot.docs.find(doc => doc.id === 'announcementSettings');
        
        if (settingsData) {
          const isEnabled = settingsData.data().enabled ?? true;
          setIsAnnouncementEnabled(isEnabled);
          if (!isEnabled) {
            setLoading(false);
            return;
          }
        }
        
        try {
          const announcementsQuery = query(
            collection(db, 'announcements'),
            where('active', '==', true),
            orderBy('priority', 'desc')
          );
          const announcementsSnapshot = await getDocs(announcementsQuery);
          setAnnouncements(announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (indexError) {
          const fallbackQuery = query(collection(db, 'announcements'), where('active', '==', true));
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const sortedData = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (b.priority || 0) - (a.priority || 0));
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

  useEffect(() => {
    if (activeAnnouncements.length > 1) {
      const timer = setInterval(() => {
        setCurrentAnnouncementIndex((prevIndex) => (prevIndex + 1) % activeAnnouncements.length);
      }, 7000);
      return () => clearInterval(timer);
    }
  }, [activeAnnouncements]);

  const dismissAnnouncement = (id) => {
    try {
      const newDismissed = [...dismissedAnnouncements, id];
      setDismissedAnnouncements(newDismissed);
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
      if (activeAnnouncements.length > 1 && id === activeAnnouncements[currentAnnouncementIndex]?.id) {
        if (currentAnnouncementIndex >= activeAnnouncements.length - 1) {
          setCurrentAnnouncementIndex(0);
        }
      }
    } catch (error) {
      console.error('Error dismissing announcement:', error);
    }
  };

  if (loading || !isAnnouncementEnabled || activeAnnouncements.length === 0) return null;

  const currentAnnouncement = activeAnnouncements[currentAnnouncementIndex % activeAnnouncements.length];

  return (
    <div
      className="w-full h-10 border-b border-gray-100 flex items-center overflow-hidden bg-white"
      data-testid="announcement-strip"
    >
      <div className="container mx-auto px-4 flex items-center justify-between relative h-full">
        <div className="flex items-center gap-3 overflow-hidden flex-grow justify-center">
          <Bell size={14} className="text-gray-400 shrink-0" />
          
          <div className="relative flex-grow h-full max-w-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <m.div
                key={currentAnnouncement.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex items-center justify-center gap-2 text-xs md:text-sm font-medium"
                style={{ color: currentAnnouncement.textColor || '#111827' }}
              >
                <span className="truncate">{currentAnnouncement.text}</span>
                {currentAnnouncement.link && currentAnnouncement.linkText && (
                  <a 
                    href={currentAnnouncement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 underline underline-offset-4 hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    {currentAnnouncement.linkText}
                    <ArrowRight size={12} />
                  </a>
                )}
              </m.div>
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => dismissAnnouncement(currentAnnouncement.id)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors ml-4"
          aria-label="Dismiss announcement"
        >
          <X size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementStrip;