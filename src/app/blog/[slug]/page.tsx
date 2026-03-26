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
  try {
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
  } catch (error) {
    console.error("Error generating metadata from DB:", error);
    return { title: 'Blog Post' };
  }
}

export default async function PostPage({ params }: Props) {
  try {
    await incrementViews(params.slug);
  } catch (e) {
    console.error("Failed to increment views:", e);
  }

  let post = null;
  try {
    post = await prisma.post.findUnique({
      where: { slug: params.slug, published: true },
      include: { tags: true },
    });
  } catch (error) {
    console.error("Error fetching post from DB:", error);
  }

  if (!post) {
    notFound();
  }

  const rawHtml = await marked.parse(post.content);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  const fontClass = post.typography || 'font-serif';

  return (
    <main className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans">
      {/* Elegante cabecera */}
      <header className="bg-white border-b border-slate-100 pt-32 pb-16 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-xs font-bold tracking-widest uppercase mb-10">
            <ArrowLeft size={16} />
            Todos los artículos
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
      <article className="max-w-3xl mx-auto px-4 py-16 sm:py-24 bg-white/50 my-8 rounded-3xl border border-slate-100 shadow-sm">
        {post.coverImage && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-slate-100">
            <img src={post.coverImage} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
          </div>
        )}

        {/* Usamos prose para estilos de texto, adaptado para fondo claro y colores suaves */}
        <div className={`prose prose-slate prose-lg max-w-none
                        prose-headings:${fontClass} prose-headings:text-slate-900 prose-headings:font-bold
                        prose-p:text-slate-700 prose-p:leading-relaxed prose-p:${fontClass}
                        prose-a:text-blue-600 hover:prose-a:text-blue-800
                        prose-strong:text-slate-900 prose-strong:font-semibold
                        prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700 prose-blockquote:${fontClass} prose-blockquote:italic
                        prose-img:rounded-2xl prose-img:shadow-md border-slate-100`}
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
