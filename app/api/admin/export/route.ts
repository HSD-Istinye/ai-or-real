import { exportCsv } from '@/lib/server/runs';
import { handleError, requireAdmin } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/export?token=... — tüm kayıtlar CSV (Excel'de açılır) */
export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response('﻿' + await exportCsv(), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reallusion-${stamp}.csv"`,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
