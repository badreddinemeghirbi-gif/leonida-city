import type { Metadata } from 'next';
import { getAlbums } from '@/lib/gallery';
import GalleryBrowser from '@/components/GalleryBrowser';
import AdUnit from '@/components/AdUnit';

export const metadata: Metadata = {
  title: 'Gallery — Leonida in Motion',
  description:
    'Original artwork and clips from across the state of Leonida. New pieces added regularly.',
  alternates: { canonical: '/gallery' },
};

export default function GalleryPage() {
  const albums = getAlbums();
  const total = albums.reduce((n, a) => n + a.count, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-8">
      <header className="mb-8">
        <h1 className="font-display neon-gradient text-3xl font-bold sm:text-5xl">
          Gallery
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Original artwork and clips from across Leonida
          {total > 0 && ` — ${total} pieces so far`}. New work goes up regularly.
        </p>
      </header>

      <GalleryBrowser albums={albums} />

      <AdUnit slot="0000000006" format="horizontal" minHeight={90} />

      <p className="mt-10 text-xs leading-relaxed text-white/35">
        All imagery here is original and AI-generated. It is not taken from
        Rockstar Games&apos; trailers, screenshots, or promotional material.
      </p>
    </div>
  );
}
