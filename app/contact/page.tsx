import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with LEONIDA.CITY about corrections, suggestions, partnerships, or takedown requests.',
  alternates: { canonical: '/contact' },
};

/* ⚠️ Replace with a real address you actually monitor before launch. */
const CONTACT_EMAIL = 'contact@leonida.city';

export default function ContactPage() {
  return (
    <PageShell
      title="Contact"
      subtitle="Corrections, suggestions, and complaints all land in the same inbox."
    >
      <p>
        LEONIDA.CITY is run by one person, so replies aren&apos;t instant — but
        every message gets read.
      </p>

      <div className="my-8 rounded-xl border border-[var(--cyan)]/40 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
          Email
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-display neon-text-cyan mt-3 inline-block text-lg font-bold"
        >
          {CONTACT_EMAIL}
        </a>
      </div>

      <h2>What to write about</h2>
      <ul>
        <li>
          <strong>Corrections.</strong> If something on the site is wrong,
          especially if we&apos;ve presented speculation as fact, tell us. These
          get priority.
        </li>
        <li>
          <strong>Suggestions.</strong> Locations, guides, or features you want
          to see.
        </li>
        <li>
          <strong>Advertising and partnerships.</strong> Include what you have in
          mind and who you represent.
        </li>
        <li>
          <strong>Copyright and takedown requests.</strong> If you hold rights to
          something you believe appears here, email us with the specifics and
          we&apos;ll respond promptly.
        </li>
      </ul>

      <h2>Data requests</h2>
      <p>
        To have your email address removed from our list, use the unsubscribe
        link in any message, or email the address above with
        &ldquo;delete&rdquo; in the subject line. See our{' '}
        <a href="/privacy">privacy policy</a> for details.
      </p>
    </PageShell>
  );
}
