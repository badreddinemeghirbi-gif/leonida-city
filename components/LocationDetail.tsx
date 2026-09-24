'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore, type Location } from '@/store/useStore';

export default function LocationDetail({ location }: { location: Location }) {
  const closePanel = useStore((s) => s.closePanel);
  const toggleSaved = useStore((s) => s.toggleSaved);
  const savedLocations = useStore((s) => s.savedLocations);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const askAbout = useStore((s) => s.askAbout);

  const [playing, setPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Guard against SSR/client mismatch: localStorage isn't read on the server
  const isSaved = hasHydrated && savedLocations.includes(location.id);

  return (
    <motion.aside
      id="location-panel"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="glass relative w-full max-w-[480px] overflow-y-auto rounded-xl p-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]"
      style={{
        border: `2px solid ${location.borderColor}`,
        boxShadow: `0 0 24px ${location.borderColor}66`,
      }}
    >
      {/* Close */}
      <button
        onClick={closePanel}
        aria-label="Close panel"
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/70 transition hover:border-white/60 hover:text-white"
      >
        ✕
      </button>

      {/* Title */}
      <header className="mb-4 pr-10">
        <h2
          className="font-display text-2xl font-bold leading-tight"
          style={{ color: location.borderColor, textShadow: `0 0 14px ${location.borderColor}88` }}
        >
          <span className="mr-2">{location.icon}</span>
          {location.name}
        </h2>
        <span className="mt-2 inline-block rounded-full border border-white/20 px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/50">
          {location.county}
        </span>
      </header>

      {/* Hero image → video swap */}
      <div className="relative mb-4 aspect-video overflow-hidden rounded-lg border border-white/10 bg-black">
        {playing && !videoFailed ? (
          <video
            src={location.heroVideo}
            className="h-full w-full object-cover"
            controls
            autoPlay
            playsInline
            preload="none"
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <>
            <Image
              src={location.heroImage}
              alt={location.name}
              fill
              sizes="(max-width: 1023px) 100vw, 480px"
              className="object-cover"
            />
            <button
              onClick={() => setPlaying(true)}
              aria-label={`Play ${location.name} video`}
              className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/10"
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl"
                style={{
                  border: `2px solid ${location.glowColor}`,
                  color: location.glowColor,
                  boxShadow: `0 0 20px ${location.glowColor}88`,
                  background: 'rgba(0,0,0,0.5)',
                }}
              >
                ▶
              </span>
            </button>
            {videoFailed && (
              <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] text-white/60">
                Video unavailable
              </span>
            )}
          </>
        )}
      </div>

      {/* Lore */}
      <p
        className="mb-4 border-l-2 pl-3 text-sm italic leading-relaxed"
        style={{ borderColor: location.glowColor, color: location.glowColor }}
      >
        {location.lore}
      </p>

      {/* Description */}
      <p className="mb-6 text-sm leading-relaxed text-[var(--muted)]">
        {location.fullDescription}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => askAbout(location.name)}
          className="btn-primary rounded-md px-4 py-3 text-sm"
        >
          Ask AI about {location.name}
        </button>
        <button
          onClick={() => toggleSaved(location.id)}
          className="btn-ghost rounded-md px-4 py-3 text-sm"
        >
          {isSaved ? '★ Saved' : '☆ Save Location'}
        </button>
      </div>
    </motion.aside>
  );
}
