import { createBrowserClient } from "@supabase/ssr";
import { createMissingSupabaseClient, getSupabaseBrowserEnv } from "@/lib/supabase-env";

export function createClient() {
  const env = getSupabaseBrowserEnv();

  if (!env) {
    return createMissingSupabaseClient(
      "FALTAN NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para inicializar Supabase en el cliente."
    );
  }

  return createBrowserClient(env.url, env.key);
}
