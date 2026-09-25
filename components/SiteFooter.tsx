import Link from 'next/link';

const SOCIALS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/leonidathecity/',
    color: '#FF1493',
    path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.08 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.38.66-.66 1.08-1.33 1.38-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.12C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm7.85-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@leonida.city8',
    color: '#00FFFF',
    path: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.89-4.49V9.4a6.33 6.33 0 00-5.2 10.24 6.34 6.34 0 0011.14-4.02V8.69a8.16 8.16 0 004.65 1.49V6.73a4.85 4.85 0 01-1.06-.04z',
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/cityofleonida',
    color: '#A100F2',
    path: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z',
  },
];

const NAV = [
  ['/map', 'Map'],
  ['/locations', 'Locations'],
  ['/gallery', 'Gallery'],
  ['/cheats', 'Cheats'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10 px-4 py-10 text-center">
      {/* Hover glow uses the --brand variable set on each link */}
      <style>{`
        .social-link { border-color: rgba(255,255,255,0.12); }
        .social-link svg { fill: rgba(255,255,255,0.45); transition: fill .3s; }
        .social-link:hover { border-color: var(--brand); box-shadow: 0 0 18px color-mix(in srgb, var(--brand) 45%, transparent); }
        .social-link:hover svg { fill: var(--brand); }
      `}</style>

      <div className="mb-8 flex items-center justify-center gap-5">
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            title={s.name}
            className="social-link flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:scale-110"
            style={{ ['--brand' as string]: s.color }}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
              <path d={s.path} />
            </svg>
          </a>
        ))}
      </div>

      <nav className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-[0.2em] text-white/45">
        {NAV.map(([href, label]) => (
          <Link key={href} href={href} className="transition hover:text-[var(--cyan)]">
            {label}
          </Link>
        ))}
      </nav>

      <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-white/35">
        LEONIDA.CITY is an independent, unofficial fan site. It is not affiliated
        with, endorsed by, or associated with Rockstar Games, Take-Two
        Interactive, or any of their subsidiaries. Grand Theft Auto and all
        related marks are trademarks of their respective owners. All artwork on
        this site is original and AI-generated; all written lore is fan-created
        speculation, not official game content.
      </p>

      <p className="mt-4 text-[11px] text-white/25">
        © {new Date().getFullYear()} LEONIDA.CITY
      </p>
    </footer>
  );
}
