"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function incrementViews(slug: string) {
  try {
    await prisma.post.update({
      where: { slug },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    revalidatePath(`/blog/${slug}`);
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
}

export async function incrementLikes(slug: string) {
  try {
    const post = await prisma.post.update({
      where: { slug },
      data: {
        likes: {
          increment: 1,
        },
      },
    });
    revalidatePath(`/blog/${slug}`);
    return post.likes;
  } catch (error) {
    console.error("Error incrementing likes:", error);
    return null;
  }
}
