import { createBrowserClient } from "@supabase/ssr";
import { createMissingSupabaseClient, getSupabaseBrowserEnv } from "@/lib/supabase-env";

declare global {
  interface Window {
    __supabaseBrowserClient?: ReturnType<typeof createBrowserClient>;
  }
}

export function createClient() {
  const env = getSupabaseBrowserEnv();

  if (!env) {
    return createMissingSupabaseClient(
      "La zona online no está disponible en esta versión."
    );
  }

  if (typeof window === "undefined") {
    return createBrowserClient(env.url, env.key);
  }

  if (!window.__supabaseBrowserClient) {
    window.__supabaseBrowserClient = createBrowserClient(env.url, env.key);
  }

  return window.__supabaseBrowserClient;
}
