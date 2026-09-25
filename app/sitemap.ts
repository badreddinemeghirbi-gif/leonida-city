import type { MetadataRoute } from 'next';
import rawLocations from '@/data/locations.json';
import { getArticles } from '@/lib/news';
import type { Location } from '@/store/useStore';

const locations = rawLocations as Location[];
const BASE = 'https://leonida.city';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/map`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/locations`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...locations.map((l) => ({
      url: `${BASE}/location/${l.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${BASE}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...getArticles().map((a) => ({
      url: `${BASE}/news/${a.slug}`,
      lastModified: new Date(a.updated ?? a.date),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    { url: `${BASE}/forum`, lastModified: now, changeFrequency: 'hourly', priority: 0.7 },
    { url: `${BASE}/gallery`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/cheats`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
