import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { getDb } from './db';

export const ACCESS_COOKIE = 'reallusion_access';
export const ACCESS_SECONDS = 24 * 60 * 60;
export const QR_TARGET = 'https://linktr.ee/hsdistinye';
const valid = (token?: string) => !!token && /^[a-f0-9]{64}$/.test(token);
const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export async function accessStatus(token?: string) {
  if (!valid(token)) return { unlocked: false, exists: false };
  const sql = getDb();
  const [row] = await sql`SELECT unlocked_at IS NOT NULL AS unlocked
    FROM game.access_session WHERE session_hash = ${hash(token!)} AND expires_at > now()`;
  return { unlocked: row?.unlocked === true, exists: !!row };
}

export async function createAccess(token?: string) {
  const sql = getDb();
  const session = valid(token) ? token! : randomBytes(32).toString('hex');
  const scan = randomBytes(32).toString('hex');
  // Reuse the browser session and rotate only its pending QR. The cookie is never in the QR.
  await sql`INSERT INTO game.access_session (session_hash, scan_hash, scan_expires_at, expires_at)
    VALUES (${hash(session)}, ${hash(scan)}, now() + interval '15 minutes', now() + interval '24 hours')
    ON CONFLICT (session_hash) DO UPDATE SET scan_hash = EXCLUDED.scan_hash,
      scan_expires_at = EXCLUDED.scan_expires_at,
      unlocked_at = CASE WHEN game.access_session.expires_at > now() THEN game.access_session.unlocked_at ELSE NULL END,
      expires_at = EXCLUDED.expires_at`;
  await sql`DELETE FROM game.access_session WHERE expires_at < now()`;
  return { session, scan, expiresAt: Date.now() + 15 * 60 * 1000 };
}

export async function unlockAccess(scan: string) {
  if (!valid(scan)) return false;
  const sql = getDb();
  const rows = await sql`UPDATE game.access_session SET unlocked_at = COALESCE(unlocked_at, now())
    WHERE scan_hash = ${hash(scan)} AND scan_expires_at > now() AND expires_at > now()
    RETURNING session_hash`;
  return rows.length === 1;
}
