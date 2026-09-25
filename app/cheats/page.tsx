import type { Metadata } from 'next';
import rawCheats from '@/data/cheats.json';
import CheatsBrowser, { type Cheat } from '@/components/CheatsBrowser';
import AdUnit from '@/components/AdUnit';

const data = rawCheats as {
  status: string;
  lastUpdated: string;
  categories: string[];
  codes: Cheat[];
};

/* Drop the placeholder row so the page shows the waiting state until
   you add real entries to data/cheats.json */
const codes = data.codes.filter((c) => !c.id.startsWith('example-'));

export const metadata: Metadata = {
  title: 'GTA 6 Cheat Codes',
  description:
    'Every confirmed GTA 6 cheat code for PlayStation, Xbox and PC — tested before listing. No made-up codes.',
  alternates: { canonical: '/cheats' },
};

export default function CheatsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-8">
      <header className="mb-8">
        <h1 className="font-display neon-gradient text-3xl font-bold sm:text-5xl">
          Cheat Codes
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Confirmed cheat codes for Grand Theft Auto VI, sorted by platform and
          category. Every code is tested before it goes on this page.
        </p>
      </header>

      <CheatsBrowser
        status={data.status}
        categories={data.categories}
        codes={codes}
        lastUpdated={data.lastUpdated}
      />

      <AdUnit slot="0000000005" format="horizontal" minHeight={90} />

      <section className="mt-12 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-display text-lg text-white">How cheat codes work</h2>
        <p>
          In previous entries in the series, cheats are entered as button
          sequences on console or typed into an in-game phone or console command
          line on PC. They typically disable achievements or trophies for that
          save, and most do not persist after a reload.
        </p>
        <p>
          Using cheats in online modes has historically resulted in bans. Nothing
          on this page is intended for use in multiplayer.
        </p>
        <p className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs text-white/45">
          <strong className="text-white/65">A word on fake cheats:</strong> every
          major game launch brings a wave of invented codes posted for clicks. We
          don&apos;t publish a code until it has been tested, and we mark
          anything unconfirmed clearly.
        </p>
      </section>
    </div>
  );
}
