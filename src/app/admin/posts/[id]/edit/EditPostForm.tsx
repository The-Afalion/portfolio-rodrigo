"use client";

import { useFormState } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// --- Esquema de Validación ---
const PostSchema = z.object({
  title: z.string().min(3, "El título es demasiado corto."),
  content: z.string().min(10, "El contenido es demasiado corto."),
});

// --- Server Action para Actualizar ---
async function updatePost(prevState: any, formData: FormData) {
  "use server";

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

// --- Componente del Botón de Envío ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 bg-foreground text-background rounded hover:opacity-80 transition-opacity self-start disabled:opacity-50">
      {pending ? 'Guardando...' : 'Guardar Cambios'}
    </button>
  );
}

// --- Componente del Formulario ---
export default function EditPostForm({ post }: { post: { id: string; title: string; content: string } }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(updatePost, initialState);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      <input type="hidden" name="postId" value={post.id} />
      <input
        name="title"
        defaultValue={post.title}
        required
        className="p-2 bg-background border border-border rounded"
      />
      {state.errors?.title && <p className="text-sm text-red-500">{state.errors.title.join(', ')}</p>}
      
      <textarea
        name="content"
        defaultValue={post.content}
        required
        rows={15}
        className="p-2 bg-background border border-border rounded"
      />
      {state.errors?.content && <p className="text-sm text-red-500">{state.errors.content.join(', ')}</p>}
      
      <SubmitButton />
      
      {state.message && <p className={`text-sm ${state.message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{state.message}</p>}
    </form>
  );
}
