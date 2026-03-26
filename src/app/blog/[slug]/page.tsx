import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { incrementViews } from '@/app/blog/actions'; // Ruta absoluta
import LikeButton from '@/app/blog/LikeButton'; // Ruta absoluta

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
  });

  if (!post) {
    return { title: 'Post no encontrado' };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 150),
  };
}

export default async function PostPage({ params }: Props) {
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

  // Here we would typically check if the post uses a specific typography
  // For now, we apply the default elegant Serif font

  return (
    <main className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans">
      {/* Elegante cabecera */}
      <header className="bg-white border-b border-slate-200 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold tracking-wide uppercase mb-8">
            <ArrowLeft size={16} />
            Volver al blog
          </Link>

          <div className="mb-6 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Link key={tag.id} href={`/blog/tags/${tag.name}`} className="text-[10px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                {tag.name}
              </Link>
            ))}
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif text-slate-900 font-bold leading-tight mb-6">{post.title}</h1>

          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span className="flex items-center gap-2">
              <Eye size={16} />
              {post.views.toLocaleString('es-ES')} vistas
            </span>
          </div>
        </div>
      </header>

      {/* Contenido del Post */}
      <article className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        {/* Usamos prose para estilos de texto, adaptado para fondo claro y colores suaves */}
        <div className="prose prose-slate prose-lg max-w-none
                        prose-headings:font-serif prose-headings:text-slate-900 prose-headings:font-bold
                        prose-p:text-slate-700 prose-p:leading-relaxed prose-p:font-serif
                        prose-a:text-blue-600 hover:prose-a:text-blue-800
                        prose-strong:text-slate-900 prose-strong:font-semibold
                        prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700 prose-blockquote:font-serif prose-blockquote:italic
                        prose-img:rounded-xl prose-img:shadow-lg"
             dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        
        <div className="mt-16 pt-8 border-t border-slate-200 flex justify-center">
          <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100">
             <LikeButton slug={post.slug} initialLikes={post.likes} />
          </div>
        </div>
      </article>
    </main>
  );
}
