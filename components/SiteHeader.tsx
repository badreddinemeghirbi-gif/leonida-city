'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/map', label: 'Map' },
  { href: '/locations', label: 'Locations' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/cheats', label: 'Cheats' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /* Header tightens and darkens once you scroll past the fold */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close the mobile menu on navigation */
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-[var(--cyan)]/25 py-2'
          : 'border-b border-transparent py-4'
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span
            className="font-display neon-gradient text-lg font-bold tracking-wider sm:text-xl"
            style={{ transition: 'filter .3s' }}
          >
            LEONIDA
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-white/30 sm:inline">
            .city
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
                  active ? 'text-[var(--cyan)]' : 'text-white/55 hover:text-white'
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full"
                    style={{
                      background: 'var(--cyan)',
                      boxShadow: '0 0 10px var(--cyan)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}

          <Link
            href="/map"
            className="btn-primary ml-3 rounded-md px-4 py-2 text-[11px]"
          >
            Explore Map
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <motion.span
            animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="block h-[2px] w-5 bg-[var(--cyan)]"
          />
          <motion.span
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            className="block h-[2px] w-5 bg-[var(--cyan)]"
          />
          <motion.span
            animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="block h-[2px] w-5 bg-[var(--cyan)]"
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="glass overflow-hidden border-t border-[var(--cyan)]/20 md:hidden"
          >
            <div className="flex flex-col px-4 py-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border-b border-white/5 py-3 text-sm uppercase tracking-[0.18em] last:border-0 ${
                    isActive(item.href) ? 'text-[var(--cyan)]' : 'text-white/60'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
