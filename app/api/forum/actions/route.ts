import { NextResponse } from 'next/server';
import {
  toggleLike,
  listComments,
  createComment,
  hidePost,
  hideComment,
} from '@/lib/forum';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { action } = payload;

    switch (action) {
      case 'like': {
        const { postId, authorId } = payload;
        if (!postId || !authorId) throw new Error('Missing fields.');
        return NextResponse.json(await toggleLike(Number(postId), String(authorId)));
      }

      case 'comments': {
        const { postId } = payload;
        return NextResponse.json({ comments: await listComments(Number(postId)) });
      }

      case 'comment': {
        const { postId, authorId, authorName, body } = payload;
        if (!postId || !authorId || !authorName || !body) throw new Error('Missing fields.');
        await createComment(Number(postId), String(authorId), String(authorName), String(body));
        return NextResponse.json({ comments: await listComments(Number(postId)) });
      }

      /* Moderation — requires the admin key */
      case 'hidePost':
      case 'hideComment': {
        if (!process.env.ADMIN_KEY || payload.key !== process.env.ADMIN_KEY) {
          return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
        }
        if (action === 'hidePost') await hidePost(Number(payload.postId));
        else await hideComment(Number(payload.commentId));
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
