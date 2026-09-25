'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export interface Cheat {
  id: string;
  name: string;
  description: string;
  category: string;
  effect: string;
  codes: { playstation?: string; xbox?: string; pc?: string };
  verified: boolean;
  source?: string;
}

type Platform = 'playstation' | 'xbox' | 'pc';

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'playstation', label: 'PlayStation' },
  { id: 'xbox', label: 'Xbox' },
  { id: 'pc', label: 'PC' },
];

export default function CheatsBrowser({
  status,
  categories,
  codes,
  lastUpdated,
}: {
  status: string;
  categories: string[];
  codes: Cheat[];
  lastUpdated: string;
}) {
  const setShowEmailModal = useStore((s) => s.setShowEmailModal);

  const [platform, setPlatform] = useState<Platform>('playstation');
  const [category, setCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return codes.filter((c) => {
      if (category !== 'All' && c.category !== category) return false;
      if (!c.codes[platform]) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.effect.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.codes[platform] ?? '').toLowerCase().includes(q)
      );
    });
  }, [codes, category, platform, query]);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard blocked — nothing useful to do */
    }
  };

  /* ---------- WAITING STATE ---------- */
  if (status !== 'live' || codes.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--cyan)]/30 p-8 text-center sm:p-12">
        <p className="text-4xl">🔒</p>
        <h2 className="font-display neon-text-cyan mt-5 text-xl">
          No cheat codes yet
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
          GTA VI isn&apos;t out, so no cheat codes exist. Anyone publishing
          &ldquo;confirmed GTA 6 cheats&rdquo; right now is making them up.
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
          This page goes live the day codes are found, and every entry gets
          tested before it&apos;s listed. Nothing here will be guesswork.
        </p>
        <button
          onClick={() => setShowEmailModal(true)}
          className="btn-primary animate-breathe mt-8 rounded-md px-7 py-3 text-sm"
        >
          🔔 Notify me when cheats drop
        </button>
      </div>
    );
  }

  /* ---------- LIVE TABLE ---------- */
  return (
    <>
      {/* Platform tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`rounded-md px-4 py-2 text-xs uppercase tracking-[0.15em] transition ${
              platform === p.id
                ? 'border border-[var(--cyan)]/60 bg-[var(--cyan)]/10 text-[var(--cyan)]'
                : 'border border-white/10 text-white/45 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cheats…"
        className="mb-5 w-full rounded-md border border-white/15 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--cyan)]"
      />

      {/* Categories */}
      <div className="mb-8 flex flex-wrap gap-2">
        {['All', ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3.5 py-1.5 text-[11px] transition ${
              category === c
                ? 'border border-[var(--pink)] text-[var(--pink)]'
                : 'border border-white/10 text-white/45 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mb-4 text-xs text-white/35">
        {filtered.length} {filtered.length === 1 ? 'cheat' : 'cheats'}
        {lastUpdated && ` · updated ${lastUpdated}`}
      </p>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-white/10 p-4 transition hover:border-[var(--cyan)]/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
                      {c.category}
                    </span>
                    {c.verified ? (
                      <span className="text-[10px] uppercase tracking-wider text-green-400">
                        ✓ Tested
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-amber-400">
                        ⚠ Unverified
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                    {c.effect}
                  </p>
                </div>

                <button
                  onClick={() => copy(c.id, c.codes[platform] ?? '')}
                  className="shrink-0 rounded-md border border-[var(--cyan)]/40 px-3 py-2 font-mono text-xs text-[var(--cyan)] transition hover:bg-[var(--cyan)]/10"
                >
                  {copied === c.id ? '✓ Copied' : c.codes[platform]}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-white/35">
            Nothing matches that. Try a different search or category.
          </p>
        )}
      </div>
    </>
  );
}
