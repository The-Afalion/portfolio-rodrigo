"use server";

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function signInWithPassword(email: string, password: string) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

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
