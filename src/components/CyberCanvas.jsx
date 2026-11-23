import React, { useEffect, useRef } from 'react';

const SHAPE_PATH_DATA = [
  'M231,352l445-156L600,0L452,54L331,3L0,48L231,352',
  'M0,0l64,219L29,343l535,30L478,37l-133,4L0,0z',
  'M0,65l16,138l96,107l270-2L470,0L337,4L0,65z',
  'M333,0L0,94l64,219L29,437l570-151l-196-42L333,0',
  'M331.9,3.6l-331,45l231,304l445-156l-76-196l-148,54L331.9,3.6z',
  'M389,352l92-113l195-43l0,0l0,0L445,48l-80,1L122.7,0L0,275.2L162,297L389,352',
  'M 50 100 L 300 150 L 550 50 L 750 300 L 500 250 L 300 450 L 50 100',
  'M 700 350 L 500 350 L 700 500 L 400 400 L 200 450 L 250 350 L 100 300 L 150 50 L 350 100 L 250 150 L 450 150 L 400 50 L 550 150 L 350 250 L 650 150 L 650 50 L 700 150 L 600 250 L 750 250 L 650 300 L 700 350 '
];

/**
 * CyberCanvas: Pure HTML5 Canvas replicating the Paper.js ambient
 * wireframe geometric shapes field from the Connor Hubeny inspiration.
 */
export default function CyberCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create Path2D objects
    const pathObjects = SHAPE_PATH_DATA.map((d) => {
      try {
        return new Path2D(d);
      } catch (err) {
        return null;
      }
    });

    // Positions relative to canvas size
    const getPositions = (w, h) => {
      const midX = w / 2;
      const midY = h / 2;
      return [
        { x: (midX - 50) + (midX / 2), y: 150 },
        { x: 180, y: midY },
        { x: w - 140, y: h - 100 },
        { x: 50, y: midY + 120 },
        { x: (midX / 2) + 80, y: 110 },
        { x: midX + 90, y: h - 70 },
        { x: w - 80, y: midY - 60 },
        { x: midX + 110, y: midY + 90 },
      ];
    };

    let positions = getPositions(width, height);
    const angles = new Array(SHAPE_PATH_DATA.length).fill(0);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      positions = getPositions(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const strokeColors = [
        'rgba(211, 47, 47, 0.22)',
        'rgba(255, 82, 82, 0.18)',
        'rgba(255, 119, 113, 0.2)',
        'rgba(211, 47, 47, 0.16)',
        'rgba(255, 160, 0, 0.15)',
        'rgba(255, 82, 82, 0.2)',
        'rgba(211, 47, 47, 0.18)',
        'rgba(255, 119, 113, 0.22)'
      ];

      for (let i = 0; i < pathObjects.length; i++) {
        const path = pathObjects[i];
        if (!path) continue;

        // Hide certain shapes on small screens for visual clarity
        if (width < 768 && (i === 2 || i === 3 || i === 5)) {
          continue;
        }

        const pos = positions[i] || { x: width / 2, y: height / 2 };
        angles[i] += (i % 2 === 0 ? -0.0018 : 0.0018);

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angles[i]);
        // Scale to approximate the original 1.4-1.8x sizing
        const scale = width < 768 ? 0.9 : 1.4;
        ctx.scale(scale, scale);
        // Translate back center of shape bounds roughly
        ctx.translate(-250, -200);

        ctx.lineWidth = 1.2;
        ctx.strokeStyle = strokeColors[i % strokeColors.length];
        ctx.stroke(path);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60"
      aria-hidden="true"
    />
  );
}
