import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { ACCESS_COOKIE, ACCESS_SECONDS, accessStatus, createAccess } from '@/lib/server/access';
import { handleError } from '@/lib/server/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store, private' };
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(await accessStatus(req.cookies.get(ACCESS_COOKIE)?.value), { headers });
  } catch (error) { return handleError(error); }
}
export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin) return new NextResponse(null, { status: 403 });
  try {
    const token = req.cookies.get(ACCESS_COOKIE)?.value;
    if ((await accessStatus(token)).unlocked) return NextResponse.json({ unlocked: true }, { headers });
    const access = await createAccess(token);
    const url = new URL(`/qr/${access.scan}`, req.url).toString();
    const qr = await QRCode.toDataURL(url, { width: 320, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#49356f', light: '#ffffff' } });
    const res = NextResponse.json({ unlocked: false, qr, url, expiresAt: access.expiresAt }, { headers });
    res.cookies.set(ACCESS_COOKIE, access.session, {
      httpOnly: true, sameSite: 'lax', secure: req.nextUrl.protocol === 'https:', path: '/', maxAge: ACCESS_SECONDS,
    });
    return res;
  } catch (error) { return handleError(error); }
}
