import 'server-only';

import type { User } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? '';
}

function isAdminEmail(email?: string | null) {
  const normalizedEmail = normalizeEmail(email);
  const configuredAdminEmails = [
    process.env.ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  ]
    .filter(Boolean)
    .map((value) => normalizeEmail(value));

  return (
    normalizedEmail.endsWith('@rodocodes.dev') ||
    configuredAdminEmails.includes(normalizedEmail)
  );
}

export function getUserDisplayName(user: Pick<User, 'email' | 'user_metadata'>) {
  const metadata = user.user_metadata ?? {};
  const fromMetadata =
    metadata.display_name ??
    metadata.full_name ??
    metadata.name ??
    metadata.username;

  if (typeof fromMetadata === 'string' && fromMetadata.trim().length > 0) {
    return fromMetadata.trim();
  }

  const email = user.email?.trim();
  if (!email) {
    return 'Usuario';
  }

  return email.split('@')[0];
}

export async function ensureProfileForUser(user: Pick<User, 'id' | 'email'>) {
  const role = isAdminEmail(user.email) ? 'ADMIN' : undefined;

  return prisma.profile.upsert({
    where: { id: user.id },
    update: role ? { role } : {},
    create: {
      id: user.id,
      ...(role ? { role } : {}),
    },
  });
}
