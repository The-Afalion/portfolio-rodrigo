import { redirect } from 'next/navigation';
import { buildPath, getFirstQueryValue, resolveNextPath } from '@/lib/auth';

export default function BlogLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string | string[]; next?: string | string[] };
}) {
  const nextPath = resolveNextPath('editor', getFirstQueryValue(searchParams?.next));
  const error = getFirstQueryValue(searchParams?.error);

  redirect(
    buildPath('/login', {
      audience: 'editor',
      next: nextPath,
      error,
    })
  );
}
