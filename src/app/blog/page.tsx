import prisma from "@/lib/prisma";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, PenSquare } from "lucide-react";
import { PageHero, PageShell, SectionInset } from "@/components/shell/PagePrimitives";

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
        title="Notas sobre producto, implementación y sistemas."
        description="Artículos, diarios de proyecto y apuntes técnicos escritos para leerse rápido y volver cuando hagan falta."
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
          <SectionInset className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Archivo</p>
            <p className="text-sm leading-7 text-muted-foreground">
              {posts.length} {posts.length === 1 ? "publicación" : "publicaciones"} {query ? "en resultado" : "publicadas"}.
            </p>
          </SectionInset>
        }
      />

      {query ? (
        <p className="mb-8 text-sm text-muted-foreground">
          Mostrando resultados para <span className="font-semibold text-foreground">&quot;{query}&quot;</span>.
        </p>
      ) : null}

      {posts.length > 0 ? (
        <section className="divide-y divide-border/80 border-y border-border/80">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block py-7">
              <article className="grid gap-6 lg:grid-cols-[180px,minmax(0,1fr),auto] lg:items-start">
                <div className="space-y-3">
                  <time
                    dateTime={post.createdAt.toISOString()}
                    className="block text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground"
                  >
                    {new Date(post.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </time>
                  {post.coverImage ? (
                    <div className="relative h-24 overflow-hidden rounded-[1.2rem] border border-border/80">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">{post.title}</h2>
                    <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                      {post.content.replace(/<[^>]*>?/gm, "").substring(0, 190)}...
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full border border-border/80 bg-white/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <ArrowUpRight size={18} className="hidden text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 lg:block" />
              </article>
            </Link>
          ))}
        </section>
      ) : (
        <SectionInset className="py-16 text-center">
          <h2 className="text-2xl font-semibold">No hay publicaciones todavía</h2>
          <p className="mt-3 text-muted-foreground">Este espacio se irá llenando con notas y artículos nuevos.</p>
        </SectionInset>
      )}
    </PageShell>
  );
}
