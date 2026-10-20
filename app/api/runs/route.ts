import { NextResponse } from 'next/server';
import { insertRun } from '@/lib/server/runs';
import { handleError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/runs — oyun sonucunu kaydeder.
 * Gövde: SubmitRunRequest (types/api.ts). Skor gönderilmez, sunucu hesaplar.
 * 201 → yeni kayıt, 200 → aynı id daha önce kaydedilmiş (idempotent).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'Geçersiz JSON');
  }
  try {
    const res = insertRun(body);
    return NextResponse.json(res, { status: res.duplicate ? 200 : 201 });
  } catch (err) {
    return handleError(err);
  }
}
