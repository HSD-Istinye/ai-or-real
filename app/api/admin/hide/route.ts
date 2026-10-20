import { NextResponse } from 'next/server';
import { setHidden } from '@/lib/server/runs';
import { handleError, jsonError, requireAdmin } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/admin/hide  { id, hidden?: boolean }  — hidden varsayılan true; false = geri getir */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => null)) as { id?: unknown; hidden?: unknown } | null;
    if (!body || typeof body.id !== 'string') return jsonError(400, 'id gerekli');
    const ok = setHidden(body.id, body.hidden !== false);
    return ok ? NextResponse.json({ ok: true }) : jsonError(404, 'Kayıt bulunamadı');
  } catch (err) {
    return handleError(err);
  }
}
