import { NextResponse } from 'next/server';
import { addEmail, type SignupType } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VALID_TYPES: SignupType[] = ['waitlist', 'newsletter', 'both'];

export async function POST(req: Request) {
  try {
    const { email, signupType } = await req.json();

    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const type: SignupType = VALID_TYPES.includes(signupType) ? signupType : 'both';

    await addEmail(email, type);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[signup]', err);
    return NextResponse.json({ error: 'Could not save your email.' }, { status: 500 });
  }
}
