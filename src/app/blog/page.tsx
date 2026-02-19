import prisma from '@/lib/prisma';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
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
    <main className="bg-background text-foreground min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Blog Técnico</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Explorando las fronteras del código, la arquitectura de software y la inteligencia artificial.
          </p>
          <div className="max-w-md mx-auto">
            <SearchBar />
          </div>
        </div>

        {query && (
          <p className="text-center text-muted-foreground mb-12">
            Mostrando resultados para "<span className="font-semibold text-foreground">{query}</span>"
          </p>
        )}

        <div className="grid gap-10">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <article className="relative flex flex-col gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mb-2">
                  <time dateTime={post.createdAt.toISOString()}>
                    {new Date(post.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>•</span>
                  <div className="flex gap-2">
                    {post.tags.map(tag => (
                      <span key={tag.id} className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                  {post.content.replace(/<[^>]*>?/gm, '').substring(0, 200)}...
                </p>

                <div className="mt-4 flex items-center text-sm font-medium text-primary">
                  Leer artículo <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-secondary/20">
            <h3 className="text-xl font-semibold mb-2">No se encontraron artículos</h3>
            <p className="text-muted-foreground">Intenta ajustar tu búsqueda o explora otros temas.</p>
          </div>
        )}

      </div>
    </main>
  );
}
