import { requireEditorAccess } from '@/lib/editor-access';

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireEditorAccess();

  return (
    <>
      {children}
    </>
  );
}
