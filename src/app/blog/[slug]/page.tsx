import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
  });

  if (!post) {
    return {
      title: 'Post no encontrado',
    };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 150),
  };
}

export default async function PostPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
  });

  if (!post) {
    notFound();
  }

  // 1. Convierte Markdown a HTML
  const rawHtml = await marked.parse(post.content);
  // 2. Sanitiza el HTML para prevenir ataques XSS
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <article className="max-w-3xl mx-auto px-4 py-24 sm:py-32">
        <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm mb-8">
          <ArrowLeft size={18} />
          Volver al blog
        </Link>
        
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-4">{post.title}</h1>
        <time dateTime={post.createdAt.toISOString()} className="text-sm text-muted-foreground font-mono">
          Publicado el {new Date(post.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        <div className="prose prose-invert prose-lg mt-12 mx-auto"
             dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </article>
    </main>
  );
}

// Generar rutas estáticas para los posts publicados
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ where: { published: true } });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
