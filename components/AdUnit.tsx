'use client';

import { useEffect, useRef } from 'react';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  minHeight?: number;
  className?: string;
}

export default function AdUnit({
  slot,
  format = 'auto',
  minHeight = 90,
  className = '',
}: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || pushed.current) return;
    // React Strict Mode fires effects twice in dev — pushing the same slot
    // twice makes AdSense throw "already have ads in them".
    pushed.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  /* No publisher ID yet: reserve the space so the layout doesn't shift
     the day ads go live, and show a marker in dev only. */
  if (!ADSENSE_CLIENT) {
    return (
      <div
        className={`ad-slot my-6 flex items-center justify-center ${className}`}
        style={{ minHeight }}
      >
        {process.env.NODE_ENV === 'development' && (
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">
            Ad slot · {slot}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`ad-slot my-6 ${className}`} style={{ minHeight }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
