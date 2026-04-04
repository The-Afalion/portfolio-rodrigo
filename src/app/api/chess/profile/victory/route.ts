import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { ensureProfileForUser } from '@/lib/profile';

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

  await ensureProfileForUser(user);

  const profile = await prisma.profile.update({
    where: { id: user.id },
    data: {
      elo: {
        increment: 50,
      },
    },
    select: {
      elo: true,
    },
  });

  return NextResponse.json({ elo: profile.elo });
}
