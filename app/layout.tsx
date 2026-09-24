import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ClientChrome from '@/components/ClientChrome';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL('https://leonida.city'),
  title: {
    default: 'LEONIDA.CITY — Your Vice City Companion | GTA 6',
    template: '%s | LEONIDA.CITY',
  },
  description:
    'Explore Vice City like never before. Interactive map, location lore, AI guide, countdown timer, and exclusive GTA 6 content.',
  keywords: ['GTA 6', 'Vice City', 'Leonida', 'GTA VI', 'game guide', 'interactive map', 'game companion'],
  authors: [{ name: 'LEONIDA.CITY' }],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'LEONIDA.CITY — Explore Vice City',
    description: 'The ultimate GTA 6 companion. Interactive map, AI chatbot, exclusive lore.',
    url: 'https://leonida.city',
    siteName: 'LEONIDA.CITY',
    type: 'website',
    images: [{ url: '/images/map-high.png', width: 1200, height: 630, alt: 'Map of Leonida State' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LEONIDA.CITY — Your Vice City Companion',
    description: 'Explore Vice City with our interactive map and AI guide.',
    images: ['/images/map-high.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-black text-white antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <ClientChrome />

        {ADSENSE_CLIENT && (
          <Script
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
