'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

const TAGS = ['General', 'Theories', 'Leaks', 'Gameplay', 'Art', 'Help'];
const TAG_COLOR: Record<string, string> = {
  General: '#00FFFF',
  Theories: '#A100F2',
  Leaks: '#FF1493',
  Gameplay: '#00FFFF',
  Art: '#FF1493',
  Help: '#A100F2',
};

type Post = {
  id: number;
  handle: string;
  title: string;
  body: string;
  tag: string;
  created_at: string;
  votes: number;
  comments: number;
  pinned: number;
};

export function ago(iso: string) {
  const t = new Date(iso.replace(' ', 'T') + 'Z').getTime();
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(t).toLocaleDateString();
}

export function Avatar({ handle, size = 36 }: { handle: string; size?: number }) {
  const hue = [...handle].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-black"
      style={{ width: size, height: size, fontSize: size * 0.34, background: `hsl(${hue} 90% 60%)` }}
    >
      {handle.slice(0, 2).toUpperCase()}
    </span>
  );
}

export default function ForumFeed() {
  const { data: session, status } = useSession();
  const signedIn = status === 'authenticated';

  const [posts, setPosts] = useState<Post[]>([]);
  const [voted, setVoted] = useState<number[]>([]);
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [tagFilter, setTagFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState('General');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ sort, tag: tagFilter });
      const res = await fetch(`/api/forum/posts?${qs}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
      setVoted(data.voted ?? []);
    } catch {
      setError('Could not load the feed.');
    } finally {
      setLoading(false);
    }
  }, [sort, tagFilter]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (posting) return;
    setPosting(true);
    setError('');
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, tag }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle(''); setBody(''); setOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post.');
    } finally {
      setPosting(false);
    }
  };

  const vote = async (postId: number) => {
    if (!signedIn) { signIn(); return; }
    const had = voted.includes(postId);
    setVoted((v) => (had ? v.filter((x) => x !== postId) : [...v, postId]));
    setPosts((p) => p.map((x) => (x.id === postId ? { ...x, votes: x.votes + (had ? -1 : 1) } : x)));

    const res = await fetch('/api/forum/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'vote', postId }),
    });
    const data = await res.json();
    if (typeof data.votes === 'number') {
      setPosts((p) => p.map((x) => (x.id === postId ? { ...x, votes: data.votes } : x)));
    } else {
      load();
    }
  };

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] transition ${
      active
        ? 'border border-[var(--cyan)] text-[var(--cyan)] shadow-[0_0_14px_rgba(0,255,255,0.3)]'
        : 'border border-white/12 text-white/45 hover:text-white'
    }`;

  return (
    <>
      <div className="glass mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-white/12 p-4">
        {signedIn ? (
          <>
            <Avatar handle={session.user.handle} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{session.user.handle}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/30">
                {session.user.role === 'member' ? 'Citizen of Leonida' : session.user.role}
              </p>
            </div>
            <button onClick={() => setOpen(true)} className="btn-primary ml-auto rounded-md px-5 py-2.5 text-xs">
              New post
            </button>
            <button onClick={() => signOut()} className="text-[10px] uppercase tracking-wider text-white/30 hover:text-white">
              Sign out
            </button>
          </>
        ) : (
          <>
            <span className="text-2xl">🎮</span>
            <p className="min-w-[180px] flex-1 text-sm text-[var(--muted)]">
              Sign in to post. You get a random Leonida handle — your name and
              email are never stored.
            </p>
            <div className="flex gap-2">
              <button onClick={() => signIn('discord')} className="btn-ghost rounded-md px-4 py-2.5 text-xs">
                Discord
              </button>
              <button onClick={() => signIn('google')} className="btn-ghost rounded-md px-4 py-2.5 text-xs">
                Google
              </button>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {open && signedIn && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="glass rounded-xl border border-[var(--cyan)]/40 p-5">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="Title — what's this about?"
                className="w-full rounded-md border border-white/12 bg-black/50 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-[var(--cyan)]"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={4000}
                rows={5}
                placeholder="Say your piece…"
                className="mt-3 w-full resize-none rounded-md border border-white/12 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--cyan)]"
              />
              <div className="chip-row mt-3 flex flex-wrap items-center gap-2">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTag(t)}
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition ${
                      tag === t ? 'text-black' : 'border border-white/12 text-white/40 hover:text-white'
                    }`}
                    style={tag === t ? { background: TAG_COLOR[t] } : undefined}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] text-white/25">{body.length}/4000</span>
                <button onClick={() => setOpen(false)} className="ml-auto text-xs text-white/40 hover:text-white">
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={posting || title.trim().length < 4 || body.trim().length < 2}
                  className="btn-primary rounded-md px-6 py-2.5 text-xs disabled:opacity-40"
                >
                  {posting ? 'Posting…' : 'Publish'}
                </button>
              </div>
              {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chip-row mb-3 flex flex-wrap gap-2">
        <button onClick={() => setSort('hot')} className={chip(sort === 'hot')}>🔥 Hot</button>
        <button onClick={() => setSort('new')} className={chip(sort === 'new')}>⚡ New</button>
        <button onClick={() => setSort('top')} className={chip(sort === 'top')}>★ Top</button>
      </div>

      <div className="chip-row mb-8 flex flex-wrap gap-2">
        <button onClick={() => setTagFilter('All')} className={chip(tagFilter === 'All')}>All</button>
        {TAGS.map((t) => (
          <button key={t} onClick={() => setTagFilter(t)} className={chip(tagFilter === t)}>{t}</button>
        ))}
      </div>

      {loading && posts.length === 0 ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-white/25">Loading</p>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-12 text-center">
          <p className="text-3xl">👾</p>
          <p className="mt-4 text-sm text-white/45">Nothing here yet. Start the first thread.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {posts.map((p) => {
              const isUp = voted.includes(p.id);
              const accent = TAG_COLOR[p.tag] ?? '#00FFFF';
              return (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-4 rounded-xl border border-white/10 p-4 transition hover:border-white/25 sm:p-5"
                >
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                      onClick={() => vote(p.id)}
                      aria-label="Upvote"
                      className={`text-lg leading-none transition ${
                        isUp ? 'text-[var(--pink)]' : 'text-white/25 hover:text-white'
                      }`}
                    >
                      ▲
                    </button>
                    <span className={`text-xs font-bold ${isUp ? 'text-[var(--pink)]' : 'text-white/45'}`}>
                      {p.votes}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-white/30">
                      {p.pinned === 1 && <span className="text-[var(--cyan)]">Pinned</span>}
                      <span className="rounded-full border px-2 py-0.5" style={{ borderColor: `${accent}66`, color: accent }}>
                        {p.tag}
                      </span>
                      <span>{p.handle}</span>
                      <span>{ago(p.created_at)}</span>
                    </div>

                    <Link href={`/forum/${p.id}`} className="group">
                      <h2 className="font-display text-base font-bold leading-snug text-white transition group-hover:text-[var(--cyan)] sm:text-lg">
                        {p.title}
                      </h2>
                    </Link>

                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{p.body}</p>

                    <Link href={`/forum/${p.id}`} className="mt-3 inline-block text-xs text-white/35 transition hover:text-white">
                      💬 {p.comments} {p.comments === 1 ? 'reply' : 'replies'}
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
