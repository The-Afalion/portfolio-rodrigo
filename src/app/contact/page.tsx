"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

// --- Esquema de Validación ---
const MessageSchema = z.object({
  name: z.string().min(2, "El nombre es demasiado corto."),
  email: z.string().email("El email no es válido."),
  message: z.string().min(10, "El mensaje es demasiado corto."),
});

// --- Server Action para Guardar Mensaje ---
async function saveMessage(prevState: any, formData: FormData) {
  "use server";

  const validatedFields = MessageSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return { message: 'Error de validación', errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.contactMessage.create({
      data: validatedFields.data,
    });
    revalidatePath('/admin/messages'); // Para que el admin vea el nuevo mensaje
    return { message: '¡Mensaje enviado con éxito! Gracias por contactar.', errors: {} };
  } catch (e) {
    return { message: 'Error al enviar el mensaje.', errors: {} };
  }
}

// --- Componente del Botón ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full px-6 py-3 bg-foreground text-background rounded hover:opacity-80 transition-opacity disabled:opacity-50">
      {pending ? 'Enviando...' : 'Enviar Mensaje'}
    </button>
  );
}

// --- Componente de la Página ---
export default function ContactPage() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(saveMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.message.startsWith('Error')) {
        toast.error(state.message);
      } else {
        toast.success(state.message);
        formRef.current?.reset();
      }
    }
  }, [state]);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter">Contacto</h1>
          <p className="text-lg text-muted-foreground mt-2">¿Tienes una idea o un proyecto? Hablemos.</p>
        </div>

        <form ref={formRef} action={dispatch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-mono text-muted-foreground mb-2">Nombre</label>
              <input type="text" name="name" id="name" required className="w-full p-3 bg-secondary border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {state.errors?.name && <p className="text-sm text-red-500 mt-1">{state.errors.name.join(', ')}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-mono text-muted-foreground mb-2">Email</label>
              <input type="email" name="email" id="email" required className="w-full p-3 bg-secondary border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {state.errors?.email && <p className="text-sm text-red-500 mt-1">{state.errors.email.join(', ')}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-mono text-muted-foreground mb-2">Mensaje</label>
            <textarea name="message" id="message" rows={6} required className="w-full p-3 bg-secondary border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            {state.errors?.message && <p className="text-sm text-red-500 mt-1">{state.errors.message.join(', ')}</p>}
          </div>
          <div>
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  );
}
