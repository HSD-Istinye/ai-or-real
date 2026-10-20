import { NextResponse } from 'next/server';
import { listRuns } from '@/lib/server/runs';
import { handleError, requireAdmin } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/runs?limit=100 — son kayıtlar (gizliler dahil) */
export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const limit = Math.min(1000, Math.max(1, Number(new URL(req.url).searchParams.get('limit')) || 100));
    return NextResponse.json({ ok: true, rows: listRuns(limit) });
  } catch (err) {
    return handleError(err);
  }
}
