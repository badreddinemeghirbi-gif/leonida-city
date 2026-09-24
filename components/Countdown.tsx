'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

/* ⚠️ Change this one line if Rockstar moves the date again. */
const RELEASE_DATE = '2026-11-19T00:00:00Z';

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(): TimeLeft | null {
  const diff = new Date(RELEASE_DATE).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Digit({ label, value }: { label: string; value: number }) {
  const padded = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="glass relative flex h-20 w-16 items-center justify-center overflow-hidden rounded-lg sm:h-28 sm:w-24"
        style={{
          border: '1px solid rgba(0,255,255,0.35)',
          boxShadow: '0 0 18px rgba(0,255,255,0.25)',
          perspective: 600,
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={padded}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="font-display neon-text-cyan absolute text-3xl font-bold tabular-nums sm:text-5xl"
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">{label}</span>
    </div>
  );
}

export default function Countdown({ className = '' }: { className?: string }) {
  const setShowEmailModal = useStore((s) => s.setShowEmailModal);

  // null on the server AND on first client render — this is what keeps
  // React from screaming about a hydration mismatch on a live clock.
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const released = mounted && timeLeft === null;

  return (
    <section className={`scanlines relative overflow-hidden rounded-xl border border-white/10 px-4 py-14 text-center ${className}`}>
      <h2 className="font-display neon-text mb-8 text-2xl font-bold sm:text-4xl">
        {released ? 'GTA VI is live' : 'GTA VI launches in'}
      </h2>

      {!mounted ? (
        <div className="h-20 sm:h-28" aria-hidden />
      ) : released ? (
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          Welcome to Leonida
        </p>
      ) : (
        <div className="flex items-start justify-center gap-3 sm:gap-6">
          <Digit label="Days" value={timeLeft!.days} />
          <Digit label="Hours" value={timeLeft!.hours} />
          <Digit label="Minutes" value={timeLeft!.minutes} />
          <Digit label="Seconds" value={timeLeft!.seconds} />
        </div>
      )}

      <button
        onClick={() => setShowEmailModal(true)}
        className="btn-primary animate-breathe mt-10 rounded-md px-8 py-3 text-sm"
      >
        🔔 Notify Me
      </button>
    </section>
  );
}
