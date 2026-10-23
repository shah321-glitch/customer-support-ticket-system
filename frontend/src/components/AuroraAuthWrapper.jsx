import React, { useRef, useState } from "react";
import "../styles/aurora-auth.css";

// 25 pre-computed particles for pure CSS upward floating effect
const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${((i * 17) % 96) + 2}%`,
  size: `${(i % 3) * 1.5 + 2}px`,
  delay: `${(i * 0.6) % 9}s`,
  duration: `${11 + (i % 7)}s`,
}));

const AuroraAuthWrapper = ({ children }) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: "perspective(1200px) rotateX(0deg) rotateY(0deg)",
  });

  const handleMouseMove = (e) => {
    // Disable 3D tilt on touch or very small devices
    if (window.innerWidth < 768 || window.matchMedia("(hover: none)").matches) return;

    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate spotlight position
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);

    // Calculate subtle 3D tilt angles (max 4.5 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 4.5;
    const rotateY = ((x - centerX) / centerX) * 4.5;

    setTiltStyle({
      transform: `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1200px) rotateX(0deg) rotateY(0deg)",
    });
  };

  return (
    <div className="aurora-page-wrapper">
      {/* 1. Subtle Dot Grid Pattern */}
      <div className="aurora-dot-grid" />

      {/* 2. 3 Animated Aurora Color Drift Clouds */}
      <div className="aurora-blobs-layer">
        <div className="aurora-blob aurora-blob-violet" />
        <div className="aurora-blob aurora-blob-pink" />
        <div className="aurora-blob aurora-blob-cyan" />
      </div>

      {/* 3. Pure CSS Upward Floating Particles */}
      <div className="aurora-particles-layer">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="aurora-particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* 4. 3D Interactive Card Frame */}
      <div className="aurora-card-perspective-frame">
        <div
          ref={cardRef}
          className="aurora-card"
          style={tiltStyle}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Rotating Conic Gradient Border Glow */}
          <div className="aurora-card-glow-border" />

          {/* Cursor Spotlight Glow */}
          <div className="aurora-card-spotlight" />

          {/* Actual Card Content */}
          <div className="aurora-card-content">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuroraAuthWrapper;

