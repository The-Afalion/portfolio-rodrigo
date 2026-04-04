"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const MessageSchema = z.object({
  name: z.string().min(2, "El nombre es demasiado corto."),
  email: z.string().email("El email no es válido."),
  message: z.string().min(10, "El mensaje es demasiado corto."),
});

export async function saveMessage(prevState: any, formData: FormData) {
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
    revalidatePath('/admin/messages');
    return { message: '¡Mensaje enviado con éxito! Gracias por contactar.', errors: {} };
  } catch (e) {
    return { message: 'Error al enviar el mensaje.', errors: {} };
  }
}
