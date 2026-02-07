"use client";

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updatePost } from '../../actions';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), { ssr: false });

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 bg-foreground text-background rounded hover:opacity-80 transition-opacity self-start disabled:opacity-50">
      {pending ? 'Guardando...' : 'Guardar Cambios'}
    </button>
  );
}

export default function EditPostForm({ post }: { post: { id: string; title: string; content: string; tags: { name: string }[] } }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(updatePost, initialState);
  const [content, setContent] = useState(post.content);

  useEffect(() => {
    if (state.message) {
      if (state.message.startsWith('Error')) {
        toast.error(state.message);
      } else {
        toast.success(state.message);
      }
    }
  }, [state]);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      <input type="hidden" name="postId" value={post.id} />
      
      <label className="font-bold">Título</label>
      <input
        name="title"
        defaultValue={post.title}
        required
        className="p-2 bg-background border border-border rounded"
      />
      {state.errors?.title && <p className="text-sm text-red-500">{state.errors.title.join(', ')}</p>}
      
      <label className="font-bold mt-4">Etiquetas (separadas por comas)</label>
      <input
        name="tags"
        defaultValue={post.tags.map(tag => tag.name).join(', ')}
        placeholder="React, Next.js, Seguridad"
        className="p-2 bg-background border border-border rounded"
      />
      {state.errors?.tags && <p className="text-sm text-red-500">{state.errors.tags.join(', ')}</p>}

      <label className="font-bold mt-4">Contenido</label>
      <textarea name="content" value={content} readOnly className="hidden" />
      <MarkdownEditor value={content} onChange={setContent} />
      {state.errors?.content && <p className="text-sm text-red-500">{state.errors.content.join(', ')}</p>}
      
      <div className="mt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
