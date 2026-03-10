"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function signInWithPassword(email: string, password: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            cookieStore.set({ name, value, ...options });
          },
          remove: (name: string, options: any) => {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        return { error: 'Usuario o contraseña incorrectos.' };
      }
      return { error: `Error de Supabase: ${error.message}` };
    }

    return { success: true };

  } catch (e) {
    if (e instanceof Error) {
      return { error: `Ha ocurrido un error inesperado: ${e.message}` };
    }
    return { error: 'Ha ocurrido un error inesperado.' };
  }
}
