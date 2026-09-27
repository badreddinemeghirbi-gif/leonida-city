import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { getPost, listComments, votedPostIds } from '@/lib/forum';
import ThreadView from '@/components/ThreadView';
import AdUnit from '@/components/AdUnit';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(Number(id)).catch(() => null);
  if (!post) return { title: 'Thread not found' };

  return {
    title: post.title,
    description: post.body.slice(0, 155),
    alternates: { canonical: `/forum/${post.id}` },
    robots: { index: false, follow: false },
  };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) notFound();

  const post = await getPost(postId).catch(() => null);
  if (!post) notFound();

  const session = await auth();
  const [comments, voted] = await Promise.all([
    listComments(postId),
    session?.user?.id ? votedPostIds(session.user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-8">
      <Link
        href="/forum"
        className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[var(--cyan)]"
      >
        ← Back to the forum
      </Link>

      <h1 className="font-display mt-6 mb-6 text-2xl font-bold leading-tight text-white sm:text-3xl">
        {post.title}
      </h1>

      <ThreadView
        post={post}
        initialComments={comments}
        initialVoted={voted.includes(postId)}
      />

      <AdUnit slot="0000000008" format="horizontal" minHeight={90} />
    </div>
  );
}
