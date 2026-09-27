import type { Metadata } from 'next';
import ForumFeed from '@/components/ForumFeed';
import AdUnit from '@/components/AdUnit';
import { stats } from '@/lib/forum';
import { topMembers } from '@/lib/users';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Forum — Leonida Community',
  description:
    'The GTA 6 community forum. Theories, leaks, gameplay talk and art — sign in with Discord or Google.',
  alternates: { canonical: '/forum' },
  /* Unlisted while AdSense review is pending — delete this line to index it */
  robots: { index: false, follow: false },
};

export default async function ForumPage() {
  const [counts, members] = await Promise.all([
    stats().catch(() => ({ posts: 0, comments: 0, members: 0 })),
    topMembers(6).catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-8">
      <header className="mb-8">
        <h1 className="font-display neon-gradient text-3xl font-bold sm:text-5xl">
          The Forum
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Theories, leaks, gameplay talk, art, arguments. Sign in and you get a
          random Leonida handle — nobody sees your real name.
        </p>

        <div className="mt-5 flex gap-6 text-xs text-white/35">
          <span><strong className="text-[var(--cyan)]">{counts.posts}</strong> threads</span>
          <span><strong className="text-[var(--cyan)]">{counts.comments}</strong> replies</span>
          <span><strong className="text-[var(--cyan)]">{counts.members}</strong> citizens</span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div>
          <ForumFeed />
          <AdUnit slot="0000000008" format="horizontal" minHeight={90} />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl border border-white/10 p-4">
              <h2 className="font-display mb-4 text-xs uppercase tracking-[0.2em] text-white/50">
                Top citizens
              </h2>
              {members.length === 0 ? (
                <p className="text-xs text-white/25">Nobody yet.</p>
              ) : (
                <ol className="space-y-3">
                  {members.map((m, i) => (
                    <li key={m.handle} className="flex items-center gap-3 text-xs">
                      <span className="w-4 text-white/25">{i + 1}</span>
                      <span className="truncate text-white/70">{m.handle}</span>
                      <span className="ml-auto text-[var(--pink)]">{m.karma}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="rounded-xl border border-white/10 p-4 text-[11px] leading-relaxed text-white/35">
              <h2 className="font-display mb-3 text-xs uppercase tracking-[0.2em] text-white/50">
                House rules
              </h2>
              <ul className="space-y-2">
                <li>Keep it civil.</li>
                <li>No spam or self-promo.</li>
                <li>No piracy or illegal content.</li>
                <li>No doxxing. Ever.</li>
                <li>Tag leaks as Leaks.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
