import { NextResponse } from 'next/server';
import { QR_TARGET, unlockAccess } from '@/lib/server/access';
import { handleError } from '@/lib/server/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!await unlockAccess(token)) return new NextResponse('Bu QR kodunun süresi dolmuş veya kod geçersiz. Oyun ekranından yeni QR oluşturun.', {
      status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
    const res = NextResponse.redirect(QR_TARGET, 303);
    res.headers.set('Cache-Control', 'no-store, private');
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
  } catch (error) { return handleError(error); }
}
