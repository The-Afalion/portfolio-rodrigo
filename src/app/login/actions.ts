"use server";

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

export async function requestLogin(email: string) {
  // 1. Comprobación de seguridad en el servidor
  if (email !== process.env.ADMIN_EMAIL) {
    return { error: "Acceso no autorizado." };
  }

  const supabase = createRouteHandlerClient({ cookies });
  const headersList = headers();
  const origin = headersList.get('origin');

  // 2. Envío del Magic Link
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
