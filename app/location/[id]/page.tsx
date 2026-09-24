import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import rawLocations from '@/data/locations.json';
import rawGuides from '@/data/guides.json';
import type { Location } from '@/store/useStore';
import LocationMedia from '@/components/LocationMedia';
import AskRicoCTA from '@/components/AskRicoCTA';
import AdUnit from '@/components/AdUnit';

const locations = rawLocations as Location[];

type Guide = {
  whatToExpect: string[];
  insiderNotes: string;
  faq: { q: string; a: string }[];
};
const guides = rawGuides as Record<string, Guide>;

/* All 12 pre-rendered at build time — no server work per request */
export function generateStaticParams() {
  return locations.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const loc = locations.find((l) => l.id === id);
  if (!loc) return {};

  return {
    title: `${loc.name} — Location Guide`,
    description: loc.lore,
    alternates: { canonical: `/location/${loc.id}` },
    openGraph: {
      title: `${loc.name} — LEONIDA.CITY`,
      description: loc.lore,
      url: `/location/${loc.id}`,
      images: [{ url: loc.heroImage, width: 1200, height: 630, alt: loc.name }],
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loc = locations.find((l) => l.id === id);
  if (!loc) notFound();

  const guide = guides[loc.id];
  const idx = locations.findIndex((l) => l.id === loc.id);
  const prev = locations[(idx - 1 + locations.length) % locations.length];
  const next = locations[(idx + 1) % locations.length];
  const others = locations.filter((l) => l.id !== loc.id).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${loc.name} — Location Guide`,
    description: loc.lore,
    image: `https://leonida.city${loc.heroImage}`,
    publisher: { '@type': 'Organization', name: 'LEONIDA.CITY' },
    ...(guide && {
      mainEntity: {
        '@type': 'FAQPage',
        mainEntity: guide.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    }),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/locations"
        className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[var(--cyan)]"
      >
        ← All locations
      </Link>

      <header className="mb-8 mt-6">
        <span className="text-xs uppercase tracking-[0.25em] text-white/35">
          {loc.county}
        </span>
        <h1
          className="font-display mt-2 text-3xl font-bold sm:text-5xl"
          style={{ color: loc.borderColor, textShadow: `0 0 20px ${loc.borderColor}77` }}
        >
          {loc.icon} {loc.name}
        </h1>
      </header>

      {/* Video + photo gallery */}
      <LocationMedia location={loc} />

      <p
        className="mb-8 border-l-2 pl-4 text-base italic leading-relaxed"
        style={{ borderColor: loc.glowColor, color: loc.glowColor }}
      >
        {loc.lore}
      </p>

      <p className="text-sm leading-relaxed text-[var(--muted)]">
        {loc.fullDescription}
      </p>

      {guide && (
        <>
          <h2 className="font-display mt-12 text-lg text-white">What to expect</h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            {guide.whatToExpect.map((item) => (
              <li key={item} className="ml-5 list-disc">
                {item}
              </li>
            ))}
          </ul>

          <AdUnit slot="0000000004" format="horizontal" minHeight={90} />

          <h2 className="font-display mt-12 text-lg text-white">Field notes</h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            {guide.insiderNotes}
          </p>

          <h2 className="font-display mt-12 text-lg text-white">Frequently asked</h2>
          <div className="mt-4 space-y-6">
            {guide.faq.map((f) => (
              <div key={f.q}>
                <p className="font-semibold text-white">{f.q}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{f.a}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Chatbot entry point */}
      <AskRicoCTA name={loc.name} accent={loc.borderColor} />

      <p className="mt-12 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-white/40">
        <strong className="text-white/60">Note:</strong> the lore and field notes
        on this page are fan-written speculation, not official Rockstar Games
        content. Details about the game are unconfirmed until release.
      </p>

      {/* Prev / next */}
      <nav className="mt-12 flex items-stretch gap-4">
        <Link
          href={`/location/${prev.id}`}
          className="flex-1 rounded-lg border border-white/10 p-4 transition hover:border-[var(--cyan)]"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
            ← Previous
          </span>
          <p className="mt-1 text-sm font-semibold text-white">
            {prev.icon} {prev.name}
          </p>
        </Link>
        <Link
          href={`/location/${next.id}`}
          className="flex-1 rounded-lg border border-white/10 p-4 text-right transition hover:border-[var(--cyan)]"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
            Next →
          </span>
          <p className="mt-1 text-sm font-semibold text-white">
            {next.icon} {next.name}
          </p>
        </Link>
      </nav>

      <h2 className="font-display mt-14 text-lg text-white">Explore nearby</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {others.map((o) => (
          <Link
            key={o.id}
            href={`/location/${o.id}`}
            className="group rounded-lg border border-white/10 p-4 transition hover:border-[var(--cyan)]"
          >
            <span className="text-lg">{o.icon}</span>
            <p className="mt-2 text-sm font-semibold text-white group-hover:text-[var(--cyan)]">
              {o.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
