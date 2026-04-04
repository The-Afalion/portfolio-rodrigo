import type { SupabaseClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  null;
export const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_KEY ??
  null;

export function hasSupabaseBrowserEnv() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function hasSupabaseAdminEnv() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function getSupabaseBrowserEnv() {
  if (!hasSupabaseBrowserEnv()) {
    return null;
  }

  return {
    url: supabaseUrl as string,
    key: supabasePublishableKey as string,
  };
}

export function getSupabaseAdminEnv() {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  return {
    url: supabaseUrl as string,
    key: supabaseServiceRoleKey as string,
  };
}

export function createMissingSupabaseClient(message: string) {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(message);
      },
    }
  ) as SupabaseClient;
}
