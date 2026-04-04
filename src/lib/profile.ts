import 'server-only';

import type { User } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';

export type CommunitySide = 'WHITE' | 'BLACK';

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

function isMissingProfileTableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes('does not exist') ||
    error.message.includes('The table `public.Profile` does not exist') ||
    error.message.includes('Could not find the table') ||
    error.message.includes('P2021')
  );
}

function getRandomCommunitySide(): CommunitySide {
  return Math.random() < 0.5 ? 'WHITE' : 'BLACK';
}

export async function ensureProfileForUser(user: Pick<User, 'id' | 'email'>) {
  const role = isAdminEmail(user.email) ? 'ADMIN' : undefined;
  const existingProfile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (existingProfile) {
    if (!existingProfile.communitySide || (role && existingProfile.role !== role)) {
      return prisma.profile.update({
        where: { id: user.id },
        data: {
          ...(role ? { role } : {}),
          ...(existingProfile.communitySide ? {} : { communitySide: getRandomCommunitySide() }),
        },
      });
    }

    return existingProfile;
  }

  return prisma.profile.create({
    data: {
      id: user.id,
      communitySide: getRandomCommunitySide(),
      ...(role ? { role } : {}),
    },
  });
}

export async function ensureProfileForUserSafely(user: Pick<User, 'id' | 'email'>) {
  try {
    return await ensureProfileForUser(user);
  } catch (error) {
    if (isMissingProfileTableError(error)) {
      console.warn('Profile table unavailable, using fallback profile.', error);
      return {
        id: user.id,
        elo: 1000,
        role: isAdminEmail(user.email) ? 'ADMIN' : 'USER',
        communitySide: getRandomCommunitySide(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    throw error;
  }
}
