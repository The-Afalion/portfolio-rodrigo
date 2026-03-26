import prisma from '@/lib/prisma';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog de Proyectos | Rodrigo Alonso',
  description: 'Explorando las fronteras del código, la arquitectura de software y la ingeniería.',
};

export default async function PaginaBlog({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q || '';

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: { tags: true },
  });

  return (
    <main className="bg-[#f8fafc] text-slate-800 min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-serif text-slate-900 font-bold tracking-tight mb-4">El Blog</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 font-serif italic">
            Reflexiones, proyectos e ideas. Un espacio tranquilo para la innovación.
          </p>
          <div className="max-w-md mx-auto">
            <SearchBar />
          </div>
        </div>

        {query && (
          <p className="text-center text-slate-500 mb-12">
            Mostrando resultados para &quot;<span className="font-semibold text-slate-800">{query}</span>&quot;
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
              <article className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Simulated Image Placeholder for elegant look */}
                <div className="h-48 bg-slate-100 w-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-50 opacity-50"></div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 uppercase tracking-wider font-semibold">
                    <time dateTime={post.createdAt.toISOString()}>
                      {new Date(post.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  <h2 className="text-xl font-bold font-serif text-slate-800 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-slate-500 line-clamp-3 leading-relaxed mb-6 flex-grow text-sm">
                    {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                  </p>

                  <div className="flex gap-2 flex-wrap mb-4">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag.id} className="px-3 py-1 text-[10px] rounded-full bg-blue-50 text-blue-600 font-semibold tracking-wide">
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-sm font-semibold text-blue-600">
                    Leer más <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-serif text-slate-800 font-semibold mb-2">Aún no hay publicaciones</h3>
            <p className="text-slate-500">Pronto habrá contenido interesante por aquí.</p>
          </div>
        )}

      </div>
    </main>
  );
}
