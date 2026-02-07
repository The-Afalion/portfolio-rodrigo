import prisma from '@/lib/prisma';
import PostActions from './PostActions';
import PostForm from './PostForm';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 5;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const totalPosts = await prisma.post.count();
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: POSTS_PER_PAGE,
    skip: (page - 1) * POSTS_PER_PAGE,
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
        <h2 className="text-xl font-bold mb-4">Posts Existentes ({totalPosts})</h2>
        {posts.map((post) => (
          <div key={post.id} className="p-4 border border-border rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-muted-foreground">
                {post.published ? 'Publicado' : 'Borrador'} - {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/posts/${post.id}/edit`} className="text-xs px-3 py-1 border rounded hover:bg-muted">
                Editar
              </Link>
              <PostActions post={{ id: post.id, published: post.published }} />
            </div>
          </div>
        ))}
      </div>

      {/* Controles de Paginación */}
      <div className="mt-8 flex justify-center items-center gap-4">
        <Link 
          href={`/admin/posts?page=${Math.max(1, page - 1)}`}
          className={`flex items-center gap-1 px-3 py-1 border rounded ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
        >
          <ChevronLeft size={16} />
          Anterior
        </Link>
        <span className="text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Link 
          href={`/admin/posts?page=${Math.min(totalPages, page + 1)}`}
          className={`flex items-center gap-1 px-3 py-1 border rounded ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
        >
          Siguiente
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
