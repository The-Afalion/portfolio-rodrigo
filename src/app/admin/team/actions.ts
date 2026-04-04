"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getBaseSiteUrl } from '@/lib/auth';
import { isSuperAdminEmail, requireSuperAdminAccess } from '@/lib/editor-access';
import { findSupabaseUserByEmail, getSupabaseAdminClient, listAllSupabaseUsers } from '@/lib/supabase-admin';

type ManageEditorResult = {
  error?: string;
  success?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function revalidateAdminTeamViews() {
  revalidatePath('/admin');
  revalidatePath('/admin/team');
}

export async function promoteEditorByEmail(email: string): Promise<ManageEditorResult> {
  const access = await requireSuperAdminAccess();
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    return { error: 'Introduce un correo válido.' };
  }

  try {
    const existingUser = await findSupabaseUserByEmail(normalizedEmail);

    if (existingUser) {
      await prisma.profile.upsert({
        where: { id: existingUser.id },
        update: { role: 'ADMIN' },
        create: { id: existingUser.id, role: 'ADMIN' },
      });

      await revalidateAdminTeamViews();

      return {
        success: isSuperAdminEmail(normalizedEmail)
          ? `${normalizedEmail} ya queda reconocido como superadministrador.`
          : `${normalizedEmail} ya tiene permisos de editor.`,
      };
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
      redirectTo: `${getBaseSiteUrl()}/auth/callback?next=/admin`,
    });

    if (error) {
      return { error: `No se pudo preparar el acceso: ${error.message}` };
    }

    if (data.user?.id) {
      await prisma.profile.upsert({
        where: { id: data.user.id },
        update: { role: 'ADMIN' },
        create: { id: data.user.id, role: 'ADMIN' },
      });
    }

    await revalidateAdminTeamViews();

    return {
      success: `${normalizedEmail} ha sido invitado y quedará habilitado como editor en cuanto complete el acceso.`,
    };
  } catch (error) {
    console.error('Error promoting editor by email:', error);
    return { error: 'No se pudo actualizar el equipo editorial.' };
  }
}

export async function revokeEditorAccess(userId: string): Promise<ManageEditorResult> {
  const access = await requireSuperAdminAccess();

  try {
    const users = await listAllSupabaseUsers();
    const targetUser = users.find((user) => user.id === userId) ?? null;
    const targetEmail = targetUser?.email ? normalizeEmail(targetUser.email) : null;

    if (userId === access.user?.id) {
      return { error: 'No puedes retirarte tus propios permisos desde aquí.' };
    }

    if (targetEmail && isSuperAdminEmail(targetEmail)) {
      return { error: 'Los correos @rodocodes.dev conservan acceso superadministrador automáticamente.' };
    }

    await prisma.profile.upsert({
      where: { id: userId },
      update: { role: 'USER' },
      create: { id: userId, role: 'USER' },
    });

    await revalidateAdminTeamViews();

    return {
      success: targetEmail
        ? `Se han retirado los permisos editoriales a ${targetEmail}.`
        : 'Se han retirado los permisos editoriales del usuario.',
    };
  } catch (error) {
    console.error('Error revoking editor access:', error);
    return { error: 'No se pudo retirar el acceso editorial.' };
  }
}
