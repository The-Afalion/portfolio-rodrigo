"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function togglePublish(id: string, published: boolean) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  await prisma.post.update({
    where: { id },
    data: { published },
  });

  revalidatePath('/admin/posts');
  revalidatePath('/blog'); // Revalidar la página del blog también
}

export async function deletePost(id: string) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  await prisma.post.delete({
    where: { id },
  });

  revalidatePath('/admin/posts');
  revalidatePath('/blog');
}
