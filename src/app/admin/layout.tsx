import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Users, Swords, Home, AlertTriangle, Inbox } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return (
      <div className="flex min-h-screen bg-background font-mono items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Acceso Denegado</h1>
          <p className="mt-6 text-base leading-7 text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
          <div className="mt-10">
            <Link href="/" className="text-sm font-semibold leading-7 text-primary-foreground">
              <span aria-hidden="true">&larr;</span> Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background font-mono">
      <aside className="w-64 bg-secondary border-r border-border flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-8 text-foreground">Admin Panel</h2>
        <nav className="flex flex-col gap-4">
          <Link href="/admin" className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors">
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/posts" className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors">
            <BookOpen size={20} />
            <span>Posts</span>
          </Link>
          <Link href="/admin/messages" className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors">
            <Inbox size={20} />
            <span>Mensajes</span>
          </Link>
          <Link href="/admin/subscribers" className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors">
            <Users size={20} />
            <span>Suscriptores</span>
          </Link>
          <Link href="/admin/chess" className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors">
            <Swords size={20} />
            <span>Partidas Ajedrez</span>
          </Link>
        </nav>
        <div className="mt-auto">
          <Link href="/" className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground">
            <Home size={18} />
            <span>Volver a la web</span>
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
