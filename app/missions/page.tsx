import type { Metadata } from 'next';
import rawMissions from '@/data/missions.json';
import MissionsBrowser, { type Mission } from '@/components/MissionsBrowser';
import AdUnit from '@/components/AdUnit';

const data = rawMissions as {
  status: string;
  lastUpdated: string;
  chapters: string[];
  missions: Mission[];
};

const missions = data.missions.filter((m) => !m.id.startsWith('example-'));

export const metadata: Metadata = {
  title: 'GTA 6 Missions — Full List & Walkthroughs',
  description:
    'Every GTA 6 mission with objectives, gold medal requirements and what each one unlocks. Published the day the game launches.',
  alternates: { canonical: '/missions' },
};

export default function MissionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-8">
      <header className="mb-8">
        <h1 className="font-display neon-gradient text-3xl font-bold sm:text-5xl">
          Missions
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Every story mission in Grand Theft Auto VI — objectives, gold medal
          requirements, and what each one unlocks.
        </p>
      </header>

      <MissionsBrowser
        status={data.status}
        chapters={data.chapters}
        missions={missions}
        lastUpdated={data.lastUpdated}
      />

      <AdUnit slot="0000000009" format="horizontal" minHeight={90} />

      <section className="mt-12 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-display text-lg text-white">How this page will work</h2>
        <p>
          Missions get added as they&apos;re played, not as they&apos;re rumoured.
          Each entry will carry the objectives as the game states them, the gold
          medal conditions, who hands you the job, and a link to the district it
          takes place in.
        </p>
        <p>
          Summaries sit behind a spoiler toggle by default, so you can use the
          page for gold medals without having the story ruined.
        </p>
        <p className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs text-white/45">
          <strong className="text-white/65">On fake mission lists:</strong> every
          unreleased game attracts invented walkthroughs written for clicks. We
          publish nothing until it has been played, and anything uncertain is
          marked clearly.
        </p>
      </section>
    </div>
  );
}
