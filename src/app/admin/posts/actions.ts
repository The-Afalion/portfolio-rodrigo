"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getEditorAccess } from '@/lib/editor-access';

const TYPOGRAPHY_OPTIONS = ['font-serif', 'font-sans', 'font-mono'] as const;

const PostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'El título debe tener al menos 3 caracteres.' })
    .max(160, { message: 'El título no puede superar los 160 caracteres.' }),
  content: z
    .string()
    .trim()
    .min(10, { message: 'El contenido debe tener al menos 10 caracteres.' }),
  tags: z.string().trim().optional().default(''),
  coverImage: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
      message: 'La portada debe ser una URL completa que empiece por http:// o https://.',
    }),
  typography: z.enum(TYPOGRAPHY_OPTIONS).default('font-serif'),
  published: z.boolean().default(false),
});

type AdminPostFormState = {
  message: string | null;
  errors: {
    title?: string[];
    content?: string[];
    tags?: string[];
    coverImage?: string[];
    typography?: string[];
  };
  status?: 'idle' | 'success' | 'error';
  slug?: string;
};

function normalizeTags(tags: string) {
  return [...new Set(tags.split(',').map((tag) => tag.trim()).filter(Boolean))];
}

function buildTagOperations(tags: string) {
  return normalizeTags(tags).map((tagName) => ({
    where: { name: tagName },
    create: { name: tagName },
  }));
}

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function generateUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugifyTitle(title) || 'post';
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existingPost = await prisma.post.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existingPost) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

function parsePostFormData(formData: FormData) {
  return PostSchema.safeParse({
    title: formData.get('title') ?? '',
    content: formData.get('content') ?? '',
    tags: formData.get('tags') ?? '',
    coverImage: formData.get('coverImage') ?? '',
    typography: formData.get('typography') ?? 'font-serif',
    published: formData.get('published') === 'on',
  });
}

function validationErrorState(result: z.SafeParseError<unknown>): AdminPostFormState {
  return {
    message: 'Revisa los campos marcados antes de guardar el artículo.',
    errors: result.error.flatten().fieldErrors,
    status: 'error',
  };
}

function databaseErrorState(action: 'crear' | 'actualizar'): AdminPostFormState {
  return {
    message: `No se pudo ${action} el artículo en este momento.`,
    errors: {},
    status: 'error',
  };
}

function revalidatePostPaths(slug: string, previousSlug?: string | null) {
  revalidatePath('/admin');
  revalidatePath('/admin/posts');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
}

export async function createPost(_prevState: AdminPostFormState, formData: FormData): Promise<AdminPostFormState> {
  const access = await getEditorAccess();
  if (!access.user || !access.isEditor) {
    return { message: 'No autorizado.', errors: {}, status: 'error' };
  }

  const validatedFields = parsePostFormData(formData);
  if (!validatedFields.success) {
    return validationErrorState(validatedFields);
  }

  const { title, content, tags, coverImage, typography, published } = validatedFields.data;
  const slug = await generateUniqueSlug(title);

  try {
    await prisma.post.create({
      data: {
        title,
        slug,
        content,
        published,
        coverImage: coverImage || null,
        typography,
        authorId: access.user.id,
        tags: { connectOrCreate: buildTagOperations(tags) },
      },
    });

    revalidatePostPaths(slug);

    return {
      message: published ? 'Artículo publicado correctamente.' : 'Borrador guardado correctamente.',
      errors: {},
      status: 'success',
      slug,
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return databaseErrorState('crear');
  }
}

export async function updatePost(_prevState: AdminPostFormState, formData: FormData): Promise<AdminPostFormState> {
  const access = await getEditorAccess();
  if (!access.user || !access.isEditor) {
    return { message: 'No autorizado.', errors: {}, status: 'error' };
  }

  const postId = String(formData.get('postId') ?? '');
  if (!postId) {
    return { message: 'Falta la referencia del artículo.', errors: {}, status: 'error' };
  }

  const validatedFields = parsePostFormData(formData);
  if (!validatedFields.success) {
    return validationErrorState(validatedFields);
  }

  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { slug: true },
  });

  if (!existingPost) {
    return { message: 'El artículo ya no existe.', errors: {}, status: 'error' };
  }

  const { title, content, tags, coverImage, typography, published } = validatedFields.data;
  const slug = await generateUniqueSlug(title, postId);

  try {
    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        content,
        published,
        coverImage: coverImage || null,
        typography,
        tags: {
          set: [],
          connectOrCreate: buildTagOperations(tags),
        },
      },
    });

    revalidatePostPaths(slug, existingPost.slug);

    return {
      message: published ? 'Artículo actualizado y publicado.' : 'Cambios guardados en borrador.',
      errors: {},
      status: 'success',
      slug,
    };
  } catch (error) {
    console.error('Error updating post:', error);
    return databaseErrorState('actualizar');
  }
}

export async function togglePublish(id: string, nextPublishedState: boolean) {
  try {
    const access = await getEditorAccess();
    if (!access.user || !access.isEditor) return;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { published: nextPublishedState },
      select: { slug: true },
    });

    revalidatePostPaths(updatedPost.slug);
  } catch (error) {
    console.error('Error toggling publish state:', error);
  }
}

export async function deletePost(id: string) {
  try {
    const access = await getEditorAccess();
    if (!access.user || !access.isEditor) return;

    const post = await prisma.post.delete({
      where: { id },
      select: { slug: true },
    });

    revalidatePostPaths(post.slug);
  } catch (error) {
    console.error('Error deleting post:', error);
  }
}
