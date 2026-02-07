import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { incrementViews } from './actions';
import LikeButton from './LikeButton'; // Componente para el botón de like

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  // ... (código existente)
}

export default async function PostPage({ params }: Props) {
  // Incrementar vistas
  await incrementViews(params.slug);

  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
    include: { tags: true },
  });

  if (!post) {
    notFound();
  }

  const rawHtml = await marked.parse(post.content);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <article className="max-w-3xl mx-auto px-4 py-24 sm:py-32">
        <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm mb-8">
          <ArrowLeft size={18} />
          Volver al blog
        </Link>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <Link key={tag.id} href={`/blog/tags/${tag.name}`} className="text-xs font-mono px-2 py-1 rounded bg-secondary hover:bg-muted">
              #{tag.name}
            </Link>
          ))}
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
          <time dateTime={post.createdAt.toISOString()}>
            {new Date(post.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {post.views.toLocaleString('es-ES')} vistas
          </span>
        </div>

        <div className="prose prose-invert prose-lg mt-12 mx-auto"
             dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        
        <div className="mt-12 pt-8 border-t border-border flex justify-center">
          <LikeButton slug={post.slug} initialLikes={post.likes} />
        </div>
      </article>
    </main>
  );
}
