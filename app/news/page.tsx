import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getArticles } from '@/lib/news';
import AdUnit from '@/components/AdUnit';

export const metadata: Metadata = {
  title: 'News & Guides',
  description:
    'GTA 6 news, release date tracking, and guides — clearly separating confirmed information from speculation.',
  alternates: { canonical: '/news' },
};

export default function NewsIndex() {
  const articles = getArticles();

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-8">
      <header className="mb-10">
        <h1 className="font-display neon-gradient text-3xl font-bold sm:text-5xl">
          News &amp; Guides
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          What&apos;s confirmed, what isn&apos;t, and why the difference matters.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/20 p-10 text-center text-sm text-white/40">
          Nothing published yet.
        </p>
      ) : (
        <div className="space-y-5">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/news/${a.slug}`}
              className="group block overflow-hidden rounded-xl border border-white/10 transition hover:border-[var(--cyan)] hover:shadow-[0_0_20px_rgba(0,255,255,0.18)]"
            >
              <div className="flex flex-col sm:flex-row">
                {a.cover && (
                  <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-56">
                    <Image
                      src={a.cover}
                      alt={a.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 224px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/35">
                    <span className="rounded-full border border-[var(--pink)]/50 px-2.5 py-0.5 text-[var(--pink)]">
                      {a.tag}
                    </span>
                    <span>{a.date}</span>
                    <span>{a.readingMinutes} min</span>
                  </div>
                  <h2 className="font-display mt-3 text-lg font-bold text-white group-hover:text-[var(--cyan)]">
                    {a.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {a.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AdUnit slot="0000000007" format="horizontal" minHeight={90} />
    </div>
  );
}
