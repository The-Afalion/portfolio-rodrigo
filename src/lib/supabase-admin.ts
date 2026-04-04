import 'server-only';

import { createClient, type User } from '@supabase/supabase-js';
import { getSupabaseAdminEnv } from '@/lib/supabase-env';

export function getSupabaseAdminClient() {
  const env = getSupabaseAdminEnv();

  if (!env) {
    throw new Error('Faltan las credenciales admin de Supabase en el entorno del servidor.');
  }

  return createClient(env.url, env.key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function listAllSupabaseUsers() {
  const supabaseAdmin = getSupabaseAdminClient();
  const users: User[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    users.push(...data.users);

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

export async function findSupabaseUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await listAllSupabaseUsers();
  return users.find((user) => user.email?.trim().toLowerCase() === normalizedEmail) ?? null;
}
