import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? '',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let ready: Promise<unknown> | null = null;
async function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS forum_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          author_id TEXT NOT NULL,
          author_name TEXT NOT NULL,
          body TEXT NOT NULL,
          tag TEXT NOT NULL DEFAULT 'General',
          created_at TEXT DEFAULT (datetime('now')),
          hidden INTEGER DEFAULT 0
        )`);
      await client.execute(`
        CREATE TABLE IF NOT EXISTS forum_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          author_id TEXT NOT NULL,
          author_name TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          hidden INTEGER DEFAULT 0
        )`);
      await client.execute(`
        CREATE TABLE IF NOT EXISTS forum_likes (
          post_id INTEGER NOT NULL,
          author_id TEXT NOT NULL,
          PRIMARY KEY (post_id, author_id)
        )`);
    })();
  }
  return ready;
}

export const TAGS = ['General', 'Theories', 'Leaks', 'Gameplay', 'Art', 'Off-topic'];

export const LIMITS = {
  postBody: 1000,
  commentBody: 500,
  name: 24,
  postsPerHour: 5,
  commentsPerHour: 20,
};

export type Post = {
  id: number;
  author_id: string;
  author_name: string;
  body: string;
  tag: string;
  created_at: string;
  likes: number;
  comments: number;
};

export type Comment = {
  id: number;
  post_id: number;
  author_name: string;
  body: string;
  created_at: string;
};

/** Returns how many of this author's items landed in the last hour */
async function recentCount(table: 'forum_posts' | 'forum_comments', authorId: string) {
  await ensureSchema();
  const res = await client.execute({
    sql: `SELECT COUNT(*) AS n FROM ${table}
          WHERE author_id = ? AND created_at > datetime('now','-1 hour')`,
    args: [authorId],
  });
  return Number(res.rows[0]?.n ?? 0);
}

export async function listPosts(sort: 'new' | 'top' = 'new', tag?: string) {
  await ensureSchema();

  const where = tag && tag !== 'All' ? 'AND p.tag = ?' : '';
  const order = sort === 'top' ? 'likes DESC, p.id DESC' : 'p.id DESC';

  const res = await client.execute({
    sql: `SELECT p.id, p.author_id, p.author_name, p.body, p.tag, p.created_at,
            (SELECT COUNT(*) FROM forum_likes l WHERE l.post_id = p.id) AS likes,
            (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id AND c.hidden = 0) AS comments
          FROM forum_posts p
          WHERE p.hidden = 0 ${where}
          ORDER BY ${order}
          LIMIT 100`,
    args: tag && tag !== 'All' ? [tag] : [],
  });

  return res.rows as unknown as Post[];
}

export async function createPost(
  authorId: string,
  authorName: string,
  body: string,
  tag: string
) {
  if (body.trim().length < 2) throw new Error('Post is too short.');
  if (body.length > LIMITS.postBody) throw new Error('Post is too long.');
  if ((await recentCount('forum_posts', authorId)) >= LIMITS.postsPerHour) {
    throw new Error('You have posted a lot recently. Try again in a bit.');
  }

  await client.execute({
    sql: `INSERT INTO forum_posts (author_id, author_name, body, tag) VALUES (?,?,?,?)`,
    args: [
      authorId,
      authorName.slice(0, LIMITS.name),
      body.trim(),
      TAGS.includes(tag) ? tag : 'General',
    ],
  });
}

export async function listComments(postId: number) {
  await ensureSchema();
  const res = await client.execute({
    sql: `SELECT id, post_id, author_name, body, created_at
          FROM forum_comments
          WHERE post_id = ? AND hidden = 0
          ORDER BY id ASC LIMIT 200`,
    args: [postId],
  });
  return res.rows as unknown as Comment[];
}

export async function createComment(
  postId: number,
  authorId: string,
  authorName: string,
  body: string
) {
  if (body.trim().length < 1) throw new Error('Comment is empty.');
  if (body.length > LIMITS.commentBody) throw new Error('Comment is too long.');
  if ((await recentCount('forum_comments', authorId)) >= LIMITS.commentsPerHour) {
    throw new Error('Slow down a moment.');
  }

  await client.execute({
    sql: `INSERT INTO forum_comments (post_id, author_id, author_name, body) VALUES (?,?,?,?)`,
    args: [postId, authorId, authorName.slice(0, LIMITS.name), body.trim()],
  });
}

/** Returns the new like count and whether this author now likes it */
export async function toggleLike(postId: number, authorId: string) {
  await ensureSchema();

  const existing = await client.execute({
    sql: `SELECT 1 FROM forum_likes WHERE post_id = ? AND author_id = ?`,
    args: [postId, authorId],
  });

  const liked = existing.rows.length > 0;

  if (liked) {
    await client.execute({
      sql: `DELETE FROM forum_likes WHERE post_id = ? AND author_id = ?`,
      args: [postId, authorId],
    });
  } else {
    await client.execute({
      sql: `INSERT OR IGNORE INTO forum_likes (post_id, author_id) VALUES (?,?)`,
      args: [postId, authorId],
    });
  }

  const count = await client.execute({
    sql: `SELECT COUNT(*) AS n FROM forum_likes WHERE post_id = ?`,
    args: [postId],
  });

  return { liked: !liked, likes: Number(count.rows[0]?.n ?? 0) };
}

/** Moderation — hides rather than deletes so nothing is lost */
export async function hidePost(postId: number) {
  await ensureSchema();
  await client.execute({ sql: `UPDATE forum_posts SET hidden = 1 WHERE id = ?`, args: [postId] });
}

export async function hideComment(commentId: number) {
  await ensureSchema();
  await client.execute({ sql: `UPDATE forum_comments SET hidden = 1 WHERE id = ?`, args: [commentId] });
}

export async function likedPostIds(authorId: string) {
  await ensureSchema();
  const res = await client.execute({
    sql: `SELECT post_id FROM forum_likes WHERE author_id = ?`,
    args: [authorId],
  });
  return res.rows.map((r) => Number((r as unknown as { post_id: number }).post_id));
}
