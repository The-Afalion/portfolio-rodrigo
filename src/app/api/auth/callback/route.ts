import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  let redirectUrl = requestUrl.origin;

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    // --- LÓGICA DE REDIRECCIÓN ---
    // Si el usuario que ha iniciado sesión es el admin, lo llevamos al dashboard.
    if (session?.user?.email === process.env.ADMIN_EMAIL) {
      redirectUrl = `${requestUrl.origin}/admin`;
    }
  }

  return NextResponse.redirect(redirectUrl);
}
