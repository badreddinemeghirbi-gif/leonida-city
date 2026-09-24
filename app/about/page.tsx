import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'About',
  description:
    'What LEONIDA.CITY is, who makes it, and how we handle speculation versus confirmed information about GTA 6.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <PageShell
      title="About"
      subtitle="An independent fan project built around the state of Leonida."
    >
      <p>
        LEONIDA.CITY is a companion site for Grand Theft Auto VI, built and
        maintained by a single developer. It exists because the wait for a game
        like this is long, and the community that forms in that gap tends to be
        more interesting than the marketing.
      </p>

      <h2>What&apos;s here</h2>
      <p>
        An interactive map of the state of Leonida with twelve districts, each
        with its own guide page. A countdown to release. A chatbot in the voice
        of a local. Over time, more: strategy guides, release tracking, and
        whatever else turns out to be useful once the game is actually out.
      </p>

      <h2>What&apos;s real and what isn&apos;t</h2>
      <p>
        This matters, so it gets its own section. Very little about GTA VI has
        been officially confirmed. The lore, field notes, and district
        descriptions on this site are <strong>fan-written fiction</strong> —
        original writing inspired by the series, not leaked or insider
        information.
      </p>
      <p>
        Where something is genuinely known, it&apos;s stated plainly. Where
        it&apos;s speculation, it&apos;s labelled as speculation. The site will
        never present a rumour as a fact to get a click, and pages get corrected
        when real information contradicts them.
      </p>

      <h2>The artwork</h2>
      <p>
        All imagery on this site is original and AI-generated. None of it is
        taken from Rockstar Games&apos; trailers, screenshots, or promotional
        material. It&apos;s an interpretation of an aesthetic, not a
        reproduction of assets.
      </p>

      <h2>Not affiliated with Rockstar Games</h2>
      <p>
        LEONIDA.CITY is unofficial and has no relationship with Rockstar Games
        or Take-Two Interactive. Grand Theft Auto is their trademark. This site
        is a fan work, made out of enthusiasm for the series, and makes no claim
        to their intellectual property.
      </p>

      <h2>How it&apos;s funded</h2>
      <p>
        The site is free to use. Running costs are covered by display
        advertising. There is no paywall on any guide, and no content is written
        or altered because an advertiser asked for it.
      </p>

      <h2>Get in touch</h2>
      <p>
        Corrections, ideas, and complaints are all welcome — see the{' '}
        <a href="/contact">contact page</a>.
      </p>
    </PageShell>
  );
}
