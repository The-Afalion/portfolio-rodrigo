import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createMissingSupabaseClient, getSupabaseBrowserEnv } from "@/lib/supabase-env";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export function createClient(cookieStore: ReturnType<typeof cookies>) {
  const env = getSupabaseBrowserEnv();

  if (!env) {
    return createMissingSupabaseClient(
      "FALTAN NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para inicializar Supabase en el servidor."
    );
  }

  return createServerClient(
    env.url,
    env.key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
