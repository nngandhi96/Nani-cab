import React from 'react';
import { useApp } from '../context/AppContext';

interface MadhubaniBackgroundProps {
  opacity?: number; // Default ~0.12 to 0.15 (12% - 15%)
  className?: string;
  variant?: 'full' | 'subtle' | 'login';
}

export const MadhubaniBackground: React.FC<MadhubaniBackgroundProps> = ({
  opacity = 0.14,
  className = '',
  variant = 'full',
}) => {
  let theme: 'dark' | 'light' = 'dark';
  try {
    const app = useApp();
    if (app?.theme) theme = app.theme;
  } catch {
    theme = 'dark';
  }

  const effectiveOpacity = theme === 'light' ? opacity * 0.75 : opacity;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      style={{ opacity: effectiveOpacity }}
    >
      {/* Background Image Watermark Texture */}
      <div 
        className={`absolute inset-0 bg-repeat bg-center ${theme === 'light' ? 'mix-blend-multiply opacity-30' : 'mix-blend-screen'} transition-all duration-700`}
        style={{ 
          backgroundImage: 'url(/madhubani_watermark.png)', 
          backgroundSize: variant === 'login' ? '550px 550px' : '450px 450px',
          filter: theme === 'light' ? 'contrast(115%) brightness(90%)' : 'contrast(130%) brightness(115%)'
        }}
      />

      {/* Scalable Vector Graphics Madhubani Motifs & Borders */}
      <svg
        className={`w-full h-full absolute inset-0 ${theme === 'light' ? 'text-amber-800/30 stroke-amber-700/35' : 'text-amber-500/80 stroke-amber-400/90'} fill-none transition-colors duration-500`}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >

        <defs>
          {/* Madhubani Crosshatching Fill Pattern (Kachni Style) */}
          <pattern id="madhubani-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
            <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.25" />
          </pattern>

          {/* Madhubani Lotus Flower (Kamal Motif) */}
          <g id="madhubani-lotus">
            {/* Outer Lotus Ring */}
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="64" stroke="currentColor" strokeWidth="1" />
            
            {/* Center Core */}
            <circle cx="100" cy="100" r="18" fill="url(#madhubani-hatch)" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />

            {/* Petals with Double Lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <g key={i} transform={`rotate(${angle} 100 100)`}>
                <path
                  d="M 100,82 C 90,50 90,30 100,15 C 110,30 110,50 100,82 Z"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  fill="url(#madhubani-hatch)"
                />
                <path
                  d="M 100,78 C 93,52 93,35 100,22 C 107,35 107,52 100,78 Z"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                />
              </g>
            ))}
          </g>

          {/* Madhubani Peacock Motif (Mayur) */}
          <g id="madhubani-peacock">
            {/* Body */}
            <path
              d="M 60,110 C 40,90 40,60 65,45 C 85,30 105,45 100,70 C 95,95 75,120 60,110 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="url(#madhubani-hatch)"
            />
            {/* Neck & Crown */}
            <path d="M 65,45 C 60,35 62,25 70,20 C 72,15 75,15 78,18" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="78" cy="15" r="3" fill="currentColor" />
            <circle cx="83" cy="18" r="2.5" fill="currentColor" />
            <circle cx="73" cy="12" r="2" fill="currentColor" />
            
            {/* Eye */}
            <ellipse cx="68" cy="35" rx="3" ry="5" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.4" />
            
            {/* Beak */}
            <path d="M 60,35 L 50,38 L 58,42 Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />

            {/* Feather Fan (Intricate Mithila Lines) */}
            {[15, 35, 55, 75, 95, 115, 135].map((angle, idx) => (
              <g key={idx} transform={`rotate(${angle} 100 70)`}>
                <path
                  d="M 100,70 C 130,50 160,40 185,60 C 160,80 130,85 100,70 Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  fill="url(#madhubani-hatch)"
                />
                <circle cx="170" cy="58" r="6" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.25" />
                <circle cx="170" cy="58" r="3" fill="currentColor" />
              </g>
            ))}
          </g>

          {/* Madhubani Sun Motif (Surya Mandala) */}
          <g id="madhubani-sun">
            <circle cx="150" cy="150" r="45" stroke="currentColor" strokeWidth="2" fill="url(#madhubani-hatch)" />
            <circle cx="150" cy="150" r="35" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="150" cy="150" r="25" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Eyes */}
            <ellipse cx="138" cy="145" rx="5" ry="8" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1" />
            <ellipse cx="162" cy="145" rx="5" ry="8" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1" />
            <path d="M 145,158 Q 150,165 155,158" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

            {/* Radiant Rays */}
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={i} transform={`rotate(${i * 22.5} 150 150)`}>
                <path d="M 150,105 L 144,80 L 150,70 L 156,80 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.2" />
                <line x1="150" y1="105" x2="150" y2="65" stroke="currentColor" strokeWidth="1" />
              </g>
            ))}
          </g>
        </defs>

        {/* Decorative Madhubani Elements Placement */}
        <g transform="translate(100, -50) scale(1.4)" opacity="0.85">
          <use href="#madhubani-lotus" x="0" y="0" />
        </g>

        <g transform="translate(-60, 40) scale(1.2)" opacity="0.75">
          <use href="#madhubani-sun" x="0" y="0" />
        </g>

        <g transform="translate(250, 450) scale(1.3)" opacity="0.8">
          <use href="#madhubani-peacock" x="0" y="0" />
        </g>

        <g transform="translate(-40, 500) scale(1.2)" opacity="0.8">
          <use href="#madhubani-lotus" x="0" y="0" />
        </g>

        {/* Border Lattice & Corner Accents */}
        <rect
          x="12"
          y="12"
          width="calc(100% - 24px)"
          height="calc(100% - 24px)"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="12 6 3 6"
          strokeOpacity="0.4"
          rx="24"
        />
        <rect
          x="20"
          y="20"
          width="calc(100% - 40px)"
          height="calc(100% - 40px)"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeOpacity="0.25"
          rx="20"
        />

        <path d="M 20,20 L 100,20 L 20,100 Z" fill="url(#madhubani-hatch)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M calc(100% - 20px),20 L calc(100% - 100px),20 L calc(100% - 20px),100 Z" fill="url(#madhubani-hatch)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M 20,calc(100% - 20px) L 100,calc(100% - 20px) L 20,calc(100% - 100px) Z" fill="url(#madhubani-hatch)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M calc(100% - 20px),calc(100% - 20px) L calc(100% - 100px),calc(100% - 20px) L calc(100% - 20px),calc(100% - 100px) Z" fill="url(#madhubani-hatch)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      </svg>
    </div>
  );
};
