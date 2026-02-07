"use client";

import { useTransition } from 'react';
import { togglePublish, deletePost } from './actions';

export default function PostActions({ post }: { post: { id: string; published: boolean } }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button 
        className="text-xs px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
        disabled={isPending}
        onClick={() => startTransition(() => togglePublish(post.id, !post.published))}
      >
        {isPending ? '...' : (post.published ? 'Despublicar' : 'Publicar')}
      </button>
      <button 
        className="text-xs px-3 py-1 border border-red-900 text-red-500 hover:bg-red-900/20 disabled:opacity-50"
        disabled={isPending}
        onClick={() => {
          if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
            startTransition(() => deletePost(post.id));
          }
        }}
      >
        {isPending ? '...' : 'Eliminar'}
      </button>
    </div>
  );
}
