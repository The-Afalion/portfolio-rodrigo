"use server";

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { ensureProfileForUserSafely } from '@/lib/profile';
import {
  type AuthAudience,
  type AuthMode,
  buildAuthCallbackUrl,
  formatSupabaseAuthError,
  resolveNextPath,
  resolveSuccessfulAuthPath,
} from '@/lib/auth';

type SubmitAuthFormInput = {
  audience: AuthAudience;
  mode: AuthMode;
  nextPath: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

type SubmitAuthFormResult = {
  error?: string;
  message?: string;
  needsEmailConfirmation?: boolean;
  redirectTo?: string;
  success?: boolean;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function submitAuthForm(input: SubmitAuthFormInput): Promise<SubmitAuthFormResult> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const email = normalizeEmail(input.email);
    const nextPath = resolveNextPath(input.audience, input.nextPath);

    if (!email) {
      return { error: 'El correo electrónico es obligatorio.' };
    }

    if (input.password.length < 8) {
      return { error: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    if (input.mode === 'signup' && input.password !== input.confirmPassword) {
      return { error: 'Las contraseñas no coinciden.' };
    }

    if (input.mode === 'signin') {
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password: input.password,
      });

      if (error) {
        return { error: formatSupabaseAuthError(error.message, input.mode) };
      }

      if (user) {
        await ensureProfileForUserSafely(user);
      }

      return {
        success: true,
        redirectTo: resolveSuccessfulAuthPath(input.audience, input.nextPath, user?.email),
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          display_name: email.split('@')[0],
        },
        emailRedirectTo: buildAuthCallbackUrl(nextPath),
      },
    });

    if (error) {
      return { error: formatSupabaseAuthError(error.message, input.mode) };
    }

    if (data.user) {
      await ensureProfileForUserSafely(data.user);
    }

    if (!data.session) {
      return {
        success: true,
        needsEmailConfirmation: true,
        message: 'Te hemos enviado un correo para confirmar la cuenta. En cuanto lo aceptes, podrás entrar con normalidad.',
      };
    }

    return {
      success: true,
      redirectTo: resolveSuccessfulAuthPath(input.audience, input.nextPath, data.user?.email),
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error: `Ha ocurrido un error inesperado: ${error.message}` };
    }

    return { error: 'Ha ocurrido un error inesperado.' };
  }
}
