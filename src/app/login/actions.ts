"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

export async function requestLogin(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL;

  // --- PRUEBA DE DEPURACIÓN ---
  // Comparamos y si falla, devolvemos el valor que está leyendo el servidor.
  if (email.toLowerCase() !== adminEmail?.toLowerCase()) {
    return { error: `Acceso no autorizado. El servidor esperaba el email: [${adminEmail}] pero recibió: [${email}]` };
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  
  const headersList = headers();
  const origin = headersList.get('origin');

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: `Error de Supabase: ${error.message}` };
  }

  return { success: true };
}
