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

  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
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
  } catch (error) {
    console.error("Error fetching posts from database:", error);
    // Return empty array or fallback data if DB is unavailable
  }

  return (
    <main className="bg-[#f8fafc] text-slate-800 min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="absolute top-8 right-8 z-50">
        <Link
          href="/blog/editor"
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
        >
          Acceso Editores
        </Link>
      </div>

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
              <article className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1">
                {/* Simulated Image Placeholder for elegant look */}
                <div className="h-56 bg-slate-100 w-full relative overflow-hidden">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-slate-100 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white/50 blur-2xl"></div>
                    </div>
                  )}
                  {/* Etiqueta flotante */}
                  {post.tags.length > 0 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-slate-700 shadow-sm">
                      {post.tags[0].name}
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 uppercase tracking-wider font-semibold">
                    <time dateTime={post.createdAt.toISOString()}>
                      {new Date(post.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC'
                      })}
                    </time>
                  </div>

                  <h2 className="text-xl font-bold font-serif text-slate-800 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-slate-500 line-clamp-3 leading-relaxed mb-6 flex-grow text-sm">
                    {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                    Leer artículo <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
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
