"use server";

import { ensureProfileForUserSafely } from '@/lib/profile';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function signInWithPassword(email: string, password: string) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const normalizedEmail = email.trim().toLowerCase();

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        return { error: 'Usuario o contraseña incorrectos.' };
      }
      return { error: `Error de Supabase: ${error.message}` };
    }

    if (user) {
      await ensureProfileForUserSafely(user);
    }

    return { success: true };

  } catch (e) {
    if (e instanceof Error) {
      return { error: `Ha ocurrido un error inesperado: ${e.message}` };
    }
    return { error: 'Ha ocurrido un error inesperado.' };
  }
}
