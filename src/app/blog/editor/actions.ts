"use server";

import prisma from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function savePost(data: { title: string, content: string, fontFamily: string }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'No autorizado' };
  }

  const email = session.user.email;
  const isSuperAdmin = email?.endsWith('@rodocodes.dev');

  if (!isSuperAdmin) {
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id }
    });
    if (!profile || profile.role !== 'ADMIN') {
      return { error: 'Permisos insuficientes' };
    }
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
        authorId: session.user.id
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
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'No autorizado' };
  }

  const email = session.user.email;
  const isSuperAdmin = email?.endsWith('@rodocodes.dev');

  if (!isSuperAdmin) {
    return { error: 'No tienes permisos para invitar a otros administradores. Solo correos @rodocodes.dev pueden hacerlo.' };
  }

  try {
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: { get() { return "" }, set() {}, remove() {} }
        }
    );

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(emailToInvite);

    if (inviteError) {
        // Si no tenemos SERVICE_ROLE_KEY localmente, supabase no dejará usar admin
        if (inviteError.message.includes('service_role')) {
            return { error: 'Falta la clave SUPABASE_SERVICE_ROLE_KEY en el entorno para poder invitar usuarios.' };
        }
        return { error: 'Error al invitar desde Supabase Auth: ' + inviteError.message };
    }

    if (inviteData && inviteData.user) {
        // Le damos un momento por si el trigger lo inserta y luego actualizamos el rol
        await new Promise(r => setTimeout(r, 1000));

        await prisma.profile.upsert({
           where: { id: inviteData.user.id },
           update: { role: 'ADMIN' },
           create: { id: inviteData.user.id, role: 'ADMIN' }
        });
    }

    return { success: true };
  } catch (error) {
    console.error("Error inviting user:", error);
    return { error: 'Error al procesar la invitación' };
  }
}
