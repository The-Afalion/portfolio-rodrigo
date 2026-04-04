import 'server-only';

import prisma from '@/lib/prisma';
import { buildLoginPath, buildPath } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

type EditorAccess = {
  user: {
    id: string;
    email?: string;
  } | null;
  isSuperAdmin: boolean;
  isEditor: boolean;
  role: string | null;
};

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? '';
}

export function isSuperAdminEmail(email?: string | null) {
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

export async function getEditorAccess(): Promise<EditorAccess> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      isSuperAdmin: false,
      isEditor: false,
      role: null,
    };
  }

  const isSuperAdmin = isSuperAdminEmail(user.email);
  if (isSuperAdmin) {
    return {
      user,
      isSuperAdmin: true,
      isEditor: true,
      role: 'SUPERADMIN',
    };
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isEditor = profile?.role === 'ADMIN';

    return {
      user,
      isSuperAdmin: false,
      isEditor,
      role: profile?.role ?? null,
    };
  } catch (error) {
    console.error('Error checking editor access:', error);
    return {
      user,
      isSuperAdmin: false,
      isEditor: false,
      role: null,
    };
  }
}

export async function requireEditorAccess() {
  const access = await getEditorAccess();

  if (!access.user) {
    redirect(buildLoginPath('editor', '/admin'));
  }

  if (!access.isEditor) {
    redirect(
      buildPath('/login', {
        audience: 'editor',
        next: '/admin',
        error: 'not_editor',
      })
    );
  }

  return access;
}

export async function requireSuperAdminAccess() {
  const access = await requireEditorAccess();

  if (!access.isSuperAdmin) {
    redirect('/admin');
  }

  return access;
}
