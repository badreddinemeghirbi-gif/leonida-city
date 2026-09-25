import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticle, getArticles } from '@/lib/news';
import AdUnit from '@/components/AdUnit';

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};

  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/news/${a.slug}` },
    openGraph: {
      title: a.title,
      description: a.excerpt,
      type: 'article',
      publishedTime: a.date,
      ...(a.cover && { images: [{ url: a.cover }] }),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const others = getArticles().filter((a) => a.slug !== article.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updated ?? article.date,
    publisher: { '@type': 'Organization', name: 'LEONIDA.CITY' },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/news"
        className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[var(--cyan)]"
      >
        ← All news
      </Link>

      <header className="mb-8 mt-6">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/35">
          <span className="rounded-full border border-[var(--pink)]/50 px-2.5 py-0.5 text-[var(--pink)]">
            {article.tag}
          </span>
          <span>{article.date}</span>
          <span>{article.readingMinutes} min read</span>
        </div>
        <h1 className="font-display neon-gradient mt-4 text-3xl font-bold leading-tight sm:text-4xl">
          {article.title}
        </h1>
      </header>

      {article.cover && (
        <div className="relative mb-8 aspect-video overflow-hidden rounded-xl border border-white/10">
          <Image src={article.cover} alt={article.title} fill priority sizes="768px" className="object-cover" />
        </div>
      )}

      <article
        className="article-body text-sm leading-relaxed text-[var(--muted)]"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />

      <style>{`
        .article-body h2 { font-family: var(--font-display); color:#fff; font-size:1.125rem; margin:2.5rem 0 .75rem; text-transform:uppercase; letter-spacing:.04em; }
        .article-body h3 { color:#fff; font-size:1rem; margin:2rem 0 .5rem; }
        .article-body p { margin-bottom:1rem; }
        .article-body ul, .article-body ol { margin:1rem 0 1rem 1.25rem; }
        .article-body li { list-style:disc; margin-bottom:.5rem; }
        .article-body a { color: var(--cyan); text-decoration: underline; }
        .article-body strong { color:#fff; }
        .article-body blockquote { border-left:2px solid var(--pink); padding-left:1rem; font-style:italic; color:var(--cyan); margin:1.5rem 0; }
      `}</style>

      <AdUnit slot="0000000007" format="horizontal" minHeight={90} />

      {others.length > 0 && (
        <>
          <h2 className="font-display mt-12 text-lg text-white">More reading</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/news/${o.slug}`}
                className="group rounded-lg border border-white/10 p-4 transition hover:border-[var(--cyan)]"
              >
                <span className="text-[10px] uppercase tracking-wider text-white/35">{o.tag}</span>
                <p className="mt-2 text-sm font-semibold text-white group-hover:text-[var(--cyan)]">
                  {o.title}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
