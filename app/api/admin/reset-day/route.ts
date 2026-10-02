import { NextResponse } from 'next/server';
import { hideToday } from '@/lib/server/runs';
import { handleError, requireAdmin } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/admin/reset-day — bugünkü kayıtları gizler (silmez). Prova sonrası temiz başlangıç için. */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    return NextResponse.json({ ok: true, hidden: hideToday() });
  } catch (err) {
    return handleError(err);
  }
}
