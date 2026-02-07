"use server";

import { supabaseAdmin } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const emailSchema = z.string().email({ message: "Por favor, introduce un email válido." });

export async function registerPlayer(prevState: any, formData: FormData) {
  const email = formData.get('email');

  const validation = emailSchema.safeParse(email);
  if (!validation.success) {
    return { error: validation.error.errors[0].message, assignedSide: null };
  }
  
  const validatedEmail = validation.data;
  let assignedSide: 'w' | 'b' | null = null;

  try {
    let { data: player, error: playerError } = await supabaseAdmin
      .from('ChessPlayer')
      .select('id, assignedSide')
      .eq('email', validatedEmail)
      .single();

    if (playerError && playerError.code !== 'PGRST116') {
      throw new Error(`Error al buscar el jugador: ${playerError.message}`);
    }

    if (!player) {
      const { count: whitePlayers, error: whiteError } = await supabaseAdmin.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('assignedSide', 'w');
      const { count: blackPlayers, error: blackError } = await supabaseAdmin.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('assignedSide', 'b');

      if (whiteError || blackError) throw new Error('Error al contar jugadores.');

      const side = (whitePlayers || 0) <= (blackPlayers || 0) ? 'w' : 'b';
      assignedSide = side;
      
      const { error: createPlayerError } = await supabaseAdmin
        .from('ChessPlayer')
        .insert({
          email: validatedEmail,
          name: validatedEmail.split('@')[0],
          assignedSide: side,
        })
        .single();
      
      if (createPlayerError) throw new Error(`Error al crear el jugador: ${createPlayerError.message}`);
    } else {
      assignedSide = player.assignedSide as 'w' | 'b';
    }

    cookies().set('player-email', validatedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

  } catch (error: any) {
    console.error("Server action error in registerPlayer:", error.message);
    return { error: "Ocurrió un error en el servidor. Inténtalo de nuevo.", assignedSide: null };
  }

  // En lugar de redirigir, devolvemos el estado con el bando asignado
  // para que la UI pueda mostrar la pantalla de éxito.
  return { error: null, assignedSide: assignedSide };
}
