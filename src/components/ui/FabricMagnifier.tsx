'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, Sparkles } from 'lucide-react';

interface FabricMagnifierProps {
  src: string;
  alt: string;
  zoomLevel?: number; // default 2.5
  className?: string;
  fallbackSrc?: string;
  onImageClick?: () => void;
  showBadge?: boolean;
}

export function FabricMagnifier({
  src,
  alt,
  zoomLevel = 2.5,
  className = '',
  fallbackSrc = '/images/cat-3piece.jpg',
  onImageClick,
  showBadge = true,
}: FabricMagnifierProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; pctX: number; pctY: number }>({
    x: 0,
    y: 0,
    pctX: 50,
    pctY: 50,
  });

  const lensSize = 160; // 160px diameter circular magnifying glass

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pctX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const pctY = Math.max(0, Math.min(100, (y / rect.height) * 100));

    setCursorPos({ x, y, pctX, pctY });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onImageClick}
      className={`relative overflow-hidden cursor-crosshair select-none group ${className}`}
    >
      {/* Base Image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== fallbackSrc) target.src = fallbackSrc;
        }}
      />

      {/* Luxury Magnifying Glass Lens (Desktop Only) */}
      {isHovered && (
        <div
          className="hidden md:block pointer-events-none absolute rounded-full border-2 border-[#C5A059] shadow-2xl ring-4 ring-white/80 overflow-hidden z-30 transition-opacity duration-150"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${cursorPos.x - lensSize / 2}px`,
            top: `${cursorPos.y - lensSize / 2}px`,
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundPosition: `${cursorPos.pctX}% ${cursorPos.pctY}%`,
            boxShadow: '0 15px 35px -5px rgba(0,0,0,0.5), inset 0 0 15px rgba(197, 160, 89, 0.4)',
          }}
        >
          {/* Subtle Golden Center Focus Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border border-[#C5A059]/40" />
          </div>
        </div>
      )}

      {/* Floating Magnifier Indicator Badge */}
      {showBadge && (
        <div className="absolute bottom-2.5 right-2.5 pointer-events-none hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-medium border border-white/20 shadow-md transition-opacity group-hover:opacity-100 opacity-80">
          <ZoomIn className="w-3 h-3 text-[#C5A059]" />
          <span>Hover to Magnify Fabric (2.5×)</span>
        </div>
      )}
    </div>
  );
}
