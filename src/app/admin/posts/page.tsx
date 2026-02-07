import prisma from '@/lib/prisma';
import PostActions from './PostActions';
import PostForm from './PostForm'; // Importar el nuevo componente

// --- Componente de la Página ---
export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestionar Posts</h1>
      <div className="mb-12 p-6 border border-border rounded-lg bg-secondary">
        <h2 className="text-xl font-bold mb-4">Nuevo Post</h2>
        <PostForm />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Posts Existentes</h2>
        {posts.map((post) => (
          <div key={post.id} className="p-4 border border-border rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-muted-foreground">
                {post.published ? 'Publicado' : 'Borrador'} - {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
            <PostActions post={{ id: post.id, published: post.published }} />
          </div>
        ))}
      </div>
    </div>
  );
}
