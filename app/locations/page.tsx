import Link from 'next/link';
import type { Metadata } from 'next';
import LocationsGrid from '@/components/LocationsGrid';


export const metadata: Metadata = {
  title: 'All Locations — Leonida State',
  description:
    'Every district of Leonida, from Ocean Beach to Viceport Harbor. Lore, field notes, and guides for all 12 locations.',
  alternates: { canonical: '/locations' },
};

export default function LocationsIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
      <Link
        href="/"
        className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[var(--cyan)]"
      >
        ← Back to the map
      </Link>

      <header className="mb-12 mt-8">
        <h1 className="font-display neon-gradient text-3xl font-bold sm:text-5xl">
          All Locations
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Twelve districts across the state of Leonida. Each one has its own
          character, its own economy, and its own reasons to be careful.
        </p>
      </header>

      <LocationsGrid />
    </div>
  );
}
