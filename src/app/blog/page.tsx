import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, PenSquare } from "lucide-react";
import { PageHero, PageShell, SectionPanel } from "@/components/shell/PagePrimitives";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Blog de Proyectos | Rodrigo Alonso",
  description: "Explorando las fronteras del código, la arquitectura de software y la ingeniería.",
};

export default async function PaginaBlog({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q || "";

  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { tags: true },
    });
  } catch (error) {
    console.error("Error fetching posts from database:", error);
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Blog"
        title="Notas técnicas, arquitectura y producto."
        description="Artículos, procesos y aprendizajes alrededor del software, la interacción y los sistemas que construyo."
        actions={
          <>
            <div className="min-w-[280px] max-w-md flex-1">
              <SearchBar />
            </div>
            <Link href="/admin" prefetch={false} className="action-pill">
              <PenSquare size={16} />
              <span>Acceso editores</span>
            </Link>
          </>
        }
        aside={
          <SectionPanel className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Archivo</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {posts.length} {posts.length === 1 ? "publicación" : "publicaciones"} {query ? "en resultado" : "publicadas"}.
            </p>
          </SectionPanel>
        }
      />

      {query ? (
        <p className="mb-8 text-sm text-muted-foreground">
          Mostrando resultados para <span className="font-semibold text-foreground">&quot;{query}&quot;</span>.
        </p>
      ) : null}

      {posts.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
              <article className="surface-panel flex h-full flex-col overflow-hidden">
                <div className="relative h-56 overflow-hidden border-b border-border/70">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-secondary" />
                  )}
                  {post.tags.length > 0 ? (
                    <div className="absolute left-4 top-4 rounded-full border border-border/80 bg-background/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur-xl">
                      {post.tags[0].name}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <time dateTime={post.createdAt.toISOString()}>
                      {new Date(post.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                    <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>

                  <h2 className="mb-3 text-2xl font-semibold leading-tight text-foreground">{post.title}</h2>
                  <p className="mb-6 flex-grow text-sm leading-7 text-muted-foreground">
                    {post.content.replace(/<[^>]*>?/gm, "").substring(0, 170)}...
                  </p>
                  <div className="surface-divider pt-4 text-sm font-medium text-foreground">Leer artículo</div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      ) : (
        <SectionPanel className="py-16 text-center">
          <h2 className="text-2xl font-semibold">No hay publicaciones todavía</h2>
          <p className="mt-3 text-muted-foreground">Este espacio se irá llenando con notas y artículos nuevos.</p>
        </SectionPanel>
      )}
    </PageShell>
  );
}
