'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import rawLocations from '@/data/locations.json';
import { useStore, type Location } from '@/store/useStore';

const locations = rawLocations as Location[];

export default function InteractiveMap() {
  const selectedLocation = useStore((s) => s.selectedLocation);
  const setSelectedLocation = useStore((s) => s.setSelectedLocation);
  const [hovered, setHovered] = useState<string | null>(null);

  const handleClick = (id: string) => {
    // Clicking the active marker again closes the panel
    setSelectedLocation(selectedLocation === id ? null : id);

    // On mobile the panel renders below the map — bring it into view
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setTimeout(() => {
        document
          .getElementById('location-panel')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  return (
    <div className="relative">
      {/* Animated grid behind the map */}
      <div className="grid-bg pointer-events-none absolute -inset-4 rounded-xl opacity-40" />

      <div className="neon-border relative overflow-hidden rounded-xl">
        {/* w-full + h-auto lets the real image set the height, so the
            percentage marker positions always land correctly */}
        <Image
          src="/images/map-high.png"
          alt="Map of Leonida State"
          width={2048}
          height={2048}
          priority
          sizes="(max-width: 1023px) 100vw, 60vw"
          className="h-auto w-full select-none"
        />

        {/* --- MARKERS --- */}
        {locations.map((loc) => {
          const isActive = selectedLocation === loc.id;
          const isHovered = hovered === loc.id;

          return (
            <button
              key={loc.id}
              type="button"
              aria-label={loc.name}
              onClick={() => handleClick(loc.id)}
              onMouseEnter={() => setHovered(loc.id)}
              onMouseLeave={() => setHovered(null)}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center p-3"
              style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
            >
              {/* Outer ripple on the active marker */}
              {isActive && (
                <motion.span
                  className="absolute rounded-full"
                  style={{ border: `1px solid ${loc.glowColor}` }}
                  initial={{ width: 12, height: 12, opacity: 0.9 }}
                  animate={{ width: 56, height: 56, opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              )}

              <span
                className="marker-dot"
                data-active={isActive}
                style={{ backgroundColor: loc.glowColor, color: loc.glowColor }}
              />

              {/* Tooltip */}
              {(isHovered || isActive) && (
                <span
                  className="glass-soft pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
                  style={{
                    border: `1px solid ${loc.borderColor}`,
                    color: loc.borderColor,
                    boxShadow: `0 0 12px ${loc.borderColor}55`,
                  }}
                >
                  {loc.icon} {loc.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs uppercase tracking-[0.3em] text-white/40">
        12 locations · tap a marker
      </p>
    </div>
  );
}
