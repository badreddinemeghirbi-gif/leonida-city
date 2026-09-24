import Link from 'next/link';

export default function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-8">
      <Link
        href="/"
        className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[var(--cyan)]"
      >
        ← Back to the map
      </Link>

      <header className="mb-10 mt-8">
        <h1 className="font-display neon-gradient text-3xl font-bold sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{subtitle}</p>
        )}
      </header>

      <article className="space-y-6 text-sm leading-relaxed text-[var(--muted)] [&_a]:text-[var(--cyan)] [&_a]:underline [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-white">
        {children}
      </article>
    </div>
  );
}
