import { redirect } from 'next/navigation';
import { requireEditorAccess } from '@/lib/editor-access';

export default async function DeprecatedEditorDashboard() {
  await requireEditorAccess();
  redirect('/admin');
}
