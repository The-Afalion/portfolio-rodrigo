"use client";

import { useEffect, useRef } from 'react';
import { useFormState } from 'react-dom';
import FormButton from './FormButton';
import { createPost } from './actions';
import toast from 'react-hot-toast';

const initialState = { message: null, errors: {} };

export default function PostForm() {
  const [state, dispatch] = useFormState(createPost, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.message.startsWith('Error')) {
        toast.error(state.message);
      } else {
        toast.success(state.message);
        formRef.current?.reset(); // Limpiar el formulario si el post se creó con éxito
      }
    }
  }, [state]);

  return (
    <form ref={formRef} action={dispatch} className="flex flex-col gap-4">
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
    </form>
  );
}
