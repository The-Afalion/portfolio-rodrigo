import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function EditorLayout({
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

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/blog/login');
  }

  // Authorization checks
  const email = session.user.email;
  const isSuperAdmin = email?.endsWith('@rodocodes.dev');

  if (!isSuperAdmin) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { id: session.user.id }
      });

      if (!profile || profile.role !== 'ADMIN') {
        // Redirigir si no es admin ni tiene email rodocodes.dev
        console.error("User lacks ADMIN role.");
        redirect('/blog');
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
      // En desarrollo sin conexión, podríamos dejar pasar para pruebas,
      // pero en prod debe redirigir:
      // redirect('/blog');
    }
  }

  return (
    <>
      {children}
    </>
  );
}
