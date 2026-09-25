'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TAGS = ['General', 'Theories', 'Leaks', 'Gameplay', 'Art', 'Off-topic'];
const TAG_COLORS: Record<string, string> = {
  General: '#00FFFF',
  Theories: '#A100F2',
  Leaks: '#FF1493',
  Gameplay: '#00FFFF',
  Art: '#FF1493',
  'Off-topic': '#A100F2',
};

type Post = {
  id: number;
  author_name: string;
  body: string;
  tag: string;
  created_at: string;
  likes: number;
  comments: number;
};

type Comment = { id: number; author_name: string; body: string; created_at: string };

/* "3 min ago" from a UTC datetime string */
function ago(iso: string) {
  const t = new Date(iso.replace(' ', 'T') + 'Z').getTime();
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(t).toLocaleDateString();
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export default function ForumFeed() {
  const [me, setMe] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nameDraft, setNameDraft] = useState('');

  const [posts, setPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState<number[]>([]);
  const [sort, setSort] = useState<'new' | 'top'>('new');
  const [tagFilter, setTagFilter] = useState('All');

  const [body, setBody] = useState('');
  const [tag, setTag] = useState('General');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [openComments, setOpenComments] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState('');

  /* Identity lives in this browser only — no accounts, no passwords */
  useEffect(() => {
    let id = localStorage.getItem('leonida-forum-id');
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `u${Date.now()}${Math.random()}`;
      localStorage.setItem('leonida-forum-id', id);
    }
    setMe(id);
    setName(localStorage.getItem('leonida-forum-name') ?? '');
  }, []);

  const load = useCallback(async () => {
    if (!me) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({ sort, tag: tagFilter, me });
      const res = await fetch(`/api/forum/posts?${qs}`);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
        setLiked(data.liked ?? []);
      }
    } catch {
      setError('Could not load the feed.');
    } finally {
      setLoading(false);
    }
  }, [me, sort, tagFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const saveName = () => {
    const n = nameDraft.trim().slice(0, 24);
    if (n.length < 2) return;
    localStorage.setItem('leonida-forum-name', n);
    setName(n);
  };

  const submit = async () => {
    if (!me || !body.trim() || posting) return;
    setPosting(true);
    setError('');
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: me, authorName: name, body, tag }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBody('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post.');
    } finally {
      setPosting(false);
    }
  };

  const like = async (postId: number) => {
    if (!me) return;
    // optimistic
    const was = liked.includes(postId);
    setLiked((l) => (was ? l.filter((x) => x !== postId) : [...l, postId]));
    setPosts((p) =>
      p.map((x) => (x.id === postId ? { ...x, likes: x.likes + (was ? -1 : 1) } : x))
    );

    try {
      const res = await fetch('/api/forum/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', postId, authorId: me }),
      });
      const data = await res.json();
      if (typeof data.likes === 'number') {
        setPosts((p) => p.map((x) => (x.id === postId ? { ...x, likes: data.likes } : x)));
      }
    } catch {
      load(); // resync on failure
    }
  };

  const openThread = async (postId: number) => {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }
    setOpenComments(postId);
    setCommentDraft('');
    if (comments[postId]) return;

    const res = await fetch('/api/forum/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'comments', postId }),
    });
    const data = await res.json();
    setComments((c) => ({ ...c, [postId]: data.comments ?? [] }));
  };

  const sendComment = async (postId: number) => {
    if (!me || !commentDraft.trim()) return;
    const res = await fetch('/api/forum/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'comment',
        postId,
        authorId: me,
        authorName: name,
        body: commentDraft,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Could not comment.');
      return;
    }
    setComments((c) => ({ ...c, [postId]: data.comments }));
    setCommentDraft('');
    setPosts((p) =>
      p.map((x) => (x.id === postId ? { ...x, comments: data.comments.length } : x))
    );
  };

  /* ---------- NAME GATE ---------- */
  if (me && !name) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-[var(--cyan)]/40 p-8 text-center">
        <p className="text-3xl">🎮</p>
        <h2 className="font-display neon-text-cyan mt-4 text-lg">Pick a handle</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          No account, no email. Just a name to post under. It&apos;s stored in
          this browser only.
        </p>
        <input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && saveName()}
          maxLength={24}
          placeholder="VicePointVinny"
          className="mt-6 w-full rounded-md border border-white/15 bg-black/60 px-4 py-3 text-center text-sm text-white outline-none focus:border-[var(--cyan)]"
        />
        <button
          onClick={saveName}
          disabled={nameDraft.trim().length < 2}
          className="btn-primary mt-4 w-full rounded-md py-3 text-sm disabled:opacity-40"
        >
          Enter the forum
        </button>
      </div>
    );
  }

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] transition ${
      active
        ? 'border border-[var(--cyan)] text-[var(--cyan)] shadow-[0_0_14px_rgba(0,255,255,0.3)]'
        : 'border border-white/12 text-white/45 hover:text-white'
    }`;

  return (
    <>
      {/* ---------- COMPOSER ---------- */}
      <div className="glass mb-8 rounded-xl border border-white/12 p-5">
        <div className="mb-3 flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-black"
            style={{ background: 'var(--pink)' }}
          >
            {initials(name)}
          </span>
          <span className="text-sm text-white/70">{name}</span>
          <button
            onClick={() => {
              localStorage.removeItem('leonida-forum-name');
              setName('');
              setNameDraft('');
            }}
            className="ml-auto text-[10px] uppercase tracking-wider text-white/30 hover:text-white"
          >
            Change
          </button>
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="What's on your mind about Leonida?"
          className="w-full resize-none rounded-md border border-white/12 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--cyan)]"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition ${
                tag === t ? 'text-black' : 'border border-white/12 text-white/40 hover:text-white'
              }`}
              style={tag === t ? { background: TAG_COLORS[t] } : undefined}
            >
              {t}
            </button>
          ))}

          <span className="ml-auto text-[10px] text-white/25">{body.length}/1000</span>
          <button
            onClick={submit}
            disabled={posting || body.trim().length < 2}
            className="btn-primary rounded-md px-5 py-2 text-xs disabled:opacity-40"
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </div>

      {/* ---------- FILTERS ---------- */}
      <div className="chip-row mb-4 flex flex-wrap gap-2">
        <button onClick={() => setSort('new')} className={chip(sort === 'new')}>
          ⚡ New
        </button>
        <button onClick={() => setSort('top')} className={chip(sort === 'top')}>
          🔥 Top
        </button>
      </div>

      <div className="chip-row mb-8 flex flex-wrap gap-2">
        <button onClick={() => setTagFilter('All')} className={chip(tagFilter === 'All')}>
          All
        </button>
        {TAGS.map((t) => (
          <button key={t} onClick={() => setTagFilter(t)} className={chip(tagFilter === t)}>
            {t}
          </button>
        ))}
      </div>

      {/* ---------- FEED ---------- */}
      {loading && posts.length === 0 ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-white/25">
          Loading feed
        </p>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-12 text-center">
          <p className="text-3xl">👾</p>
          <p className="mt-4 text-sm text-white/45">
            Nothing here yet. Be the first to post.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {posts.map((p) => {
              const isLiked = liked.includes(p.id);
              const accent = TAG_COLORS[p.tag] ?? '#00FFFF';

              return (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-white/10 p-5 transition hover:border-white/25"
                >
                  <header className="mb-3 flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-black"
                      style={{ background: accent }}
                    >
                      {initials(p.author_name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {p.author_name}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-white/30">
                        {ago(p.created_at)}
                      </p>
                    </div>
                    <span
                      className="ml-auto rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider"
                      style={{ borderColor: `${accent}66`, color: accent }}
                    >
                      {p.tag}
                    </span>
                  </header>

                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
                    {p.body}
                  </p>

                  <footer className="mt-4 flex items-center gap-5 text-xs">
                    <button
                      onClick={() => like(p.id)}
                      className={`flex items-center gap-1.5 transition ${
                        isLiked ? 'text-[var(--pink)]' : 'text-white/35 hover:text-white'
                      }`}
                    >
                      <motion.span
                        animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isLiked ? '⚡' : '⚡'}
                      </motion.span>
                      {p.likes}
                    </button>

                    <button
                      onClick={() => openThread(p.id)}
                      className="flex items-center gap-1.5 text-white/35 transition hover:text-white"
                    >
                      💬 {p.comments}
                    </button>
                  </footer>

                  {/* Comments */}
                  <AnimatePresence>
                    {openComments === p.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                          {(comments[p.id] ?? []).map((c) => (
                            <div key={c.id} className="flex gap-3">
                              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] text-white/50">
                                {initials(c.author_name)}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs">
                                  <span className="font-semibold text-white">
                                    {c.author_name}
                                  </span>
                                  <span className="ml-2 text-white/25">
                                    {ago(c.created_at)}
                                  </span>
                                </p>
                                <p className="mt-0.5 whitespace-pre-wrap text-sm text-[var(--muted)]">
                                  {c.body}
                                </p>
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-2 pt-2">
                            <input
                              value={commentDraft}
                              onChange={(e) => setCommentDraft(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && sendComment(p.id)}
                              maxLength={500}
                              placeholder="Reply…"
                              className="flex-1 rounded-md border border-white/12 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-[var(--cyan)]"
                            />
                            <button
                              onClick={() => sendComment(p.id)}
                              disabled={!commentDraft.trim()}
                              className="btn-ghost rounded-md px-4 py-2 text-[11px] disabled:opacity-30"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
