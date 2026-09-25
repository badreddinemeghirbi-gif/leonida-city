import type { Metadata } from 'next';
import ForumFeed from '@/components/ForumFeed';
import AdUnit from '@/components/AdUnit';

export const metadata: Metadata = {
  title: 'Forum — Leonida Community',
  description:
    'Talk GTA 6 with other players. Theories, gameplay, art, and everything in between.',
  alternates: { canonical: '/forum' },
};

export default function ForumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-8">
      <header className="mb-8">
        <h1 className="font-display neon-gradient text-3xl font-bold sm:text-5xl">
          The Forum
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Theories, gameplay talk, art, arguments. Pick a handle and jump in —
          no account needed.
        </p>
      </header>

      <ForumFeed />

      <AdUnit slot="0000000008" format="horizontal" minHeight={90} />

      <p className="mt-10 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-white/40">
        <strong className="text-white/60">House rules:</strong> keep it civil, no
        spam, no doxxing, nothing illegal. Posts that break these get removed.
        Everything here is written by visitors and doesn&apos;t represent
        LEONIDA.CITY.
      </p>
    </div>
  );
}
