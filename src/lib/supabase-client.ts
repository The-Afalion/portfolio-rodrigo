import { createClient } from '@/utils/supabase/client';
import { hasSupabaseBrowserEnv } from '@/lib/supabase-env';

export const supabase = hasSupabaseBrowserEnv() ? createClient() : null;
