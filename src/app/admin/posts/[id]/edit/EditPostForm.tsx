"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { updatePost } from '../../actions'; // Importar la acción desde el archivo central

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
      
      {state.message && <p className={`text-sm mt-2 ${state.message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{state.message}</p>}
    </form>
  );
}
