import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  toggleVote,
  listComments,
  createComment,
  removePost,
  removeComment,
  report,
} from '@/lib/forum';
import { renameUser } from '@/lib/users';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const { action } = payload;

  /* Reading comments needs no account */
  if (action === 'comments') {
    try {
      return NextResponse.json({ comments: await listComments(Number(payload.postId)) });
    } catch {
      return NextResponse.json({ error: 'Could not load comments.' }, { status: 500 });
    }
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  }
  if (session.user.banned) {
    return NextResponse.json({ error: 'Your account is suspended.' }, { status: 403 });
  }

  const uid = session.user.id;
  const isMod = session.user.role === 'mod' || session.user.role === 'admin';

  try {
    switch (action) {
      case 'vote':
        return NextResponse.json(await toggleVote(Number(payload.postId), uid));

      case 'comment': {
        await createComment(Number(payload.postId), uid, String(payload.body));
        return NextResponse.json({ comments: await listComments(Number(payload.postId)) });
      }

      case 'removePost':
        await removePost(Number(payload.postId), uid, isMod);
        return NextResponse.json({ ok: true });

      case 'removeComment':
        await removeComment(Number(payload.commentId), uid, isMod);
        return NextResponse.json({
          comments: await listComments(Number(payload.postId)),
        });

      case 'report':
        await report(uid, payload.postId, payload.commentId);
        return NextResponse.json({ ok: true });

      case 'rename':
        return NextResponse.json({ handle: await renameUser(uid, String(payload.handle)) });

      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
