
import React, { useEffect, useState } from 'react';

function LoadingBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000; 
    const increment = 100 / (duration / 100); 

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <img
        src="/kamikoto-logo-with-name-tagline-dark-brown-bg.png"
        alt="KamiKoto"
        className="h-16 mb-8 opacity-80"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
          transition: 'opacity 1s ease-in-out',
        }}
      />
      <div className="relative w-2/5 bg-gray-300 rounded-full h-3 overflow-hidden shadow-lg">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-md"
          style={{
            width: `${progress}%`,
            transition: 'width 0.4s ease, background 0.4s ease',
            borderRadius: 'inherit',
          }}
        ></div>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        {progress < 100 ? 'Loading...' : 'Complete'}
      </div>
    </div>
  );
}

export default LoadingBar;
