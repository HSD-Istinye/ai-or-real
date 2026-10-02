import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/server/runs';
import { handleError, parseMode, parseScope } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/leaderboard?scope=today|alltime&mode=solo&limit=10 */
export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams;
    const limit = Math.min(100, Math.max(1, Number(q.get('limit')) || 10));
    const data = getLeaderboard({ scope: parseScope(q.get('scope')), mode: parseMode(q.get('mode')), limit });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return handleError(err);
  }
}
