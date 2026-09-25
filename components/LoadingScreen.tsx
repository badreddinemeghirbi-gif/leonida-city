'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

/* Tune these in one place */
const INTRO_VIDEO = '/videos/intro_video.mp4';
const FALLBACK_IMAGE = '/images/City/Vice-City-Aerial-Night-View.png';
const SKIP_DELAY_MS = 3000; // when "SKIP INTRO" appears
const LOAD_TIMEOUT_MS = 7000; // no first frame by then -> show fallback

export default function LoadingScreen() {
  const setIntroComplete = useStore((s) => s.setIntroComplete);

  const videoRef = useRef<HTMLVideoElement>(null);
  const exitedRef = useRef(false);

  const [showSkip, setShowSkip] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false); // video errored or never loaded
  const [blocked, setBlocked] = useState(false); // browser refused autoplay
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  /* Fire once, from anywhere */
  const finish = useCallback(() => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    videoRef.current?.pause();
    setIntroComplete(true);
  }, [setIntroComplete]);

  /* Lock page scroll while the intro owns the screen */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Skip button timer */
  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), SKIP_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  /* Watchdog: `onError` does NOT reliably fire on slow/stalled networks,
     so we bail out to the static hero if no frame arrives in time. */
  useEffect(() => {
    if (ready || failed) return;
    const t = setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [ready, failed]);

  /* Kick off playback. Muted + playsInline is required by iOS Safari;
     even then the promise can reject (low-power mode, strict settings). */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setBlocked(true));
  }, []);

  /* Keyboard: Esc or Enter skips once the button is visible */
  useEffect(() => {
    if (!showSkip) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSkip, finish]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  const manualPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    setMuted(true);
    v.play()
      .then(() => setBlocked(false))
      .catch(() => setFailed(true));
  };

  return (
    <motion.div
      key="loading-screen"
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* ---------- VIDEO ---------- */}
      {!failed && (
        <video
          ref={videoRef}
          className="h-full w-full object-contain sm:object-cover"
          src={INTRO_VIDEO}
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onCanPlay={() => setReady(true)}
          onEnded={finish}
          onError={() => setFailed(true)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress((v.currentTime / v.duration) * 100);
          }}
        />
      )}

      {/* ---------- FALLBACK: static hero ---------- */}
      {failed && (
        <div className="relative h-full w-full">
          <Image
            src={FALLBACK_IMAGE}
            alt="Leonida — Vice City at night"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-black/50 px-6 text-center">
            <h1 className="font-display neon-gradient text-4xl font-bold sm:text-6xl">
              Leonida State
            </h1>
            <button
              onClick={finish}
              className="btn-primary animate-breathe rounded-md px-8 py-4 text-sm sm:text-base"
            >
              Enter Leonida →
            </button>
          </div>
        </div>
      )}

      {/* ---------- Loader until first frame ---------- */}
      <AnimatePresence>
        {!ready && !failed && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="font-display neon-text animate-pulse text-xs tracking-[0.5em] text-white/70">
              Entering Leonida
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Autoplay blocked ---------- */}
      {blocked && !failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <button
            onClick={manualPlay}
            className="btn-ghost rounded-md px-6 py-3 text-sm"
          >
            ▶ Tap to play intro
          </button>
        </div>
      )}

      {/* ---------- Controls ---------- */}
      {!failed && (
        <>
          {/* Unmute — bottom-left */}
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute intro' : 'Mute intro'}
            className="btn-ghost absolute left-4 rounded-md px-4 py-2 text-xs sm:left-6"
            style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {muted ? '🔇 Unmute' : '🔊 Mute'}
          </button>

          {/* Skip — bottom-right, appears after 3s */}
          <AnimatePresence>
            {showSkip && (
              <motion.button
                onClick={finish}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="btn-ghost absolute right-4 rounded-md px-5 py-2.5 text-xs sm:right-6 sm:text-sm"
                style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
              >
                Skip Intro →
              </motion.button>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/10">
            <div
              className="h-full bg-[var(--pink)] transition-[width] duration-200 ease-linear"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 12px var(--pink)',
              }}
            />
          </div>
        </>
      )}
    </motion.div>
  );
}
