export const dynamic = 'force-static';

/**
 * AdSense requires an ads.txt at the domain root declaring your
 * publisher ID. Without it Google may stop serving ads.
 *
 * Generated from NEXT_PUBLIC_ADSENSE_CLIENT so there's one place
 * to set your ID.
 */
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '';
  const pub = client.replace(/^ca-/, ''); // ca-pub-123 -> pub-123

  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : '# ads.txt — set NEXT_PUBLIC_ADSENSE_CLIENT to populate this file\n';

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
