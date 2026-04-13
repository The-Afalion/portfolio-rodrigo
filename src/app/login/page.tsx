import { AuthFormCard } from '@/components/auth/AuthFormCard';
import { AuthShell } from '@/components/auth/AuthShell';
import { getAuthErrorMessage, getFirstQueryValue, parseAuthAudience, resolveNextPath } from '@/lib/auth';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { audience?: string | string[]; error?: string | string[]; next?: string | string[] };
}) {
  const audience = parseAuthAudience(getFirstQueryValue(searchParams?.audience));
  const nextPath = resolveNextPath(audience, getFirstQueryValue(searchParams?.next));
  const initialErrorCode = getFirstQueryValue(searchParams?.error);
  const initialError = getAuthErrorMessage(initialErrorCode, audience);

  return (
    <AuthShell audience={audience}>
      <AuthFormCard
        audience={audience}
        initialError={initialError}
        initialErrorCode={initialErrorCode}
        mode="signin"
        nextPath={nextPath}
      />
    </AuthShell>
  );
}
