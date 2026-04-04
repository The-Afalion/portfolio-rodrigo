"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';
import toast from 'react-hot-toast';
import { updatePost } from '../../actions';
import FormButton from '../../FormButton';

const MarkdownEditor = dynamic(() => import('../../MarkdownEditor'), { ssr: false });
const initialState = { message: null, errors: {}, status: 'idle' as const };

type EditablePost = {
  id: string;
  title: string;
  content: string;
  coverImage: string | null;
  typography: string;
  published: boolean;
  tags: { name: string }[];
};

export default function EditPostForm({ post }: { post: EditablePost }) {
  const [state, dispatch] = useFormState(updatePost, initialState);
  const [content, setContent] = useState(post.content);
  const [published, setPublished] = useState(post.published);
  const router = useRouter();

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.status === 'error') {
      toast.error(state.message);
      return;
    }

    toast.success(state.message);
    router.refresh();
  }, [router, state]);

  return (
    <form action={dispatch} className="space-y-6">
      <input type="hidden" name="postId" value={post.id} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Título</label>
          <input
            name="title"
            defaultValue={post.title}
            required
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/40"
          />
          {state.errors?.title ? <p className="text-sm text-red-500">{state.errors.title.join(', ')}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Portada</label>
          <input
            name="coverImage"
            type="url"
            defaultValue={post.coverImage ?? ''}
            placeholder="https://..."
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/40"
          />
          {state.errors?.coverImage ? <p className="text-sm text-red-500">{state.errors.coverImage.join(', ')}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Etiquetas</label>
          <input
            name="tags"
            defaultValue={post.tags.map((tag) => tag.name).join(', ')}
            placeholder="React, Next.js, Seguridad"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/40"
          />
          {state.errors?.tags ? <p className="text-sm text-red-500">{state.errors.tags.join(', ')}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Tipografía</label>
          <select
            name="typography"
            defaultValue={post.typography || 'font-serif'}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/40"
          >
            <option value="font-serif">Serif</option>
            <option value="font-sans">Sans</option>
            <option value="font-mono">Mono</option>
          </select>
          {state.errors?.typography ? <p className="text-sm text-red-500">{state.errors.typography.join(', ')}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Contenido</label>
        <textarea name="content" value={content} readOnly className="hidden" />
        <MarkdownEditor value={content} onChange={setContent} />
        {state.errors?.content ? <p className="text-sm text-red-500">{state.errors.content.join(', ')}</p> : null}
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-background/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input
            name="published"
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span>{published ? 'Este artículo está publicado' : 'Guardar como borrador'}</span>
        </label>

        <FormButton
          idleLabel={published ? 'Guardar y mantener publicado' : 'Guardar borrador'}
          pendingLabel="Guardando..."
        />
      </div>
    </form>
  );
}
