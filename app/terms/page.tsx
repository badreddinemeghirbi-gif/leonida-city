import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'The terms governing your use of LEONIDA.CITY, including content ownership and disclaimers.',
  alternates: { canonical: '/terms' },
};

const CONTACT_EMAIL = 'contact@leonida.city';

export default function TermsPage() {
  return (
    <PageShell title="Terms of Use" subtitle="Last updated: September 2026">
      <p>
        By using leonida.city you agree to these terms. If you don&apos;t agree
        with them, please don&apos;t use the site.
      </p>

      <h2>What this site is</h2>
      <p>
        LEONIDA.CITY is an independent fan site about Grand Theft Auto VI. It is
        provided free of charge, for entertainment and informational purposes.
      </p>

      <h2>No affiliation with Rockstar Games</h2>
      <p>
        This site is not affiliated with, endorsed by, sponsored by, or in any
        way officially connected to Rockstar Games, Take-Two Interactive, or any
        of their subsidiaries or affiliates. Grand Theft Auto, GTA, Vice City,
        and related names and marks are trademarks of their respective owners
        and are used here only to identify the subject matter of the site.
      </p>

      <h2>Accuracy</h2>
      <p>
        Much of what appears on this site is speculation. Release dates,
        features, locations, and story details about an unreleased game are
        subject to change and may be wrong. Nothing here should be treated as
        confirmed information unless it is explicitly identified as coming from
        an official source. We make no warranty as to accuracy or completeness.
      </p>

      <h2>Our content</h2>
      <p>
        The written lore, guides, and original AI-generated artwork on this site
        are our own work. You&apos;re welcome to quote short excerpts with a link
        back. Republishing pages wholesale, or scraping the site to train models
        or populate another site, is not permitted.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Don&apos;t attempt to disrupt, overload, or gain unauthorised access to the site</li>
        <li>Don&apos;t use automated tools to scrape content at scale</li>
        <li>Don&apos;t submit email addresses that aren&apos;t yours</li>
      </ul>

      <h2>External links and advertising</h2>
      <p>
        This site links to third-party websites and displays third-party
        advertising. We don&apos;t control that content and aren&apos;t
        responsible for it. Visiting a linked site is at your own risk and
        subject to that site&apos;s own terms.
      </p>

      <h2>No warranty</h2>
      <p>
        The site is provided &ldquo;as is&rdquo;, without warranties of any kind.
        We don&apos;t guarantee it will be available, error-free, or suitable for
        any particular purpose. To the maximum extent permitted by law, we are
        not liable for any loss arising from your use of the site.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated. The date at the top of the page will reflect
        the most recent revision.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms, or a takedown request:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </PageShell>
  );
}
