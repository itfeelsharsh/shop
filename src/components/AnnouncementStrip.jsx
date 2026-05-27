import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

/**
 * World-Class Infinite Scrolling Announcement Strip
 * 
 * Features:
 * - Dynamically loaded from Firestore announcements database.
 * - Sorts by priority; applies color styling from the top-priority active item.
 * - Restricts rendering STRICTLY to the Home Page ('/').
 * - Renders a perfectly seamless, hardware-accelerated CSS infinite marquee.
 * - Auto-duplicates items to ensure viewport-width coverage on all screen sizes.
 */
const AnnouncementStrip = () => {
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnnouncementEnabled, setIsAnnouncementEnabled] = useState(true);

  // Filter and sort active announcements
  const activeAnnouncements = useMemo(() => {
    return announcements
      .filter(ann => ann.active)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [announcements]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Fetch Settings doc to check if enabled
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
        
        // Fetch Announcements from Firestore
        const announcementsCollection = collection(db, 'announcements');
        const snapshot = await getDocs(announcementsCollection);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Only render on Home Page
  if (location.pathname !== '/') return null;

  // Don't render if disabled, loading, or empty
  if (loading || !isAnnouncementEnabled || activeAnnouncements.length === 0) return null;

  // Derive styling from highest priority announcement
  const primaryAnn = activeAnnouncements[0];
  const barBgColor = primaryAnn.backgroundColor || '#111827';
  const barTextColor = primaryAnn.textColor || '#FFFFFF';

  // Build the repeated list of announcements to ensure infinite continuous track
  let repeatedItems = [];
  const targetCount = 6;
  const repeatFactor = Math.ceil(targetCount / activeAnnouncements.length);
  for (let i = 0; i < repeatFactor; i++) {
    repeatedItems = [...repeatedItems, ...activeAnnouncements];
  }

  // Pure hardware-accelerated marquee keyframes to prevent browser lags
  const marqueeKeyframes = `
    @keyframes marquee-scroll {
      0% {
        transform: translate3d(0, 0, 0);
      }
      100% {
        transform: translate3d(-100%, 0, 0);
      }
    }
    .animate-marquee-track {
      display: flex;
      white-space: nowrap;
      animation: marquee-scroll 32s linear infinite;
    }
    .animate-marquee-track:hover {
      animation-play-state: paused;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: marqueeKeyframes }} />
      <div
        className="w-full flex items-center overflow-hidden relative z-[60] border-b border-black/5 select-none pwa-announcement-padding"
        style={{
          backgroundColor: barBgColor,
          color: barTextColor,
        }}
        data-testid="announcement-strip"
      >
        <div className="relative flex overflow-x-hidden w-full">
          {/* Track 1 */}
          <div className="animate-marquee-track flex shrink-0">
            {repeatedItems.map((ann, idx) => (
              <div
                key={`t1-${idx}`}
                className="inline-flex items-center px-12 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
              >
                <span>{ann.text}</span>
                {ann.link && (
                  <a
                    href={ann.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 font-black underline underline-offset-4 hover:opacity-75 transition-opacity inline-flex items-center gap-0.5"
                    style={{ color: barTextColor }}
                  >
                    {ann.linkText || 'View Details'}
                    <ArrowRight size={10} className="inline-block flex-shrink-0" />
                  </a>
                )}
                {/* Custom Branded Separator Emblem */}
                <span className="ml-12 text-red-500 font-black">✦</span>
              </div>
            ))}
          </div>

          {/* Track 2 (for seamless looping wrapper) */}
          <div className="animate-marquee-track flex shrink-0" aria-hidden="true">
            {repeatedItems.map((ann, idx) => (
              <div
                key={`t2-${idx}`}
                className="inline-flex items-center px-12 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
              >
                <span>{ann.text}</span>
                {ann.link && (
                  <a
                    href={ann.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 font-black underline underline-offset-4 hover:opacity-75 transition-opacity inline-flex items-center gap-0.5"
                    style={{ color: barTextColor }}
                  >
                    {ann.linkText || 'View Details'}
                    <ArrowRight size={10} className="inline-block flex-shrink-0" />
                  </a>
                )}
                {/* Custom Branded Separator Emblem */}
                <span className="ml-12 text-red-500 font-black">✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementStrip;