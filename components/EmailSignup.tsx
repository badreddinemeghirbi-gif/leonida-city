'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

const BANNER_DELAY_MS = 15000;
const SESSION_KEY = 'leonida-banner-seen';

export default function EmailSignup() {
  const showEmailModal = useStore((s) => s.showEmailModal);
  const setShowEmailModal = useStore((s) => s.setShowEmailModal);

  const [email, setEmail] = useState('');
  const [wantsNews, setWantsNews] = useState(true);
  const [wantsLaunch, setWantsLaunch] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [showBanner, setShowBanner] = useState(false);

  /* Floating banner — once per browser session */
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => setShowBanner(true), BANNER_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const dismissBanner = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setShowBanner(false);
  };

  const close = () => {
    setShowEmailModal(false);
    setTimeout(() => {
      setStatus('idle');
      setError('');
    }, 300);
  };

  const submit = async () => {
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!wantsNews && !wantsLaunch) {
      setError('Pick at least one option.');
      return;
    }

    const signupType =
      wantsNews && wantsLaunch ? 'both' : wantsNews ? 'newsletter' : 'waitlist';

    setStatus('loading');
    try {
      const res = await fetch('/api/emails/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, signupType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.');

      setStatus('success');
      dismissBanner();
      setTimeout(close, 2000);
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  return (
    <>
      {/* ---------- BANNER ---------- */}
      <AnimatePresence>
        {showBanner && !showEmailModal && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="glass fixed bottom-4 left-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-4 rounded-lg px-4 py-3 sm:max-w-md"
            style={{ border: '1px solid var(--cyan)', boxShadow: '0 0 20px rgba(0,255,255,0.35)' }}
          >
            <p className="text-xs text-[var(--muted)]">
              Get Vice City intel before launch.
            </p>
            <button
              onClick={() => {
                dismissBanner();
                setShowEmailModal(true);
              }}
              className="btn-primary shrink-0 rounded px-3 py-1.5 text-[11px]"
            >
              Join
            </button>
            <button
              onClick={dismissBanner}
              aria-label="Dismiss"
              className="shrink-0 text-white/40 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- MODAL ---------- */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass relative w-full max-w-[440px] rounded-xl p-7"
              style={{ border: '2px solid var(--cyan)', boxShadow: '0 0 30px rgba(0,255,255,0.4)' }}
            >
              <button
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 text-white/50 transition hover:text-white"
              >
                ✕
              </button>

              {status === 'success' ? (
                <div className="py-10 text-center">
                  <p className="font-display neon-text-cyan text-lg">
                    ✅ Welcome to Leonida
                  </p>
                  <p className="mt-3 text-sm text-white/60">Check your inbox.</p>
                </div>
              ) : (
                <>
                  <h3 className="font-display neon-text mb-2 text-xl font-bold">
                    Join the Leonida Network
                  </h3>
                  <p className="mb-6 text-sm text-[var(--muted)]">
                    Get Vice City intel, GTA 6 strategies, and exclusive content.
                  </p>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder="you@email.com"
                    className="w-full rounded-md border border-white/20 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--cyan)] focus:shadow-[0_0_14px_rgba(0,255,255,0.4)]"
                  />

                  {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

                  <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-[var(--muted)]">
                    <input
                      type="checkbox"
                      checked={wantsNews}
                      onChange={(e) => setWantsNews(e.target.checked)}
                      className="h-4 w-4 accent-[var(--pink)]"
                    />
                    📧 Send me strategies &amp; news
                  </label>
                  <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-[var(--muted)]">
                    <input
                      type="checkbox"
                      checked={wantsLaunch}
                      onChange={(e) => setWantsLaunch(e.target.checked)}
                      className="h-4 w-4 accent-[var(--pink)]"
                    />
                    🔔 Notify me before GTA 6 launch
                  </label>

                  <button
                    onClick={submit}
                    disabled={status === 'loading'}
                    className="btn-primary mt-7 w-full rounded-md py-3 text-sm disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Unlocking…' : 'Unlock Access'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
