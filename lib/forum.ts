import { createClient } from '@libsql/client';
import { ensureUserSchema } from '@/lib/users';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? '',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let ready: Promise<unknown> | null = null;
async function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      await ensureUserSchema();
      await client.execute(`
        CREATE TABLE IF NOT EXISTS forum_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          author_id TEXT NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          tag TEXT NOT NULL DEFAULT 'General',
          created_at TEXT DEFAULT (datetime('now')),
          hidden INTEGER DEFAULT 0,
          pinned INTEGER DEFAULT 0
        )`);
      await client.execute(`
        CREATE TABLE IF NOT EXISTS forum_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          author_id TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          hidden INTEGER DEFAULT 0
        )`);
      await client.execute(`
        CREATE TABLE IF NOT EXISTS forum_votes (
          post_id INTEGER NOT NULL,
          user_id TEXT NOT NULL,
          PRIMARY KEY (post_id, user_id)
        )`);
      await client.execute(`
        CREATE TABLE IF NOT EXISTS forum_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER,
          comment_id INTEGER,
          reporter_id TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        )`);
    })();
  }
  return ready;
}

export const TAGS = ['General', 'Theories', 'Leaks', 'Gameplay', 'Art', 'Help'];

export const LIMITS = {
  title: 120,
  body: 4000,
  comment: 1000,
  postsPerHour: 6,
  commentsPerHour: 30,
};

export type Post = {
  id: number;
  author_id: string;
  handle: string;
  avatar: string | null;
  title: string;
  body: string;
  tag: string;
  created_at: string;
  votes: number;
  comments: number;
  pinned: number;
};

export type Comment = {
  id: number;
  post_id: number;
  author_id: string;
  handle: string;
  avatar: string | null;
  body: string;
  created_at: string;
};

const SELECT_POST = `
  SELECT p.id, p.author_id, u.handle, u.avatar, p.title, p.body, p.tag,
         p.created_at, p.pinned,
         (SELECT COUNT(*) FROM forum_votes v WHERE v.post_id = p.id) AS votes,
         (SELECT COUNT(*) FROM forum_comments c
           WHERE c.post_id = p.id AND c.hidden = 0) AS comments
    FROM forum_posts p
    JOIN forum_users u ON u.id = p.author_id
`;

async function rateCheck(table: 'forum_posts' | 'forum_comments', userId: string, max: number) {
  const res = await client.execute({
    sql: `SELECT COUNT(*) AS n FROM ${table}
          WHERE author_id = ? AND created_at > datetime('now','-1 hour')`,
    args: [userId],
  });
  if (Number(res.rows[0]?.n ?? 0) >= max) {
    throw new Error("You've posted a lot in the last hour. Give it a few minutes.");
  }
}

export async function listPosts(sort: 'new' | 'top' | 'hot' = 'hot', tag?: string) {
  await ensureSchema();

  const where = tag && tag !== 'All' ? 'AND p.tag = ?' : '';

  /* "hot" = votes decayed by age, the classic ranking shape */
  const order =
    sort === 'top'
      ? 'votes DESC, p.id DESC'
      : sort === 'new'
        ? 'p.id DESC'
        : `(votes * 1.0) / (((julianday('now') - julianday(p.created_at)) * 24 + 2) ) DESC, p.id DESC`;

  const res = await client.execute({
    sql: `${SELECT_POST} WHERE p.hidden = 0 ${where}
          ORDER BY p.pinned DESC, ${order} LIMIT 60`,
    args: tag && tag !== 'All' ? [tag] : [],
  });

  return res.rows as unknown as Post[];
}

export async function getPost(id: number) {
  await ensureSchema();
  const res = await client.execute({
    sql: `${SELECT_POST} WHERE p.id = ? AND p.hidden = 0`,
    args: [id],
  });
  return (res.rows[0] as unknown as Post) ?? null;
}

export async function createPost(
  userId: string,
  title: string,
  body: string,
  tag: string
) {
  await ensureSchema();

  const t = title.trim();
  const b = body.trim();
  if (t.length < 4) throw new Error('Give it a title of at least 4 characters.');
  if (t.length > LIMITS.title) throw new Error('Title is too long.');
  if (b.length < 2) throw new Error('Say a bit more than that.');
  if (b.length > LIMITS.body) throw new Error('Post is too long.');

  await rateCheck('forum_posts', userId, LIMITS.postsPerHour);

  const res = await client.execute({
    sql: `INSERT INTO forum_posts (author_id, title, body, tag)
          VALUES (?,?,?,?) RETURNING id`,
    args: [userId, t, b, TAGS.includes(tag) ? tag : 'General'],
  });

  return Number((res.rows[0] as unknown as { id: number }).id);
}

export async function listComments(postId: number) {
  await ensureSchema();
  const res = await client.execute({
    sql: `SELECT c.id, c.post_id, c.author_id, u.handle, u.avatar, c.body, c.created_at
            FROM forum_comments c
            JOIN forum_users u ON u.id = c.author_id
           WHERE c.post_id = ? AND c.hidden = 0
           ORDER BY c.id ASC LIMIT 300`,
    args: [postId],
  });
  return res.rows as unknown as Comment[];
}

export async function createComment(postId: number, userId: string, body: string) {
  await ensureSchema();
  const b = body.trim();
  if (b.length < 1) throw new Error('Comment is empty.');
  if (b.length > LIMITS.comment) throw new Error('Comment is too long.');

  await rateCheck('forum_comments', userId, LIMITS.commentsPerHour);

  await client.execute({
    sql: 'INSERT INTO forum_comments (post_id, author_id, body) VALUES (?,?,?)',
    args: [postId, userId, b],
  });
}

export async function toggleVote(postId: number, userId: string) {
  await ensureSchema();

  const existing = await client.execute({
    sql: 'SELECT 1 FROM forum_votes WHERE post_id = ? AND user_id = ?',
    args: [postId, userId],
  });
  const had = existing.rows.length > 0;

  await client.execute({
    sql: had
      ? 'DELETE FROM forum_votes WHERE post_id = ? AND user_id = ?'
      : 'INSERT OR IGNORE INTO forum_votes (post_id, user_id) VALUES (?,?)',
    args: [postId, userId],
  });

  const count = await client.execute({
    sql: 'SELECT COUNT(*) AS n FROM forum_votes WHERE post_id = ?',
    args: [postId],
  });

  return { voted: !had, votes: Number(count.rows[0]?.n ?? 0) };
}

export async function votedPostIds(userId: string) {
  await ensureSchema();
  const res = await client.execute({
    sql: 'SELECT post_id FROM forum_votes WHERE user_id = ?',
    args: [userId],
  });
  return res.rows.map((r) => Number((r as unknown as { post_id: number }).post_id));
}

/** Author can remove their own; moderators can remove anything */
export async function removePost(postId: number, userId: string, isMod: boolean) {
  await ensureSchema();
  await client.execute({
    sql: isMod
      ? 'UPDATE forum_posts SET hidden = 1 WHERE id = ?'
      : 'UPDATE forum_posts SET hidden = 1 WHERE id = ? AND author_id = ?',
    args: isMod ? [postId] : [postId, userId],
  });
}

export async function removeComment(commentId: number, userId: string, isMod: boolean) {
  await ensureSchema();
  await client.execute({
    sql: isMod
      ? 'UPDATE forum_comments SET hidden = 1 WHERE id = ?'
      : 'UPDATE forum_comments SET hidden = 1 WHERE id = ? AND author_id = ?',
    args: isMod ? [commentId] : [commentId, userId],
  });
}

export async function report(reporterId: string, postId?: number, commentId?: number) {
  await ensureSchema();
  await client.execute({
    sql: 'INSERT INTO forum_reports (post_id, comment_id, reporter_id) VALUES (?,?,?)',
    args: [postId ?? null, commentId ?? null, reporterId],
  });
}

export async function stats() {
  await ensureSchema();
  const res = await client.execute(`
    SELECT
      (SELECT COUNT(*) FROM forum_posts WHERE hidden = 0) AS posts,
      (SELECT COUNT(*) FROM forum_comments WHERE hidden = 0) AS comments,
      (SELECT COUNT(*) FROM forum_users WHERE banned = 0) AS members
  `);
  const r = res.rows[0] ?? {};
  return {
    posts: Number(r.posts ?? 0),
    comments: Number(r.comments ?? 0),
    members: Number(r.members ?? 0),
  };
}
