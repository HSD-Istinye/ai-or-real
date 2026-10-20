import { NextResponse } from 'next/server';
import { getStats } from '@/lib/server/runs';
import { handleError, parseMode, parseScope } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/stats?scope=today&mode=solo&score=1450 → yüzdelik, medyan, soru bazlı doğruluk */
export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams;
    const raw = q.get('score');
    const score = raw !== null && raw !== '' && Number.isFinite(Number(raw)) ? Number(raw) : undefined;
    const data = getStats({ scope: parseScope(q.get('scope')), mode: parseMode(q.get('mode')), score });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return handleError(err);
  }
}
