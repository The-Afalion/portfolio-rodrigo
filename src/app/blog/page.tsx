import prisma from '@/lib/prisma';
import Link from 'next/link';
import SearchBar from './SearchBar'; // Componente para la barra de búsqueda

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog | Rodrigo Alonso',
  description: 'Artículos sobre desarrollo de software, inteligencia artificial y tecnología.',
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
    <main className="bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-2">Blog Técnico</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Un espacio para compartir ideas, proyectos y aprendizajes.
          </p>
          <SearchBar />
        </div>

        {query && (
          <p className="text-center text-muted-foreground mb-10">
            {posts.length} {posts.length === 1 ? 'resultado' : 'resultados'} para "<strong>{query}</strong>".
          </p>
        )}

        <div className="space-y-10">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
              <article>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags.map(tag => (
                    <span key={tag.id} className="text-xs font-mono px-2 py-1 rounded bg-secondary">
                      #{tag.name}
                    </span>
                  ))}
                </div>
                <header>
                  <h2 className="text-2xl sm:text-3xl font-bold group-hover:text-blue-500 transition-colors">
                    {post.title}
                  </h2>
                  <time dateTime={post.createdAt.toISOString()} className="text-sm text-muted-foreground font-mono mt-1">
                    {new Date(post.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </header>
                <p className="mt-3 text-muted-foreground">{post.content.substring(0, 200)}...</p>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold">No se encontraron posts</h3>
            <p className="text-muted-foreground mt-2">Intenta con otra búsqueda o explora las etiquetas.</p>
          </div>
        )}

      </div>
    </main>
  );
}
