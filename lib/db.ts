import { createClient } from '@libsql/client';

/**
 * Turso (hosted SQLite). Replaces better-sqlite3, which cannot work on
 * Vercel — serverless functions have no persistent disk.
 *
 * Needs two env vars, locally in .env.local and in Vercel's settings:
 *   TURSO_DATABASE_URL   libsql://your-db-xxx.turso.io
 *   TURSO_AUTH_TOKEN     the token from `turso db tokens create`
 */

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? '',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/* Run the schema once per cold start, not once per request */
let schemaReady: Promise<unknown> | null = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = client.execute(`
      CREATE TABLE IF NOT EXISTS emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        signup_type TEXT NOT NULL DEFAULT 'both',
        created_at TEXT DEFAULT (datetime('now')),
        verified INTEGER DEFAULT 0,
        unsubscribed INTEGER DEFAULT 0
      )
    `);
  }
  return schemaReady;
}

export type SignupType = 'waitlist' | 'newsletter' | 'both';

export async function addEmail(email: string, signupType: SignupType) {
  await ensureSchema();
  await client.execute({
    sql: `INSERT INTO emails (email, signup_type)
          VALUES (?, ?)
          ON CONFLICT(email) DO UPDATE SET
            signup_type = excluded.signup_type,
            unsubscribed = 0`,
    args: [email.toLowerCase().trim(), signupType],
  });
}

export async function getStats() {
  await ensureSchema();
  const res = await client.execute(`
    SELECT
      COUNT(*) AS total,
      SUM(signup_type = 'waitlist')   AS waitlist,
      SUM(signup_type = 'newsletter') AS newsletter,
      SUM(signup_type = 'both')       AS both
    FROM emails
    WHERE unsubscribed = 0
  `);

  const row = res.rows[0] ?? {};
  const n = (v: unknown) => Number(v ?? 0);

  return {
    total: n(row.total),
    waitlist: n(row.waitlist),
    newsletter: n(row.newsletter),
    both: n(row.both),
  };
}

export type EmailRow = {
  id: number;
  email: string;
  signup_type: string;
  created_at: string;
  unsubscribed: number;
};

export async function listEmails(): Promise<EmailRow[]> {
  await ensureSchema();
  const res = await client.execute(
    `SELECT id, email, signup_type, created_at, unsubscribed
     FROM emails
     ORDER BY created_at DESC`
  );
  return res.rows as unknown as EmailRow[];
}
