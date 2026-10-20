import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_COOKIE, accessStatus } from '@/lib/server/access';
import AccessScreen from '@/components/access/AccessScreen';
export const dynamic = 'force-dynamic';
export default async function WelcomePage() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if ((await accessStatus(token)).unlocked) redirect('/');
  return <AccessScreen />;
}
