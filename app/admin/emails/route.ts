import { NextResponse } from 'next/server';
import { listEmails } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Private endpoint — lists every signup.
 *
 *   /api/admin/emails?key=YOUR_ADMIN_KEY
 *   /api/admin/emails?key=YOUR_ADMIN_KEY&format=csv
 *
 * Set ADMIN_KEY in .env.local and in Vercel. Without it the route
 * refuses every request, so a missing variable fails closed.
 */
export async function GET(req: Request) {
  const expected = process.env.ADMIN_KEY;
  if (!expected) {
    return NextResponse.json({ error: 'Not configured.' }, { status: 503 });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get('key') ?? req.headers.get('x-admin-key');
  if (key !== expected) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const rows = await listEmails();

    if (url.searchParams.get('format') === 'csv') {
      const header = 'id,email,signup_type,created_at,unsubscribed';
      const body = rows
        .map((r) =>
          [r.id, r.email, r.signup_type, r.created_at, r.unsubscribed].join(',')
        )
        .join('\n');

      return new NextResponse(`${header}\n${body}`, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="leonida-emails.csv"',
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json(
      { count: rows.length, emails: rows },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[admin/emails]', err);
    return NextResponse.json({ error: 'Could not read emails.' }, { status: 500 });
  }
}
