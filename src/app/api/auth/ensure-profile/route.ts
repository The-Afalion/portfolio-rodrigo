import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { ensureProfileForUser, getUserDisplayName } from '@/lib/profile';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await ensureProfileForUser(user);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? null,
      displayName: getUserDisplayName(user),
    },
    profile: {
      elo: profile.elo,
      role: profile.role,
    },
  });
}
