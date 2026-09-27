import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listPosts, createPost, votedPostIds } from '@/lib/forum';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sortParam = url.searchParams.get('sort');
    const sort = sortParam === 'top' || sortParam === 'new' ? sortParam : 'hot';
    const tag = url.searchParams.get('tag') ?? undefined;

    const session = await auth();
    const uid = session?.user?.id;

    const [posts, voted] = await Promise.all([
      listPosts(sort, tag),
      uid ? votedPostIds(uid) : Promise.resolve([]),
    ]);

    return NextResponse.json({ posts, voted }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[forum GET]', err);
    return NextResponse.json({ error: 'Could not load the feed.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to post.' }, { status: 401 });
  }
  if (session.user.banned) {
    return NextResponse.json({ error: 'Your account is suspended.' }, { status: 403 });
  }

  try {
    const { title, body, tag } = await req.json();
    const id = await createPost(session.user.id, String(title), String(body), String(tag));
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not post.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
