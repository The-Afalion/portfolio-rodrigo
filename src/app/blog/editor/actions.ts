"use server";

import prisma from '@/lib/prisma';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { getEditorAccess } from '@/lib/editor-access';

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return process.env.NEXT_PUBLIC_VERCEL_URL.startsWith('http')
      ? process.env.NEXT_PUBLIC_VERCEL_URL
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

export async function savePost(data: { title: string, content: string, fontFamily: string }) {
  const access = await getEditorAccess();

  if (!access.user) {
    return { error: 'No autorizado' };
  }

  if (!access.isEditor) {
    return { error: 'Permisos insuficientes' };
  }

  // Generate a basic slug
  const slug = data.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  try {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`, // Evitar duplicados
        published: true, // Auto-publicar de momento
        typography: data.fontFamily,
        authorId: access.user.id
      }
    });

    revalidatePath('/blog');
    return { success: true, slug: post.slug };
  } catch (error) {
    console.error("Error saving post:", error);
    return { error: 'Error al guardar el artículo' };
  }
}

export async function inviteAdmin(emailToInvite: string) {
  const access = await getEditorAccess();

  if (!access.user) {
    return { error: 'No autorizado' };
  }

  if (!access.isSuperAdmin) {
    return { error: 'No tienes permisos para invitar a otros administradores. Solo correos @rodocodes.dev pueden hacerlo.' };
  }

  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return { error: 'Falta la clave SUPABASE_SERVICE_ROLE_KEY en el entorno para poder invitar usuarios.' };
    }

    const supabaseAdmin = createSupabaseAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      emailToInvite,
      {
        redirectTo: `${getSiteUrl()}/auth/callback?next=/admin`,
      }
    );

    if (inviteError) {
      return { error: 'Error al invitar desde Supabase Auth: ' + inviteError.message };
    }

    if (inviteData && inviteData.user) {
      await prisma.profile.upsert({
        where: { id: inviteData.user.id },
        update: { role: 'ADMIN' },
        create: { id: inviteData.user.id, role: 'ADMIN' },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error inviting user:", error);
    return { error: 'Error al procesar la invitación' };
  }
}
