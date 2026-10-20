import 'server-only';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, accessStatus } from './access';
import { handleError, jsonError } from './http';
export async function requireGameAccess() {
  try {
    const token = (await cookies()).get(ACCESS_COOKIE)?.value;
    return (await accessStatus(token)).unlocked ? null : jsonError(403, 'Önce giriş ekranındaki QR bağlantısını açın.', 'access_required');
  } catch (error) { return handleError(error); }
}
