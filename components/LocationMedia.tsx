'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Location } from '@/store/useStore';

export default function LocationMedia({ location }: { location: Location }) {
  const [tab, setTab] = useState<'video' | 'photos'>('video');
  const [playing, setPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos = [
    { src: location.heroImage, caption: `${location.name} — wide view` },
    { src: location.cardThumbnail, caption: `${location.name} — street level` },
  ];

  /* Lightbox keyboard controls */
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((i) => ((i ?? 0) + 1) % photos.length);
      if (e.key === 'ArrowLeft')
        setLightbox((i) => ((i ?? 0) - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, photos.length]);

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-xs uppercase tracking-[0.18em] rounded-md transition ${
      active
        ? 'text-[var(--cyan)] border border-[var(--cyan)]/50 bg-[var(--cyan)]/10'
        : 'text-white/45 border border-transparent hover:text-white'
    }`;

  return (
    <section className="mb-10">
      {/* Tabs */}
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => setTab('video')} className={tabClass(tab === 'video')}>
          ▶ Video
        </button>
        <button onClick={() => setTab('photos')} className={tabClass(tab === 'photos')}>
          ◼ Photos ({photos.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'video' ? (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black"
          >
            {playing && !videoFailed ? (
              <video
                src={location.heroVideo}
                poster={location.heroImage}
                className="h-full w-full object-cover"
                controls
                autoPlay
                playsInline
                preload="metadata"
                onError={() => setVideoFailed(true)}
              />
            ) : (
              <>
                {/* The poster is a normal optimized image until you press play —
                    the video file itself is never downloaded unprompted. */}
                <Image
                  src={location.heroImage}
                  alt={`${location.name} in Leonida`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
                <button
                  onClick={() => setPlaying(true)}
                  aria-label={`Play ${location.name} video`}
                  className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/10"
                >
                  <span
                    className="flex h-20 w-20 items-center justify-center rounded-full text-2xl backdrop-blur-sm"
                    style={{
                      border: `2px solid ${location.glowColor}`,
                      color: location.glowColor,
                      boxShadow: `0 0 28px ${location.glowColor}99`,
                      background: 'rgba(0,0,0,0.45)',
                    }}
                  >
                    ▶
                  </span>
                </button>

                {videoFailed && (
                  <span className="absolute bottom-3 left-3 rounded bg-black/75 px-2.5 py-1 text-[11px] text-white/70">
                    Video unavailable
                  </span>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="photos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {photos.map((p, i) => (
              <button
                key={p.src}
                onClick={() => setLightbox(i)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 transition hover:border-[var(--cyan)]"
              >
                <Image
                  src={p.src}
                  alt={p.caption}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2 pt-8 text-left text-[11px] text-white/70">
                  {p.caption}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4"
          >
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close"
              className="absolute right-5 top-5 text-2xl text-white/60 transition hover:text-white"
            >
              ✕
            </button>

            <motion.div
              key={lightbox}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[80vh] w-full max-w-5xl"
            >
              <Image
                src={photos[lightbox].src}
                alt={photos[lightbox].caption}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>

            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox((i) => ((i ?? 0) - 1 + photos.length) % photos.length);
                  }}
                  aria-label="Previous"
                  className="absolute left-4 text-3xl text-white/50 transition hover:text-[var(--cyan)]"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox((i) => ((i ?? 0) + 1) % photos.length);
                  }}
                  aria-label="Next"
                  className="absolute right-4 text-3xl text-white/50 transition hover:text-[var(--cyan)]"
                >
                  ›
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
