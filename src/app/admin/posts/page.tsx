import prisma from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import FormButton from './FormButton';
import PostActions from './PostActions'; // Importar el nuevo componente

// --- Esquema de Validación con Zod ---
const PostSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres." }),
  content: z.string().min(10, { message: "El contenido debe tener al menos 10 caracteres." }),
});

// --- Server Action para crear un nuevo post (Mejorada) ---
async function createPost(prevState: any, formData: FormData) {
  "use server";

  const supabase = createRouteHandlerClient({ cookies });
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
      data: {
        title,
        slug,
        content,
        authorId: user.id,
      },
    });
    revalidatePath('/admin/posts');
    return { message: 'Post creado con éxito', errors: {} };
  } catch (e) {
    return { message: 'Error en la base de datos', errors: {} };
  }
}

// --- Componente de la Página ---
export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestionar Posts</h1>
      <div className="mb-12 p-6 border border-border rounded-lg bg-secondary">
        <h2 className="text-xl font-bold mb-4">Nuevo Post</h2>
        <PostForm />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Posts Existentes</h2>
        {posts.map((post) => (
          <div key={post.id} className="p-4 border border-border rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-muted-foreground">
                {post.published ? 'Publicado' : 'Borrador'} - {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
            <PostActions post={{ id: post.id, published: post.published }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Componente del Formulario (para usar hooks de cliente) ---
"use client";
import { useFormState } from 'react-dom';

function PostForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createPost, initialState);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      <input
        name="title"
        placeholder="Título del post"
        required
        className="p-2 bg-background border border-border rounded"
      />
      {state.errors?.title && <p className="text-sm text-red-500">{state.errors.title.join(', ')}</p>}
      
      <textarea
        name="content"
        placeholder="Escribe tu artículo aquí... (Markdown soportado)"
        required
        rows={8}
        className="p-2 bg-background border border-border rounded"
      />
      {state.errors?.content && <p className="text-sm text-red-500">{state.errors.content.join(', ')}</p>}
      
      <FormButton />
      
      {state.message && state.message.startsWith('Error') && <p className="text-sm text-red-500">{state.message}</p>}
      {state.message && state.message.startsWith('Post') && <p className="text-sm text-green-500">{state.message}</p>}
    </form>
  );
}
