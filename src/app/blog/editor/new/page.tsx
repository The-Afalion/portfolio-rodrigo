import { redirect } from 'next/navigation';

export default function DeprecatedEditorNewPostPage() {
  redirect('/admin/posts');
}
