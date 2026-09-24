'use client';

import { AnimatePresence, motion } from 'framer-motion';
import rawLocations from '@/data/locations.json';
import { useStore, type Location } from '@/store/useStore';
import InteractiveMap from '@/components/InteractiveMap';
import LocationDetail from '@/components/LocationDetail';
import AdUnit from '@/components/AdUnit';

const locations = rawLocations as Location[];

export default function MapView() {
  const selectedLocation = useStore((s) => s.selectedLocation);
  const active = locations.find((l) => l.id === selectedLocation) ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <InteractiveMap />

      <div className="flex flex-col items-center gap-6 lg:items-start">
        <AnimatePresence mode="wait">
          {active ? (
            <LocationDetail key={active.id} location={active} />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden w-full max-w-[480px] items-center justify-center rounded-xl border border-dashed border-white/15 p-10 text-center text-sm uppercase tracking-[0.25em] text-white/30 lg:flex lg:min-h-[400px]"
            >
              Select a location
            </motion.div>
          )}
        </AnimatePresence>

        <AdUnit
          slot="0000000001"
          format="vertical"
          minHeight={600}
          className="hidden w-full max-w-[300px] lg:block"
        />
      </div>
    </div>
  );
}
