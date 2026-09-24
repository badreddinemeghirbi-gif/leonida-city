import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How LEONIDA.CITY collects, uses, and protects your information, including cookies and advertising.',
  alternates: { canonical: '/privacy' },
};

/* ⚠️ Replace with a real address you actually monitor before launch. */
const CONTACT_EMAIL = 'contact@leonida.city';

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" subtitle="Last updated: September 2026">
      <p>
        This policy explains what information LEONIDA.CITY collects, why, and
        what you can do about it. It applies to everything at leonida.city.
      </p>

      <h2>Information we collect</h2>
      <p>
        <strong>Email addresses.</strong> If you sign up for launch alerts or the
        newsletter, we store the address you give us along with which type of
        updates you asked for and the date you signed up. That&apos;s all — no
        name, no phone number, no profile.
      </p>
      <p>
        <strong>Local browser storage.</strong> The site saves a few things in
        your own browser: which locations you&apos;ve starred, your chat history
        with the site&apos;s guide, and whether you&apos;ve dismissed the signup
        banner. This data stays on your device. We cannot read it and it is
        never sent to us.
      </p>
      <p>
        <strong>Standard server logs.</strong> Our hosting provider records
        normal request data — IP address, browser type, pages requested — as part
        of operating the service.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To send the updates you specifically asked to receive</li>
        <li>To keep the site working and diagnose problems</li>
        <li>To understand which pages people find useful</li>
      </ul>
      <p>
        We do not sell your email address. We do not share it with advertisers
        or data brokers.
      </p>

      <h2>Cookies and advertising</h2>
      <p>
        This site displays advertising to cover its costs. Third-party vendors,
        including Google, use cookies to serve ads based on your prior visits to
        this and other websites.
      </p>
      <p>
        Google&apos;s use of advertising cookies enables it and its partners to
        serve ads to you based on your visit to this site and other sites on the
        internet. You can opt out of personalised advertising by visiting{' '}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Ads Settings
        </a>
        . You can also opt out of third-party vendor cookies at{' '}
        <a
          href="https://www.aboutads.info"
          target="_blank"
          rel="noopener noreferrer"
        >
          aboutads.info
        </a>
        .
      </p>
      <p>
        Third-party ad networks may set their own cookies. We do not control
        those cookies and their use is governed by the relevant vendor&apos;s own
        privacy policy.
      </p>

      <h2>Your rights</h2>
      <p>
        If you are in the EU/EEA or the UK, the GDPR gives you the right to
        access, correct, delete, or export the personal data we hold about you,
        and to object to its processing. If you are in California, the CCPA gives
        you comparable rights, including the right to know what is collected and
        to request deletion.
      </p>
      <p>
        In practice, the only personal data we hold is an email address, and you
        can have it removed at any time by emailing us or using the unsubscribe
        link in any message we send.
      </p>

      <h2>Data retention</h2>
      <p>
        Email addresses are kept until you unsubscribe or ask for deletion.
        Server logs are retained by our hosting provider for a limited period
        under their standard policy.
      </p>

      <h2>Children</h2>
      <p>
        This site is not directed at children under 13, and we do not knowingly
        collect information from them. If you believe a child has submitted an
        email address, contact us and we will delete it.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes materially, the date at the top of this page will
        be updated. Continued use of the site after a change means you accept the
        revised policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy, or requests to delete your data:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </PageShell>
  );
}
