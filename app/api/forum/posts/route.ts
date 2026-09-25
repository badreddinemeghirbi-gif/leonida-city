import { NextResponse } from 'next/server';
import { listPosts, createPost, likedPostIds } from '@/lib/forum';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sort = url.searchParams.get('sort') === 'top' ? 'top' : 'new';
    const tag = url.searchParams.get('tag') ?? undefined;
    const me = url.searchParams.get('me');

    const [posts, liked] = await Promise.all([
      listPosts(sort, tag),
      me ? likedPostIds(me) : Promise.resolve([]),
    ]);

    return NextResponse.json({ posts, liked }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[forum GET]', err);
    return NextResponse.json({ error: 'Could not load the feed.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { authorId, authorName, body, tag } = await req.json();

    if (!authorId || !authorName || !body) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    await createPost(String(authorId), String(authorName), String(body), String(tag));
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not post.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
