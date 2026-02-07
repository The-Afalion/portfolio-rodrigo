import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditPostForm from './EditPostForm';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Editar Post</h1>
      <div className="p-6 border border-border rounded-lg bg-secondary">
        <EditPostForm post={post} />
      </div>
    </div>
  );
}
