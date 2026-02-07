"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres." }),
  content: z.string().min(10, { message: "El contenido debe tener al menos 10 caracteres." }),
});

export async function createPost(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { message: 'Error: No autorizado' };

  const validatedFields = PostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error de validación',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, content } = validatedFields.data;
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  try {
    await prisma.post.create({
      data: { title, slug, content, authorId: user.id },
    });
    revalidatePath('/admin/posts');
    return { message: 'Post creado con éxito', errors: {} };
  } catch (e) {
    return { message: 'Error en la base de datos', errors: {} };
  }
}

export async function updatePost(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Error: No autorizado' };

  const validatedFields = PostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!validatedFields.success) {
    return { message: 'Error de validación', errors: validatedFields.error.flatten().fieldErrors };
  }

  const { title, content } = validatedFields.data;
  const postId = formData.get('postId') as string;
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  try {
    await prisma.post.update({
      where: { id: postId },
      data: { title, slug, content },
    });
    revalidatePath('/admin/posts');
    revalidatePath(`/blog/${slug}`);
    return { message: 'Post actualizado con éxito', errors: {} };
  } catch (e) {
    return { message: 'Error en la base de datos', errors: {} };
  }
}

export async function togglePublish(id: string, published: boolean) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  await prisma.post.update({
    where: { id },
    data: { published },
  });

  revalidatePath('/admin/posts');
  revalidatePath('/blog');
}

export async function deletePost(id: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  await prisma.post.delete({
    where: { id },
  });

  revalidatePath('/admin/posts');
  revalidatePath('/blog');
}
