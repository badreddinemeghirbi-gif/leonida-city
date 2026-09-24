'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import LoadingScreen from '@/components/LoadingScreen';
import Countdown from '@/components/Countdown';
import LocationsGrid from '@/components/LocationsGrid';
import AdUnit from '@/components/AdUnit';

export default function Home() {
  const introComplete = useStore((s) => s.introComplete);

  return (
    <AnimatePresence mode="wait">
      {!introComplete ? (
        <LoadingScreen key="intro" />
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-8"
        >
          {/* ---------- COUNTDOWN (top of page) ---------- */}
          <Countdown className="mt-4" />

          <AdUnit slot="0000000002" format="horizontal" minHeight={90} />

          {/* ---------- LOCATIONS ---------- */}
          <section className="mt-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display neon-gradient text-3xl font-bold sm:text-5xl">
                  Leonida State
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                  Twelve districts, each with its own economy, its own rules, and
                  its own reasons to be careful.
                </p>
              </div>

              <Link href="/map" className="btn-ghost rounded-md px-5 py-2.5 text-xs">
                Open interactive map →
              </Link>
            </div>

            <LocationsGrid />
          </section>

          <AdUnit slot="0000000003" format="horizontal" minHeight={100} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
