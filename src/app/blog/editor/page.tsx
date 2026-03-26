import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InviteAdminForm from './InviteAdminForm';

export default async function EditorDashboard() {
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
    redirect('/blog/login');
  }

  const isSuperAdmin = session.user.email?.endsWith('@rodocodes.dev');

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-16 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Panel de Editor</h1>
            <p className="text-slate-500">Bienvenido, {session.user.email}</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/blog"
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Ver Blog
            </Link>
            <Link
              href="/blog/editor/new"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Nuevo Proyecto
            </Link>
          </div>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <h2 className="text-xl font-serif font-bold text-slate-800 mb-4">Tus Publicaciones</h2>
          <p className="text-slate-500 mb-6">Aún no has escrito ninguna publicación o estamos cargando tu historial.</p>
          {/* Aquí iría una lista de publicaciones del usuario. Por ahora un placeholder. */}
          <Link
            href="/blog/editor/new"
            className="inline-block px-6 py-3 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            Comenzar a escribir
          </Link>
        </div>

        {isSuperAdmin && (
           <div className="mt-8">
             <InviteAdminForm />
           </div>
        )}
      </div>
    </div>
  );
}
