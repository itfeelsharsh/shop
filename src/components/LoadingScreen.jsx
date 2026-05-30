import React, { useEffect, useState, useRef, useCallback } from "react";

const STYLES = `
  @keyframes kami-pulse-ring {
    0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0; }
    40% { opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
  }

  @keyframes kami-logo-in {
    0% { transform: scale(0.3) rotate(-8deg); opacity: 0; filter: blur(12px); }
    60% { transform: scale(1.05) rotate(1deg); opacity: 1; filter: blur(0); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; filter: blur(0); }
  }

  @keyframes kami-shimmer {
    0% { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(200%) skewX(-15deg); }
  }

  @keyframes kami-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  @keyframes kami-text-in {
    0% { opacity: 0; transform: translateY(18px); letter-spacing: 0.4em; }
    100% { opacity: 1; transform: translateY(0); letter-spacing: 0.22em; }
  }

  @keyframes kami-tagline-in {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 0.55; transform: translateY(0); }
  }

  @keyframes kami-progress-fill {
    0% { width: 0%; }
    15% { width: 15%; }
    40% { width: 45%; }
    70% { width: 72%; }
    90% { width: 88%; }
    100% { width: 100%; }
  }

  @keyframes kami-particle {
    0% { opacity: 0; transform: translate(0, 0) scale(0); }
    15% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: translate(var(--px), var(--py)) scale(0); }
  }

  @keyframes kami-exit {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes kami-logo-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }

  @keyframes kami-line-draw {
    0% { width: 0; }
    100% { width: 48px; }
  }

  .kami-loading-root {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    overflow: hidden;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  }

  .kami-loading-root.exiting {
    animation: kami-exit 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* Ambient background glow */
  .kami-bg-glow {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(220, 38, 38, 0.06) 0%, transparent 70%);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* Logo container */
  .kami-logo-wrap {
    position: relative;
    width: 120px;
    height: 120px;
    animation: kami-logo-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }

  .kami-logo-wrap.breathing {
    animation: kami-logo-breathe 3s ease-in-out infinite;
    opacity: 1;
  }

  .kami-logo-wrap img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
    position: relative;
    z-index: 2;
  }

  /* Shimmer overlay on logo */
  .kami-shimmer-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    overflow: hidden;
    z-index: 3;
    pointer-events: none;
  }

  .kami-shimmer-overlay::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.35) 50%,
      transparent 100%
    );
    animation: kami-shimmer 1.8s ease-in-out 0.6s;
    animation-fill-mode: forwards;
  }

  /* Pulse rings */
  .kami-pulse-ring {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 2px solid rgba(220, 38, 38, 0.25);
    animation: kami-pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    pointer-events: none;
  }

  /* Shadow under logo */
  .kami-logo-shadow {
    width: 80px;
    height: 8px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0,0,0,0.1) 0%, transparent 70%);
    margin-top: 16px;
    animation: kami-logo-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }

  /* Brand text */
  .kami-brand-text {
    margin-top: 28px;
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    opacity: 0;
    animation: kami-text-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards;
  }

  /* Decorative lines */
  .kami-line-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
    opacity: 0;
    animation: kami-tagline-in 0.6s ease 1s forwards;
  }

  .kami-line {
    height: 1px;
    background: rgba(220, 38, 38, 0.35);
    animation: kami-line-draw 0.8s ease 1.1s forwards;
    width: 0;
  }

  .kami-line-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #DC2626;
  }

  /* Tagline */
  .kami-tagline {
    margin-top: 8px;
    font-size: 11px;
    font-weight: 400;
    color: #888;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    opacity: 0;
    animation: kami-tagline-in 0.6s ease 1.2s forwards;
  }

  /* Progress bar */
  .kami-progress-track {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 160px;
    height: 2px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 2px;
    overflow: hidden;
    opacity: 0;
    animation: kami-tagline-in 0.4s ease 1.4s forwards;
  }

  .kami-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #DC2626, #ef4444);
    border-radius: 2px;
    animation: kami-progress-fill 2s cubic-bezier(0.4, 0, 0.2, 1) 1.5s forwards;
    width: 0;
  }

  /* Floating particles */
  .kami-particle {
    position: absolute;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: rgba(220, 38, 38, var(--alpha));
    left: calc(50% + var(--ox));
    top: calc(50% + var(--oy));
    animation: kami-particle var(--dur) ease var(--delay) infinite;
    pointer-events: none;
  }
`;

const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 12;
  const radius = 90 + Math.random() * 50;
  const size = 2 + Math.random() * 3;
  return {
    id: i,
    ox: `${Math.cos(angle) * 50}px`,
    oy: `${Math.sin(angle) * 50}px`,
    px: `${Math.cos(angle) * radius}px`,
    py: `${Math.sin(angle) * radius}px`,
    size: `${size}px`,
    alpha: 0.12 + Math.random() * 0.15,
    dur: `${2.5 + Math.random() * 2}s`,
    delay: `${i * 0.25}s`,
  };
});

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase] = useState("enter"); // enter | active | exit
  const rootRef = useRef(null);
  const styleRef = useRef(null);
  const completedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase("exit");
    setTimeout(() => {
      onComplete?.();
    }, 500);
  }, [onComplete]);

  // Inject keyframe styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);
    styleRef.current = style;
    return () => {
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
      }
    };
  }, []);

  // Animation sequence
  useEffect(() => {
    const timers = [];
    // Move to active (breathing) phase after entrance
    timers.push(setTimeout(() => setPhase("active"), 1200));
    // Auto-complete after progress bar fills
    timers.push(setTimeout(() => handleComplete(), 3800));
    return () => timers.forEach(clearTimeout);
  }, [handleComplete]);

  return (
    <div
      ref={rootRef}
      className={`kami-loading-root ${phase === "exit" ? "exiting" : ""}`}
    >
      {/* Ambient background glow */}
      <div className="kami-bg-glow" />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="kami-particle"
          style={{
            "--ox": p.ox,
            "--oy": p.oy,
            "--px": p.px,
            "--py": p.py,
            "--size": p.size,
            "--alpha": p.alpha,
            "--dur": p.dur,
            "--delay": p.delay,
          }}
        />
      ))}

      {/* Pulse rings */}
      <div className="kami-pulse-ring" style={{ animationDelay: "0s" }} />
      <div className="kami-pulse-ring" style={{ animationDelay: "0.7s" }} />
      <div className="kami-pulse-ring" style={{ animationDelay: "1.4s" }} />

      {/* Logo */}
      <div className={`kami-logo-wrap ${phase === "active" ? "breathing" : ""}`}>
        <img
          src="/logo512.png"
          alt="KamiKoto"
          draggable={false}
        />
        <div className="kami-shimmer-overlay" />
      </div>

      {/* Shadow */}
      <div className="kami-logo-shadow" />

      {/* Brand name */}
      <div className="kami-brand-text">KamiKoto</div>

      {/* Decorative lines */}
      <div className="kami-line-container">
        <div className="kami-line" />
        <div className="kami-line-dot" />
        <div className="kami-line" />
      </div>

      {/* Tagline */}
      <div className="kami-tagline">Your Shop</div>

      {/* Progress bar */}
      <div className="kami-progress-track">
        <div className="kami-progress-bar" />
      </div>
    </div>
  );
}