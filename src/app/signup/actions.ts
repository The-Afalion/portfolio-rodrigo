"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function signUp(email, password) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This is a server-only action, so cookies can be set.
          }
        },
        remove: (name, options) => {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Same as above.
          }
        },
      },
    }
  );

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: `Error de Supabase: ${error.message}` };
    }

    // After signing up, Supabase automatically signs the user in.
    // We need to create a profile for the new user.
    if (data.user) {
      await supabase.from('Profile').insert({ id: data.user.id });
    }

    return { success: true };

  } catch (e) {
    if (e instanceof Error) {
      return { error: `Ha ocurrido un error inesperado: ${e.message}` };
    }
    return { error: 'Ha ocurrido un error inesperado.' };
  }
}
