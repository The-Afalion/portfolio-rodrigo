"use client";

import { useTransition } from 'react';
import { togglePublish, deletePost } from './actions';

export default function PostActions({ post }: { post: { id: string; published: boolean } }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button 
        className="rounded-2xl border border-border/70 px-4 py-2 text-sm font-medium hover:bg-background disabled:opacity-50"
        disabled={isPending}
        onClick={() => startTransition(() => togglePublish(post.id, !post.published))}
      >
        {isPending ? 'Actualizando...' : (post.published ? 'Pasar a borrador' : 'Publicar')}
      </button>
      <button 
        className="rounded-2xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50"
        disabled={isPending}
        onClick={() => {
          if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
            startTransition(() => deletePost(post.id));
          }
        }}
      >
        {isPending ? 'Eliminando...' : 'Eliminar'}
      </button>
    </div>
  );
}
