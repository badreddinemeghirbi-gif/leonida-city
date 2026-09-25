import Image from 'next/image';
import Link from 'next/link';
import rawLocations from '@/data/locations.json';
import type { Location } from '@/store/useStore';

const locations = rawLocations as Location[];

export default function LocationsGrid({ limit }: { limit?: number }) {
  const list = limit ? locations.slice(0, limit) : locations;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((loc, i) => (
        <Link
          key={loc.id}
          href={`/location/${loc.id}`}
          className="group overflow-hidden rounded-xl border border-white/10 transition duration-300 hover:border-[var(--cyan)] hover:shadow-[0_0_24px_rgba(0,255,255,0.25)]"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-[#0a0a0a]">
            <Image
              src={loc.cardThumbnail}
              alt={loc.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={i < 3}
              loading={i < 3 ? undefined : 'lazy'}
              quality={70}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          <div className="p-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
              {loc.county}
            </span>
            <h3
              className="font-display mt-1 text-base font-bold transition"
              style={{ color: loc.borderColor }}
            >
              {loc.icon} {loc.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
              {loc.lore}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
