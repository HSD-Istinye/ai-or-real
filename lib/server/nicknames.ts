import 'server-only';
import { createHash } from 'node:crypto';
import { getDb } from './db';
import { scopeSince } from './day';
export function nickKey(nick: string) {
  return nick.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
}
/** A unique day/name key arbitrates simultaneous requests in PostgreSQL. */
export async function reserveNickname(nick: string, session: string, at = new Date()) {
  if (!/^[a-f0-9]{64}$/.test(session)) return false;
  if (nick === '???') return true;
  const sql = getDb();
  const day = scopeSince('today', at);
  const owner = createHash('sha256').update(session).digest('hex');
  const key = nickKey(nick);
  const rows = await sql`
    INSERT INTO game.nick_reservation (day_start, nick_key, owner_hash)
    SELECT ${day}::timestamptz, ${key}, ${owner}
    WHERE NOT EXISTS (
      SELECT 1 FROM game.run WHERE nick_key = ${key} AND hidden = 0
      AND created_at >= ${day} AND created_at < ${day}::timestamptz + interval '1 day'
    ) OR EXISTS (
      SELECT 1 FROM game.nick_reservation WHERE day_start = ${day} AND nick_key = ${key} AND owner_hash = ${owner}
    )
    ON CONFLICT (day_start, nick_key) DO UPDATE SET owner_hash = EXCLUDED.owner_hash
    WHERE game.nick_reservation.owner_hash = EXCLUDED.owner_hash
    RETURNING nick_key`;
  return rows.length === 1;
}
