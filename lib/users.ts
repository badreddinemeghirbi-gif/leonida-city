import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? '',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let ready: Promise<unknown> | null = null;
export async function ensureUserSchema() {
  if (!ready) {
    ready = client.execute(`
      CREATE TABLE IF NOT EXISTS forum_users (
        id TEXT PRIMARY KEY,
        handle TEXT UNIQUE NOT NULL,
        avatar TEXT,
        role TEXT NOT NULL DEFAULT 'member',
        banned INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )`);
  }
  return ready;
}

/* Handle generator — Vice City flavoured, no real names involved */
const ADJ = [
  'Neon', 'Midnight', 'Chrome', 'Vice', 'Rogue', 'Silent', 'Turbo', 'Gold',
  'Crimson', 'Electric', 'Shadow', 'Rapid', 'Lucky', 'Wired', 'Cobalt',
  'Static', 'Velvet', 'Ghost', 'Iron', 'Sunset', 'Feral', 'Loaded', 'Slick',
];

const NOUN = [
  'Flamingo', 'Driver', 'Hustler', 'Gator', 'Dealer', 'Runner', 'Palm',
  'Shark', 'Pelican', 'Bandit', 'Cruiser', 'Wrench', 'Marlin', 'Joker',
  'Falcon', 'Racer', 'Outlaw', 'Mako', 'Sniper', 'Heron', 'Rider', 'Ace',
];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

async function handleTaken(handle: string) {
  const res = await client.execute({
    sql: 'SELECT 1 FROM forum_users WHERE handle = ?',
    args: [handle],
  });
  return res.rows.length > 0;
}

async function generateHandle(): Promise<string> {
  for (let i = 0; i < 12; i++) {
    const n = Math.floor(Math.random() * 900) + 100;
    const candidate = `${pick(ADJ)}${pick(NOUN)}${n}`;
    if (!(await handleTaken(candidate))) return candidate;
  }
  // Fallback that cannot collide
  return `Citizen${Date.now().toString(36).toUpperCase()}`;
}

export type ForumUser = {
  id: string;
  handle: string;
  avatar: string | null;
  role: string;
  banned: number;
};

/**
 * Called on every sign-in. Creates the row and assigns a random
 * gamer handle the first time; returns the existing one after that.
 * We never store the provider's name or email — only an opaque id.
 */
export async function upsertUser(id: string, avatar?: string | null): Promise<ForumUser> {
  await ensureUserSchema();

  const existing = await client.execute({
    sql: 'SELECT id, handle, avatar, role, banned FROM forum_users WHERE id = ?',
    args: [id],
  });

  if (existing.rows.length > 0) {
    return existing.rows[0] as unknown as ForumUser;
  }

  const handle = await generateHandle();
  await client.execute({
    sql: 'INSERT INTO forum_users (id, handle, avatar) VALUES (?,?,?)',
    args: [id, handle, avatar ?? null],
  });

  return { id, handle, avatar: avatar ?? null, role: 'member', banned: 0 };
}

export async function getUser(id: string): Promise<ForumUser | null> {
  await ensureUserSchema();
  const res = await client.execute({
    sql: 'SELECT id, handle, avatar, role, banned FROM forum_users WHERE id = ?',
    args: [id],
  });
  return (res.rows[0] as unknown as ForumUser) ?? null;
}

/** One free rename, then it's locked — stops handle-churn abuse */
export async function renameUser(id: string, handle: string) {
  await ensureUserSchema();
  const clean = handle.trim().replace(/[^A-Za-z0-9_]/g, '').slice(0, 20);
  if (clean.length < 3) throw new Error('Handle must be at least 3 characters.');
  if (await handleTaken(clean)) throw new Error('That handle is taken.');

  await client.execute({
    sql: 'UPDATE forum_users SET handle = ? WHERE id = ?',
    args: [clean, id],
  });
  return clean;
}

/** Most-upvoted members, for the leaderboard */
export async function topMembers(limit = 8) {
  await ensureUserSchema();
  const res = await client.execute({
    sql: `SELECT u.handle, u.avatar,
            (SELECT COUNT(*) FROM forum_votes v
               JOIN forum_posts p ON p.id = v.post_id
              WHERE p.author_id = u.id) AS karma,
            (SELECT COUNT(*) FROM forum_posts p2
              WHERE p2.author_id = u.id AND p2.hidden = 0) AS posts
          FROM forum_users u
          WHERE u.banned = 0
          ORDER BY karma DESC, posts DESC
          LIMIT ?`,
    args: [limit],
  });
  return res.rows as unknown as {
    handle: string;
    avatar: string | null;
    karma: number;
    posts: number;
  }[];
}
