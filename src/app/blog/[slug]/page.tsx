import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { incrementViews } from "@/app/blog/actions";
import LikeButton from "@/app/blog/LikeButton";
import Image from "next/image";
import { PageHero, PageShell, SectionInset } from "@/components/shell/PagePrimitives";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug, published: true },
    });

    if (!post) {
      return { title: "Post no encontrado" };
    }

    return {
      title: post.title,
      description: post.content.substring(0, 150),
    };
  } catch (error) {
    console.error("Error generating metadata from DB:", error);
    return { title: "Blog Post" };
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
  const fontClass = post.typography || "font-serif";

  return (
    <PageShell>
      <div className="mb-8">
        <Link href="/blog" className="action-pill">
          <ArrowLeft size={16} />
          <span>Volver al blog</span>
        </Link>
      </div>

      <PageHero
        eyebrow="Artículo"
        title={post.title}
        description={new Date(post.createdAt).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })}
        aside={
          <SectionInset className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Lecturas</p>
            <p className="inline-flex items-center gap-2 text-sm leading-7 text-muted-foreground">
              <Eye size={16} />
              {post.views.toLocaleString("es-ES")} vistas
            </p>
          </SectionInset>
        }
      />

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="space-y-10">
          {post.coverImage ? (
            <div className="overflow-hidden border border-border/80">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1400}
                height={900}
                sizes="(min-width: 1280px) 960px, 100vw"
                className="h-auto max-h-[620px] w-full object-cover"
              />
            </div>
          ) : null}

          <div
            className={`prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/85 prose-p:leading-8 prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 prose-strong:text-foreground prose-blockquote:border-l-border prose-blockquote:pl-5 prose-blockquote:text-foreground/80 prose-code:text-foreground prose-pre:border prose-pre:border-border/80 prose-pre:bg-secondary/70 ${fontClass}`}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />

          <div className="border-t border-border/80 pt-8">
            <LikeButton slug={post.slug} initialLikes={post.likes} />
          </div>
        </article>

        <aside className="space-y-6 border-t border-border/80 pt-8 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Etiquetas</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/tags/${tag.name}`}
                  className="rounded-full border border-border/80 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
