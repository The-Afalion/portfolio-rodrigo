"use client";

import { useFormState } from 'react-dom';
import FormButton from './FormButton';
import { createPost } from './actions'; // Importar la acción del servidor

const initialState = { message: null, errors: {} };

export default function PostForm() {
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
