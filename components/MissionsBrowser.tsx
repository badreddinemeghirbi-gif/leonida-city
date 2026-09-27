'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export interface Mission {
  id: string;
  name: string;
  chapter: string;
  givenBy?: string;
  location?: string;
  summary: string;
  objectives: string[];
  goldMedal?: string[];
  unlocks?: string;
  verified: boolean;
}

export default function MissionsBrowser({
  status,
  chapters,
  missions,
  lastUpdated,
}: {
  status: string;
  chapters: string[];
  missions: Mission[];
  lastUpdated: string;
}) {
  const setShowEmailModal = useStore((s) => s.setShowEmailModal);

  const [chapter, setChapter] = useState('All');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [spoilers, setSpoilers] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return missions.filter((m) => {
      if (chapter !== 'All' && m.chapter !== chapter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        (m.givenBy ?? '').toLowerCase().includes(q)
      );
    });
  }, [missions, chapter, query]);

  /* ---------- WAITING STATE ---------- */
  if (status !== 'live' || missions.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--cyan)]/30 p-8 text-center sm:p-12">
        <p className="text-4xl">🎬</p>
        <h2 className="font-display neon-text-cyan mt-5 text-xl">
          Mission list drops the day the game does
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
          Nobody knows the mission names, the order, or how the story runs —
          because nobody has played it. Anything you read claiming otherwise
          right now is invented.
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
          The moment GTA VI is out, this page fills up: every mission, who gives
          it, what you have to do, gold medal requirements, and what it unlocks.
          Played and checked, not copied from somewhere else.
        </p>

        <div className="mx-auto mt-8 grid max-w-lg gap-3 text-left sm:grid-cols-3">
          {[
            ['📋', 'Full walkthroughs'],
            ['🏅', 'Gold medal targets'],
            ['🗺️', 'Linked to the map'],
          ].map(([icon, label]) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 p-3 text-center text-xs text-white/50"
            >
              <span className="block text-lg">{icon}</span>
              <span className="mt-1 block">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowEmailModal(true)}
          className="btn-primary animate-breathe mt-8 rounded-md px-7 py-3 text-sm"
        >
          🔔 Tell me when missions go live
        </button>

        <p className="mt-6 text-xs text-white/30">
          In the meantime, explore the{' '}
          <Link href="/map" className="text-[var(--cyan)] underline">
            interactive map
          </Link>{' '}
          or read the{' '}
          <Link href="/locations" className="text-[var(--cyan)] underline">
            location guides
          </Link>
          .
        </p>
      </div>
    );
  }

  /* ---------- LIVE LIST ---------- */
  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] transition ${
      active
        ? 'border border-[var(--cyan)] text-[var(--cyan)] shadow-[0_0_14px_rgba(0,255,255,0.3)]'
        : 'border border-white/12 text-white/45 hover:text-white'
    }`;

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search missions…"
        className="mb-5 w-full rounded-md border border-white/15 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--cyan)]"
      />

      <div className="chip-row mb-5 flex flex-wrap gap-2">
        <button onClick={() => setChapter('All')} className={chip(chapter === 'All')}>
          All
        </button>
        {chapters.map((c) => (
          <button key={c} onClick={() => setChapter(c)} className={chip(chapter === c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs text-white/35">
          {filtered.length} {filtered.length === 1 ? 'mission' : 'missions'}
          {lastUpdated && ` · updated ${lastUpdated}`}
        </p>
        <button
          onClick={() => setSpoilers((s) => !s)}
          className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-wider transition ${
            spoilers
              ? 'border-[var(--pink)] text-[var(--pink)]'
              : 'border-white/15 text-white/40'
          }`}
        >
          {spoilers ? '👁 Spoilers on' : '🙈 Spoilers hidden'}
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((m, i) => {
          const isOpen = open === m.id;
          return (
            <div
              key={m.id}
              className="rounded-lg border border-white/10 transition hover:border-[var(--cyan)]/50"
            >
              <button
                onClick={() => setOpen(isOpen ? null : m.id)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <span className="font-display w-8 shrink-0 text-sm text-white/25">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white">{m.name}</span>
                  <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-white/35">
                    {m.chapter}
                    {m.givenBy && ` · ${m.givenBy}`}
                  </span>
                </span>
                <span className="text-white/25">{isOpen ? '−' : '+'}</span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 border-t border-white/10 p-4 text-sm">
                      <p
                        className={`leading-relaxed text-[var(--muted)] transition ${
                          spoilers ? '' : 'blur-sm select-none'
                        }`}
                      >
                        {m.summary}
                      </p>

                      <div>
                        <p className="mb-2 text-[10px] uppercase tracking-wider text-white/40">
                          Objectives
                        </p>
                        <ul className="space-y-1.5">
                          {m.objectives.map((o) => (
                            <li key={o} className="ml-5 list-disc text-[var(--muted)]">
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {m.goldMedal && m.goldMedal.length > 0 && (
                        <div>
                          <p className="mb-2 text-[10px] uppercase tracking-wider text-[var(--pink)]">
                            🏅 Gold medal
                          </p>
                          <ul className="space-y-1.5">
                            {m.goldMedal.map((g) => (
                              <li key={g} className="ml-5 list-disc text-[var(--muted)]">
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                        {m.location && (
                          <Link
                            href={`/location/${m.location}`}
                            className="text-[var(--cyan)] underline"
                          >
                            View location →
                          </Link>
                        )}
                        {m.unlocks && (
                          <span className="text-white/35">Unlocks: {m.unlocks}</span>
                        )}
                        {!m.verified && (
                          <span className="text-amber-400">⚠ Unverified</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-white/35">
            Nothing matches that.
          </p>
        )}
      </div>
    </>
  );
}
