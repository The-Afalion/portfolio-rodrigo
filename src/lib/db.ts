import { createClient } from '@supabase/supabase-js';
import {
  createMissingSupabaseClient,
  getSupabaseAdminEnv,
  getSupabaseBrowserEnv,
  hasSupabaseAdminEnv,
  hasSupabaseBrowserEnv,
} from '@/lib/supabase-env';

const browserEnv = getSupabaseBrowserEnv();
const adminEnv = getSupabaseAdminEnv();

export { hasSupabaseAdminEnv, hasSupabaseBrowserEnv };

export const supabase = browserEnv
  ? createClient(browserEnv.url, browserEnv.key)
  : createMissingSupabaseClient('La zona online no está disponible en esta versión.');

export const supabaseAdmin = adminEnv
  ? createClient(adminEnv.url, adminEnv.key)
  : createMissingSupabaseClient('La zona online no está disponible en esta versión.');

export function isMissingSupabaseTableError(error: { message?: string | null; code?: string | null } | null | undefined) {
  if (!error) {
    return false;
  }

  const message = error.message ?? '';
  return (
    message.includes('schema cache') ||
    message.includes('Could not find the table') ||
    message.includes('relation') && message.includes('does not exist')
  );
}
