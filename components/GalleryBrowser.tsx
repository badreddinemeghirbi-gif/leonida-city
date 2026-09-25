'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Album, MediaItem } from '@/lib/gallery';

const PAGE = 24;

export default function GalleryBrowser({ albums }: { albums: Album[] }) {
  const [album, setAlbum] = useState<string>('all');
  const [type, setType] = useState<'all' | 'photo' | 'video'>('all');
  const [visible, setVisible] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);

  const items = useMemo(() => {
    let list: MediaItem[] = albums.flatMap((a) => a.items);
    if (album !== 'all') list = list.filter((i) => i.album === album);
    if (type !== 'all') list = list.filter((i) => i.type === type);
    return list;
  }, [albums, album, type]);

  /* Reset paging when filters change */
  useEffect(() => setVisible(PAGE), [album, type]);

  /* Lightbox keyboard + scroll lock */
  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => ((i ?? 0) + 1) % items.length);
      if (e.key === 'ArrowLeft')
        setOpen((i) => ((i ?? 0) - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, items.length]);

  if (albums.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 p-12 text-center">
        <p className="text-4xl">📷</p>
        <h2 className="font-display mt-5 text-lg text-white">Gallery is empty</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
          Drop images or clips into a folder under{' '}
          <code className="text-[var(--cyan)]">public/gallery/</code> and push.
          They appear here automatically.
        </p>
      </div>
    );
  }

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] transition ${
      active
        ? 'border border-[var(--cyan)] text-[var(--cyan)] shadow-[0_0_14px_rgba(0,255,255,0.35)]'
        : 'border border-white/12 text-white/45 hover:text-white'
    }`;

  const current = open !== null ? items[open] : null;

  return (
    <>
      {/* Type filter */}
      <div className="chip-row mb-3 flex flex-wrap gap-2">
        {(['all', 'photo', 'video'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={chip(type === t)}>
            {t === 'all' ? 'Everything' : t === 'photo' ? 'Photos' : 'Videos'}
          </button>
        ))}
      </div>

      {/* Album filter */}
      <div className="chip-row mb-8 flex flex-wrap gap-2">
        <button onClick={() => setAlbum('all')} className={chip(album === 'all')}>
          All albums
        </button>
        {albums.map((a) => (
          <button
            key={a.slug}
            onClick={() => setAlbum(a.slug)}
            className={chip(album === a.slug)}
          >
            {a.title} <span className="opacity-40">{a.count}</span>
          </button>
        ))}
      </div>

      <p className="mb-5 text-xs text-white/35">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </p>

      {/* Masonry */}
      <div className="columns-1 gap-4 sm:columns-2 md:columns-3 [&>*]:mb-4">
        {items.slice(0, visible).map((item, i) => (
          <motion.button
            key={item.src}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.03 }}
            onClick={() => setOpen(i)}
            className="group relative block w-full break-inside-avoid overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] transition hover:border-[var(--cyan)]"
          >
            {item.type === 'photo' ? (
              <Image
                src={item.src}
                alt={item.caption}
                width={600}
                height={800}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={72}
                loading={i < 6 ? 'eager' : 'lazy'}
                className="h-auto w-full transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <>
                {/* #t=0.1 makes the browser paint the first frame as a
                    thumbnail without downloading the whole clip */}
                <video
                  src={`${item.src}#t=0.1`}
                  preload="metadata"
                  muted
                  playsInline
                  className="h-auto w-full"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full border text-sm"
                    style={{
                      borderColor: 'var(--cyan)',
                      color: 'var(--cyan)',
                      background: 'rgba(0,0,0,0.5)',
                    }}
                  >
                    ▶
                  </span>
                </span>
              </>
            )}

            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2 pt-8 text-left text-[10px] text-white/0 transition group-hover:text-white/75">
              {item.caption}
            </span>
          </motion.button>
        ))}
      </div>

      {visible < items.length && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setVisible((v) => v + PAGE)}
            className="btn-ghost rounded-md px-7 py-3 text-xs"
          >
            Load more ({items.length - visible} left)
          </button>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/94 p-4"
          >
            <button
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-5 top-5 text-2xl text-white/60 transition hover:text-white"
            >
              ✕
            </button>

            <motion.div
              key={current.src}
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[82vh] w-full max-w-5xl items-center justify-center"
            >
              {current.type === 'photo' ? (
                <Image
                  src={current.src}
                  alt={current.caption}
                  width={1920}
                  height={1080}
                  sizes="100vw"
                  className="max-h-[82vh] w-auto object-contain"
                />
              ) : (
                <video
                  src={current.src}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="max-h-[82vh] w-auto"
                />
              )}
            </motion.div>

            <p className="mt-4 text-center text-xs text-white/50">
              {current.caption}
              <span className="ml-3 text-white/25">
                {current.albumTitle} · {(open ?? 0) + 1}/{items.length}
              </span>
            </p>

            {items.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((i) => ((i ?? 0) - 1 + items.length) % items.length);
                  }}
                  aria-label="Previous"
                  className="absolute left-3 text-4xl text-white/40 transition hover:text-[var(--cyan)]"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((i) => ((i ?? 0) + 1) % items.length);
                  }}
                  aria-label="Next"
                  className="absolute right-3 text-4xl text-white/40 transition hover:text-[var(--cyan)]"
                >
                  ›
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
