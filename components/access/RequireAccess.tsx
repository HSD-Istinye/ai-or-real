import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_COOKIE, accessStatus } from '@/lib/server/access';

export default async function RequireAccess({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!(await accessStatus(token)).unlocked) redirect('/welcome');
  return <>{children}</>;
}
