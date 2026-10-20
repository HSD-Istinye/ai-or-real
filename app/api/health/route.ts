import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/health — "sunucu ve veritabanı ayakta mı?" kontrolü */
export async function GET() {
  try {
    const { n } = getDb().prepare('SELECT COUNT(*) AS n FROM run').get() as { n: number };
    return NextResponse.json({ ok: true, runs: n, time: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
