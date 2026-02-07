import prisma from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { BookOpen, Users, Swords, BarChart2 } from 'lucide-react';
import Link from 'next/link';

async function getStats() {
  const postCount = await prisma.post.count();
  const publishedPostCount = await prisma.post.count({ where: { published: true } });
  const subscriberCount = await prisma.subscriber.count();
  const chessGameCount = await prisma.chessGame.count();
  return { postCount, publishedPostCount, subscriberCount, chessGameCount };
}

export default async function AdminDashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Bienvenido, {user?.email?.split('@')[0]}</h1>
      <p className="text-muted-foreground mb-8">Este es el centro de control de tu portafolio.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Card de Posts */}
        <div className="bg-secondary p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">Posts Totales</h3>
            <BookOpen className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold">{stats.postCount}</p>
          <p className="text-sm text-muted-foreground">{stats.publishedPostCount} publicados</p>
        </div>
        {/* Card de Suscriptores */}
        <div className="bg-secondary p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">Suscriptores</h3>
            <Users className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold">{stats.subscriberCount}</p>
          <Link href="/admin/subscribers" className="text-sm text-blue-500 hover:underline">Ver lista</Link>
        </div>
        {/* Card de Partidas */}
        <div className="bg-secondary p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">Partidas Jugadas</h3>
            <Swords className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold">{stats.chessGameCount}</p>
          <Link href="/admin/chess" className="text-sm text-blue-500 hover:underline">Ver historial</Link>
        </div>
        {/* Card de Analíticas (Placeholder) */}
        <div className="bg-secondary p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">Visitas (Próximamente)</h3>
            <BarChart2 className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold">N/A</p>
          <p className="text-sm text-muted-foreground">Integración con Vercel Analytics</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Acciones Rápidas</h2>
        <div className="flex gap-4">
          <Link href="/admin/posts" className="px-6 py-3 bg-foreground text-background rounded hover:opacity-80 transition-opacity">
            Escribir Nuevo Post
          </Link>
        </div>
      </div>
    </div>
  );
}
