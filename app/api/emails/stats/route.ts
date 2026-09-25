import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getStats());
  } catch (err) {
    console.error('[stats]', err);
    return NextResponse.json({ error: 'Could not read stats.' }, { status: 500 });
  }
}
