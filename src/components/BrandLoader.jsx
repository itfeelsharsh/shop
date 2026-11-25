import React from 'react';

/**
 * Brand loader: the animated cat, shown on its own with no text.
 * Encoded as a small looping MP4/WebM (about 240 KB) instead of the original 2.6 MB GIF.
 */
const BrandLoader = ({ size = 160, className = '' }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`flex items-center justify-center ${className}`}
  >
    <video
      width={size}
      height={size}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      className="pointer-events-none select-none"
      style={{ width: size, height: size }}
    >
      <source src="/loading-cat.mp4" type="video/mp4" />
      <source src="/loading-cat.webm" type="video/webm" />
    </video>
  </div>
);

export default BrandLoader;
