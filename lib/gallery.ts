import fs from 'fs';
import path from 'path';
import rawMeta from '@/data/albums.json';

/**
 * Reads public/gallery/ at BUILD time. Drop files into a folder, push,
 * and they show up — no code or JSON changes needed for routine updates.
 *
 *   public/gallery/
 *     2026-09-25/          <- one folder per album
 *       skyline.png
 *       beach-loop.mp4
 *     characters/
 *       lucia.png
 *
 * Optional: give an album a nicer title in data/albums.json.
 */

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov']);

const ROOT = path.join(process.cwd(), 'public', 'gallery');

const meta = rawMeta as Record<
  string,
  { title?: string; description?: string } | undefined
>;

export type MediaItem = {
  src: string;
  type: 'photo' | 'video';
  album: string;
  albumTitle: string;
  caption: string;
};

export type Album = {
  slug: string;
  title: string;
  description?: string;
  count: number;
  cover: MediaItem | null;
  items: MediaItem[];
};

/** "2026-09-25" -> "25 September 2026"; "ocean-beach" -> "Ocean Beach" */
function prettify(slug: string): string {
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(slug);
  if (date) {
    const d = new Date(`${slug}T00:00:00Z`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  }
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function fileToItem(
  fileName: string,
  albumSlug: string,
  albumTitle: string
): MediaItem | null {
  const ext = path.extname(fileName).toLowerCase();
  const isImage = IMAGE_EXT.has(ext);
  const isVideo = VIDEO_EXT.has(ext);
  if (!isImage && !isVideo) return null;

  return {
    src: `/gallery/${albumSlug}/${encodeURIComponent(fileName)}`,
    type: isImage ? 'photo' : 'video',
    album: albumSlug,
    albumTitle,
    caption: prettify(path.basename(fileName, ext)),
  };
}

export function getAlbums(): Album[] {
  if (!fs.existsSync(ROOT)) return [];

  const dirs = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('_'));

  const albums: Album[] = dirs.map((dir) => {
    const slug = dir.name;
    const title = meta[slug]?.title ?? prettify(slug);

    const items = fs
      .readdirSync(path.join(ROOT, slug))
      .filter((f) => !f.startsWith('.'))
      .sort()
      .map((f) => fileToItem(f, slug, title))
      .filter((x): x is MediaItem => x !== null);

    return {
      slug,
      title,
      description: meta[slug]?.description,
      count: items.length,
      cover: items.find((i) => i.type === 'photo') ?? items[0] ?? null,
      items,
    };
  });

  // Newest folder first — date-named albums sort correctly this way
  return albums.filter((a) => a.count > 0).sort((a, b) => b.slug.localeCompare(a.slug));
}

export function getAllItems(): MediaItem[] {
  return getAlbums().flatMap((a) => a.items);
}
