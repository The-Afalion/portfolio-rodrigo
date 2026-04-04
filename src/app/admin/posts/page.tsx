import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, FileText, PenSquare, Rocket } from 'lucide-react';
import PostActions from './PostActions';
import PostForm from './PostForm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const POSTS_PER_PAGE = 6;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [totalPosts, publishedPosts, tagCount, posts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.tag.count(),
    prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      take: POSTS_PER_PAGE,
      skip: (page - 1) * POSTS_PER_PAGE,
      include: {
        tags: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const draftPosts = totalPosts - publishedPosts;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Editorial</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Gestión de posts</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Un único flujo de publicación para crear, editar y publicar artículos con metadatos reales del modelo y validación clara.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total de posts</p>
            <FileText size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{totalPosts}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Publicados</p>
            <Rocket size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{publishedPosts}</p>
          <p className="mt-2 text-sm text-muted-foreground">{draftPosts} borradores</p>
        </div>
        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Etiquetas</p>
            <PenSquare size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{tagCount}</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-secondary/50 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Nuevo artículo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea el contenido completo desde aquí con portada, tipografía, etiquetas y estado de publicación.
          </p>
        </div>
        <PostForm />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Biblioteca editorial</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Página {page} de {totalPages}.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-[28px] border border-border bg-secondary/50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{post.title}</h3>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      post.published
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                        : 'border-border/70 bg-background/70 text-muted-foreground'
                    }`}>
                      {post.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Actualizado: {formatDate(post.updatedAt)}</span>
                    <span>{post.views} vistas</span>
                    <span>{post.likes} likes</span>
                    <span>Tipografía: {post.typography}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag.id} className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {tag.name}
                      </span>
                    ))}
                    {post.tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">Sin etiquetas</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="rounded-2xl border border-border/70 bg-background/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
                  >
                    Editar
                  </Link>
                  {post.published ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="rounded-2xl border border-border/70 bg-background/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
                    >
                      Ver
                    </Link>
                  ) : null}
                  <PostActions post={{ id: post.id, published: post.published }} />
                </div>
              </div>
            </div>
          ))}

          {posts.length === 0 ? (
            <p className="rounded-[28px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Todavía no hay posts en esta página.
            </p>
          ) : null}
        </div>
      </section>

      <div className="flex items-center justify-center gap-4">
        <Link
          href={`/admin/posts?page=${Math.max(1, page - 1)}`}
          className={`inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm transition-colors ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
        >
          <ChevronLeft size={16} />
          Anterior
        </Link>
        <span className="text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Link
          href={`/admin/posts?page=${Math.min(totalPages, page + 1)}`}
          className={`inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm transition-colors ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
        >
          Siguiente
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
