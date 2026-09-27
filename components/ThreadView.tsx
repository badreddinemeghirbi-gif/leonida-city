'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, ago } from '@/components/ForumFeed';

type Comment = {
  id: number;
  author_id: string;
  handle: string;
  body: string;
  created_at: string;
};

type Post = {
  id: number;
  author_id: string;
  handle: string;
  title: string;
  body: string;
  tag: string;
  created_at: string;
  votes: number;
};

export default function ThreadView({
  post,
  initialComments,
  initialVoted,
}: {
  post: Post;
  initialComments: Comment[];
  initialVoted: boolean;
}) {
  const { data: session, status } = useSession();
  const signedIn = status === 'authenticated';
  const router = useRouter();

  const [comments, setComments] = useState(initialComments);
  const [votes, setVotes] = useState(post.votes);
  const [voted, setVoted] = useState(initialVoted);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const isMod = session?.user?.role === 'mod' || session?.user?.role === 'admin';
  const ownsPost = session?.user?.id === post.author_id;

  /* Re-check the vote state once the session resolves client-side */
  useEffect(() => setVoted(initialVoted), [initialVoted]);

  const act = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/forum/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Something went wrong.');
    return data;
  };

  const vote = async () => {
    if (!signedIn) return signIn();
    const had = voted;
    setVoted(!had);
    setVotes((v) => v + (had ? -1 : 1));
    try {
      const data = await act({ action: 'vote', postId: post.id });
      setVotes(data.votes);
      setVoted(data.voted);
    } catch {
      setVoted(had);
      setVotes((v) => v + (had ? 1 : -1));
    }
  };

  const send = async () => {
    if (!signedIn) return signIn();
    if (!draft.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      const data = await act({ action: 'comment', postId: post.id, body: draft });
      setComments(data.comments);
      setDraft('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reply.');
    } finally {
      setSending(false);
    }
  };

  const removeComment = async (commentId: number) => {
    try {
      const data = await act({ action: 'removeComment', commentId, postId: post.id });
      setComments(data.comments);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove.');
    }
  };

  const removeThread = async () => {
    try {
      await act({ action: 'removePost', postId: post.id });
      router.push('/forum');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove.');
    }
  };

  return (
    <>
      <article className="rounded-xl border border-white/12 p-5 sm:p-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1 pt-1">
            <button
              onClick={vote}
              aria-label="Upvote"
              className={`text-xl leading-none transition ${
                voted ? 'text-[var(--pink)]' : 'text-white/25 hover:text-white'
              }`}
            >
              ▲
            </button>
            <span className={`text-sm font-bold ${voted ? 'text-[var(--pink)]' : 'text-white/45'}`}>
              {votes}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-3">
              <Avatar handle={post.handle} size={32} />
              <div>
                <p className="text-sm font-semibold text-white">{post.handle}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/30">
                  {ago(post.created_at)} · {post.tag}
                </p>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
              {post.body}
            </p>

            <div className="mt-5 flex items-center gap-4 text-[11px]">
              {(ownsPost || isMod) && (
                <button onClick={removeThread} className="text-white/30 transition hover:text-red-400">
                  Delete thread
                </button>
              )}
              {signedIn && !ownsPost && (
                <button
                  onClick={() => act({ action: 'report', postId: post.id }).catch(() => {})}
                  className="text-white/25 transition hover:text-amber-400"
                >
                  Report
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      <h2 className="font-display mt-10 text-sm uppercase tracking-[0.2em] text-white/50">
        {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
      </h2>

      {/* Composer */}
      <div className="mt-4 rounded-xl border border-white/12 p-4">
        {signedIn ? (
          <>
            <div className="mb-3 flex items-center gap-2">
              <Avatar handle={session.user.handle} size={26} />
              <span className="text-xs text-white/50">{session.user.handle}</span>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Add a reply…"
              className="w-full resize-none rounded-md border border-white/12 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--cyan)]"
            />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[10px] text-white/25">{draft.length}/1000</span>
              <button
                onClick={send}
                disabled={sending || !draft.trim()}
                className="btn-primary ml-auto rounded-md px-5 py-2.5 text-xs disabled:opacity-40"
              >
                {sending ? 'Sending…' : 'Reply'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex-1 text-sm text-[var(--muted)]">Sign in to join the thread.</p>
            <button onClick={() => signIn('discord')} className="btn-ghost rounded-md px-4 py-2.5 text-xs">
              Discord
            </button>
            <button onClick={() => signIn('google')} className="btn-ghost rounded-md px-4 py-2.5 text-xs">
              Google
            </button>
          </div>
        )}
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </div>

      {/* Replies */}
      <div className="mt-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {comments.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 rounded-lg border border-white/8 p-4"
            >
              <Avatar handle={c.handle} size={30} />
              <div className="min-w-0 flex-1">
                <p className="text-xs">
                  <span className="font-semibold text-white">{c.handle}</span>
                  <span className="ml-2 text-white/25">{ago(c.created_at)}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
                  {c.body}
                </p>
                {(isMod || session?.user?.id === c.author_id) && (
                  <button
                    onClick={() => removeComment(c.id)}
                    className="mt-2 text-[10px] text-white/25 transition hover:text-red-400"
                  >
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
