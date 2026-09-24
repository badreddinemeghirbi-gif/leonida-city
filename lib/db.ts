import Database from 'better-sqlite3';
import path from 'path';

/**
 * ⚠️ LOCAL DEV ONLY.
 * Vercel's filesystem is ephemeral — this file gets wiped on every deploy
 * and isn't shared between serverless instances. Before you launch, swap
 * this module for Turso / Supabase / Vercel Postgres. The two exported
 * functions below are the only surface the API routes touch, so the swap
 * is contained to this file.
 */

const DB_PATH = process.env.SQLITE_PATH ?? path.join(process.cwd(), 'leonida.db');

let instance: Database.Database | null = null;

function getDb() {
  if (instance) return instance;

  instance = new Database(DB_PATH);
  instance.pragma('journal_mode = WAL');
  instance.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      signup_type TEXT NOT NULL DEFAULT 'both',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      verified INTEGER DEFAULT 0,
      unsubscribed INTEGER DEFAULT 0
    );
  `);
  return instance;
}

export type SignupType = 'waitlist' | 'newsletter' | 'both';

export function addEmail(email: string, signupType: SignupType) {
  const db = getDb();
  // Re-subscribing is not an error — upgrade their preferences instead.
  db.prepare(
    `INSERT INTO emails (email, signup_type)
     VALUES (?, ?)
     ON CONFLICT(email) DO UPDATE SET
       signup_type = excluded.signup_type,
       unsubscribed = 0`
  ).run(email.toLowerCase().trim(), signupType);
}

export function getStats() {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(signup_type = 'waitlist')   AS waitlist,
         SUM(signup_type = 'newsletter') AS newsletter,
         SUM(signup_type = 'both')       AS both
       FROM emails
       WHERE unsubscribed = 0`
    )
    .get() as Record<string, number | null>;

  return {
    total: row.total ?? 0,
    waitlist: row.waitlist ?? 0,
    newsletter: row.newsletter ?? 0,
    both: row.both ?? 0,
  };
}
