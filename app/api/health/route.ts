import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { handleError } from '@/lib/server/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const sql = getDb();
    const [row] = await sql`SELECT COUNT(*)::int AS n FROM game.run`;
    return NextResponse.json({ ok: true, runs: row.n, time: new Date().toISOString() });
  } catch (err) {
    return handleError(err);
  }
}
