import React from 'react';

/**
 * Brand loader: the animated cat, shown on its own with no text.
 * Full screens use a small looping MP4/WebM; inline buttons use a transparent animated WebP
 * so the cat sits cleanly on any button colour (no white box).
 */
const BrandLoader = ({ size = 160, className = '', inline = false }) => {
  if (inline) {
    return (
      <img
        src="/loading-cat-alpha.webp"
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none select-none"
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    );
  }

  return (
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
};

export default BrandLoader;
