"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

/**
 * Calcula el bando de un jugador ('w' para blancas, 'b' para negras)
 * basándose en la suma de los dígitos de su correo electrónico.
 * @param email El correo del jugador.
 * @returns 'w' si la suma es impar, 'b' si es par.
 */
function getSideFromEmail(email: string): 'w' | 'b' {
  const digits = email.match(/\d/g) || [];
  const sum = digits.reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  return sum % 2 !== 0 ? 'w' : 'b';
}

const schema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo válido." }),
});

export async function registerPlayer(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message, assignedSide: null };
  }

  const { email } = validatedFields.data;
  const assignedSide = getSideFromEmail(email);

  // Guardar el correo y el bando en las cookies
  cookies().set('player-email', email, { maxAge: 60 * 60 * 24 * 365 });
  cookies().set('player-side', assignedSide, { maxAge: 60 * 60 * 24 * 365 });

  // Devolver el bando asignado para mostrarlo en la UI
  return { error: null, assignedSide };
}
