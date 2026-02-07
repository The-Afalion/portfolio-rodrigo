"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres." }),
  content: z.string().min(10, { message: "El contenido debe tener al menos 10 caracteres." }),
  tags: z.string().optional(), // Campo para tags
});

// ... (createPost se mantiene igual por ahora, nos centramos en update)

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
    tags: formData.get('tags'),
  });

  if (!validatedFields.success) {
    return { message: 'Error de validación', errors: validatedFields.error.flatten().fieldErrors };
  }

  const { title, content, tags } = validatedFields.data;
  const postId = formData.get('postId') as string;
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  try {
    // Lógica para conectar o crear tags
    const tagOperations = tags
      ? tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tagName => ({
          where: { name: tagName },
          create: { name: tagName },
        }))
      : [];

    await prisma.post.update({
      where: { id: postId },
      data: { 
        title, 
        slug, 
        content,
        tags: {
          set: [], // Desconectar tags antiguos
          connectOrCreate: tagOperations, // Conectar o crear los nuevos
        }
      },
    });

    revalidatePath('/admin/posts');
    revalidatePath(`/blog/${slug}`);
    return { message: 'Post actualizado con éxito', errors: {} };
  } catch (e) {
    return { message: 'Error en la base de datos', errors: {} };
  }
}

// ... (el resto de acciones se mantienen igual)
export async function createPost(prevState: any, formData: FormData) {
  // ... (implementación existente)
}
export async function togglePublish(id: string, published: boolean) {
  // ... (implementación existente)
}
export async function deletePost(id: string) {
  // ... (implementación existente)
}
