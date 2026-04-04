"use server";

import { ensureProfileForUser } from '@/lib/profile';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function signUp(email: string, password: string, confirmPassword: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return { error: 'El correo electrónico es obligatorio.' };
    }

    if (password.length < 8) {
      return { error: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    if (password !== confirmPassword) {
      return { error: 'Las contraseñas no coinciden.' };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          display_name: normalizedEmail.split('@')[0],
        },
      },
    });

    if (error) {
      return { error: `Error de Supabase: ${error.message}` };
    }

    if (data.user) {
      await ensureProfileForUser(data.user);
    }

    return {
      success: true,
      needsEmailConfirmation: !data.session,
    };

  } catch (e) {
    if (e instanceof Error) {
      return { error: `Ha ocurrido un error inesperado: ${e.message}` };
    }
    return { error: 'Ha ocurrido un error inesperado.' };
  }
}
