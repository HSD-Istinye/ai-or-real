import { requireGameAccess } from '@/lib/server/access-http';
import { NextResponse } from 'next/server';
import { normalizeNick } from '@/lib/server/validate';
import { isNickTakenToday } from '@/lib/server/runs';
import { handleError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/nick  { nick, mine? }  — oyuna başlamadan önce ismi kontrol eder.
 * 200 { ok: true, nick }  → temizlenmiş isim
 * 400 { ok: false, error, code } → boş / geçersiz karakter / uygunsuz isim
 * 409 { ok: false, error, code: 'nick_taken' } → bu isim bugün başka biri tarafından alınmış
 * mine: true → isim bu tarayıcı oturumunda zaten bu oyuncunundu (kendi ismiyle tekrar oynuyor)
 */
export async function POST(req: Request) {
  const denied = await requireGameAccess();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { nick?: unknown; mine?: unknown } | null;
  if (!body) return jsonError(400, 'Geçersiz JSON');
  try {
    const nick = normalizeNick(body.nick);
    if (nick === '???') return jsonError(400, 'Lütfen bir isim yaz', 'nick_empty');
    if (body.mine !== true && await isNickTakenToday(nick)) {
      return jsonError(409, 'Bu isim bugün alınmış, başka bir isim dene', 'nick_taken');
    }
    return NextResponse.json({ ok: true, nick });
  } catch (err) {
    return handleError(err);
  }
}
