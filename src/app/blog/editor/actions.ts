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
