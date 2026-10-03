import { NextResponse } from 'next/server';
import { normalizeNick } from '@/lib/server/validate';
import { handleError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/nick  { nick }  — oyuna başlamadan önce ismi kontrol eder.
 * 200 { ok: true, nick }  → temizlenmiş isim
 * 400 { ok: false, error } → boş / geçersiz karakter / uygunsuz isim
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { nick?: unknown } | null;
  if (!body) return jsonError(400, 'Geçersiz JSON');
  try {
    const nick = normalizeNick(body.nick);
    if (nick === '???') return jsonError(400, 'Lütfen bir isim yaz');
    return NextResponse.json({ ok: true, nick });
  } catch (err) {
    return handleError(err);
  }
}
