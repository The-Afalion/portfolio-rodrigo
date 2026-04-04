"use client";

import { useFormStatus } from 'react-dom';

export default function FormButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-foreground text-background rounded hover:opacity-80 transition-opacity self-start disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Creando...' : 'Crear Post'}
    </button>
  );
}
