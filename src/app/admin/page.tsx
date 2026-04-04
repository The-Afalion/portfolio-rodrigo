import Link from 'next/link';
import prisma from '@/lib/prisma';
import { MessageSquare, BookOpen, BarChart3, Eye, Heart, ShieldCheck, Swords, Users, ArrowRight } from 'lucide-react';
import { getEditorAccess } from '@/lib/editor-access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-ES').format(value);
}

export default async function AdminDashboardPage() {
  const access = await getEditorAccess();

  const [
    posts,
    postAggregate,
    publishedPosts,
    tags,
    subscribers,
    messages,
    unreadMessages,
    totalMessages,
    profiles,
    games,
    totalGames,
    completedGames,
  ] = await Promise.all([
    prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        tags: true,
      },
    }),
    prisma.post.aggregate({
      _count: { id: true },
      _sum: { views: true, likes: true },
    }),
    prisma.post.count({ where: { published: true } }),
    prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    }),
    prisma.subscriber.count(),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.count(),
    prisma.profile.findMany({
      select: {
        id: true,
        role: true,
        elo: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.chessGame.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        result: true,
        createdAt: true,
        botId: true,
      },
    }),
    prisma.chessGame.count(),
    prisma.chessGame.count({ where: { status: 'COMPLETED' } }),
  ]);

  const totalPosts = postAggregate._count.id;
  const totalViews = postAggregate._sum.views ?? 0;
  const totalLikes = postAggregate._sum.likes ?? 0;
  const draftPosts = totalPosts - publishedPosts;
  const totalEditors = profiles.filter((profile) => profile.role === 'ADMIN').length;
  const averageElo = profiles.length > 0 ? Math.round(profiles.reduce((sum, profile) => sum + profile.elo, 0) / profiles.length) : 0;
  const topTags = [...tags].sort((left, right) => right._count.posts - left._count.posts).slice(0, 5);
  const recentMessages = messages;
  const recentGames = games;
  const recentPosts = posts;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Panel central</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Bienvenido, {access.user?.email?.split('@')[0] ?? 'equipo'}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Resumen operativo del portfolio: contenidos, actividad editorial, mensajes, usuarios y señales clave del ecosistema.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Posts</p>
            <BookOpen size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{formatNumber(totalPosts)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{formatNumber(publishedPosts)} publicados, {formatNumber(draftPosts)} borradores</p>
        </div>

        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Audiencia</p>
            <Eye size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{formatNumber(totalViews)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{formatNumber(totalLikes)} likes acumulados</p>
        </div>

        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Buzón</p>
            <MessageSquare size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{formatNumber(totalMessages)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{formatNumber(unreadMessages)} sin leer</p>
        </div>

        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Comunidad</p>
            <Users size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{formatNumber(profiles.length)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{formatNumber(totalEditors)} editores, ELO medio {formatNumber(averageElo)}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Últimos artículos</h2>
                <p className="mt-2 text-sm text-muted-foreground">Vista rápida del estado editorial y su rendimiento inmediato.</p>
              </div>
              <Link href="/admin/posts" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline">
                <span>Gestionar posts</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="rounded-3xl border border-border/70 bg-background/70 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">{post.title}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>{post.published ? 'Publicado' : 'Borrador'}</span>
                        <span>{formatDate(post.updatedAt)}</span>
                        <span>{formatNumber(post.views)} vistas</span>
                        <span>{formatNumber(post.likes)} likes</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag.id} className="rounded-full border border-border/70 bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {recentPosts.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Todavía no hay artículos creados.
                </p>
              ) : null}
            </div>
          </div>

          {access.isSuperAdmin ? (
            <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Mensajes recientes</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Contacto entrante para priorizar respuestas.</p>
                </div>
                <Link href="/admin/messages" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline">
                  <span>Abrir buzón</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div key={message.id} className="rounded-3xl border border-border/70 bg-background/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{message.name}</p>
                        <p className="text-xs text-muted-foreground">{message.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">{message.message}</p>
                  </div>
                ))}

                {recentMessages.length === 0 ? (
                  <p className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No hay mensajes recientes.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Resumen de sistema</h2>
              <BarChart3 size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Newsletter</span>
                <span className="font-medium text-foreground">{formatNumber(subscribers)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Partidas registradas</span>
                <span className="font-medium text-foreground">{formatNumber(totalGames)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Partidas completadas</span>
                <span className="font-medium text-foreground">{formatNumber(completedGames)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Etiquetas usadas</span>
                <span className="font-medium text-foreground">{formatNumber(tags.length)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Etiquetas destacadas</h2>
              <Heart size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {topTags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
                  <span className="font-medium text-foreground">{tag.name}</span>
                  <span className="text-muted-foreground">{formatNumber(tag._count.posts)} posts</span>
                </div>
              ))}

              {topTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no hay etiquetas registradas.</p>
              ) : null}
            </div>
          </div>

          {access.isSuperAdmin ? (
            <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Accesos privilegiados</h2>
                <ShieldCheck size={18} className="text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <Link href="/admin/team" className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground transition-colors hover:bg-background">
                  <span>Gestionar editores</span>
                  <ArrowRight size={16} />
                </Link>
                <Link href="/admin/subscribers" className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground transition-colors hover:bg-background">
                  <span>Ver suscriptores</span>
                  <ArrowRight size={16} />
                </Link>
                <Link href="/admin/chess" className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground transition-colors hover:bg-background">
                  <span>Auditar chess</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : null}

          <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Actividad reciente de chess</h2>
              <Swords size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {recentGames.map((game) => (
                <div key={game.id} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-foreground">{game.botId ? 'Contra bot' : 'Multijugador'}</span>
                    <span className="text-muted-foreground">{game.status}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{game.result ?? 'Sin resultado'}</span>
                    <span>{formatDate(game.createdAt)}</span>
                  </div>
                </div>
              ))}

              {recentGames.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todavía no hay partidas registradas.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
