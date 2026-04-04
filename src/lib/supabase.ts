import { createClient } from '@supabase/supabase-js';
import { getSupabaseBrowserEnv } from '@/lib/supabase-env';

const env = getSupabaseBrowserEnv();

export const supabase = env
  ? createClient(env.url, env.key, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
