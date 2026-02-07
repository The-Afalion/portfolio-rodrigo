import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { tag: string } }) {
  return {
    title: `Posts sobre #${params.tag}`,
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      tags: {
        some: {
          name: tag,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (posts.length === 0) {
    notFound();
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-2">
          Blog <span className="text-blue-500">#{tag}</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          {posts.length} {posts.length === 1 ? 'artículo encontrado' : 'artículos encontrados'}.
        </p>

        <div className="space-y-10">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
              <article>
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
      </div>
    </main>
  );
}
