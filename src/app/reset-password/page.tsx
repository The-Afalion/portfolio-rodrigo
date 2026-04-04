import { ResetPasswordCard } from '@/components/auth/ResetPasswordCard';
import { AuthShell } from '@/components/auth/AuthShell';
import { getFirstQueryValue, parseAuthAudience, resolveNextPath } from '@/lib/auth';

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { audience?: string | string[]; next?: string | string[] };
}) {
  const audience = parseAuthAudience(getFirstQueryValue(searchParams?.audience));
  const nextPath = resolveNextPath(audience, getFirstQueryValue(searchParams?.next));

  return (
    <AuthShell audience={audience}>
      <ResetPasswordCard audience={audience} nextPath={nextPath} />
    </AuthShell>
  );
}
