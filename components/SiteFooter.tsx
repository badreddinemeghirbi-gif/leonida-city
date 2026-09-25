import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10 px-4 py-10 text-center">
      <nav className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-[0.2em] text-white/45">
        <Link href="/map" className="transition hover:text-[var(--cyan)]">Map</Link>
        <Link href="/locations" className="transition hover:text-[var(--cyan)]">Locations</Link>
        <Link href="/gallery" className="transition hover:text-[var(--cyan)]">Gallery</Link>
        <Link href="/cheats" className="transition hover:text-[var(--cyan)]">Cheats</Link>
        <Link href="/about" className="transition hover:text-[var(--cyan)]">About</Link>
        <Link href="/contact" className="transition hover:text-[var(--cyan)]">Contact</Link>
        <Link href="/privacy" className="transition hover:text-[var(--cyan)]">Privacy</Link>
        <Link href="/terms" className="transition hover:text-[var(--cyan)]">Terms</Link>
      </nav>

      <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-white/35">
        LEONIDA.CITY is an independent, unofficial fan site. It is not affiliated
        with, endorsed by, or associated with Rockstar Games, Take-Two
        Interactive, or any of their subsidiaries. Grand Theft Auto and all
        related marks are trademarks of their respective owners. All artwork on
        this site is original and AI-generated; all written lore is fan-created
        speculation, not official game content.
      </p>

      <p className="mt-4 text-[11px] text-white/25">© {new Date().getFullYear()} LEONIDA.CITY</p>
    </footer>
  );
}
