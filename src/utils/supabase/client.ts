import { createBrowserClient } from "@supabase/ssr";
import { createMissingSupabaseClient, getSupabaseBrowserEnv } from "@/lib/supabase-env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const env = getSupabaseBrowserEnv();

  if (!env) {
    return createMissingSupabaseClient(
      "FALTAN NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para inicializar Supabase en el cliente."
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(env.url, env.key);
  }

  return browserClient;
}
