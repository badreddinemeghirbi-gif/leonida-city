import type { Metadata } from 'next';
import MapView from '@/components/MapView';
import AdUnit from '@/components/AdUnit';

export const metadata: Metadata = {
  title: 'Interactive Map — Leonida State',
  description:
    'Explore the state of Leonida on an interactive map. Click any district for lore, field notes, and guides.',
  alternates: { canonical: '/map' },
};

export default function MapPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-20 pt-8 sm:px-8">
      <header className="mb-8">
        <h1 className="font-display neon-gradient text-3xl font-bold sm:text-5xl">
          Interactive Map
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Twelve districts across Leonida. Tap a marker to open its dossier.
        </p>
      </header>

      <MapView />

      <AdUnit slot="0000000002" format="horizontal" minHeight={90} />
    </div>
  );
}
