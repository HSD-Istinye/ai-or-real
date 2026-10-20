import HomePage from '@/components/home/HomePage';
import RequireAccess from '@/components/access/RequireAccess';
export default function Page() {
  return <RequireAccess><HomePage /></RequireAccess>;
}
