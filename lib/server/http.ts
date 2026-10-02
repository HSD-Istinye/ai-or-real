import 'server-only';
import { NextResponse } from 'next/server';
import { ValidationError } from './validate';
import { GameMode, Scope } from '@/types/api';

export function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

/** Route içindeki hataları tek tip JSON'a çevirir; sunucu hiçbir durumda HTML hata sayfası dönmez. */
export function handleError(err: unknown) {
  if (err instanceof ValidationError) return jsonError(400, err.message);
  console.error('[api]', err);
  return jsonError(500, 'Sunucu hatası');
}

export function parseScope(v: string | null): Scope {
  return v === 'alltime' ? 'alltime' : 'today';
}

export function parseMode(v: string | null): GameMode {
  return v === 'duel' ? 'duel' : 'solo';
}

/**
 * Admin koruması: .env.local içinde ADMIN_TOKEN=... tanımlayın,
 * istekte "X-Admin-Token" header'ı ile gönderin. Tanımlı değilse admin kapalıdır.
 */
export function requireAdmin(req: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return jsonError(503, 'ADMIN_TOKEN tanımlı değil (.env.local)');
  const given = req.headers.get('x-admin-token') ?? new URL(req.url).searchParams.get('token');
  if (given !== token) return jsonError(401, 'Yetkisiz');
  return null;
}
