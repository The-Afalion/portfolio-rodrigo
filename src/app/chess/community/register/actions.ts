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
    return { error: validation.error.errors[0].message };
  }
  
  const validatedEmail = validation.data;

  try {
    // 1. Buscar si el jugador ya existe
    let { data: player, error: playerError } = await supabaseAdmin
      .from('ChessPlayer')
      .select('id, assignedSide')
      .eq('email', validatedEmail)
      .single();

    if (playerError && playerError.code !== 'PGRST116') {
      throw new Error(`Error al buscar el jugador: ${playerError.message}`);
    }

    // 2. Si no existe, crearlo y asignarle un bando
    if (!player) {
      const { count: whitePlayers, error: whiteError } = await supabaseAdmin.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('assignedSide', 'w');
      const { count: blackPlayers, error: blackError } = await supabaseAdmin.from('ChessPlayer').select('*', { count: 'exact', head: true }).eq('assignedSide', 'b');

      if (whiteError || blackError) throw new Error('Error al contar jugadores.');

      const side = (whitePlayers || 0) <= (blackPlayers || 0) ? 'w' : 'b';
      
      const { data: newPlayer, error: createPlayerError } = await supabaseAdmin
        .from('ChessPlayer')
        .insert({
          email: validatedEmail,
          name: validatedEmail.split('@')[0],
          assignedSide: side,
        })
        .select('id')
        .single();
      
      if (createPlayerError) throw new Error(`Error al crear el jugador: ${createPlayerError.message}`);
      player = newPlayer;
    }

    // 3. Guardar el email en una cookie segura
    cookies().set('player-email', validatedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 año
      path: '/',
    });

  } catch (error: any) {
    console.error("Server action error in registerPlayer:", error.message);
    return { error: "Ocurrió un error en el servidor. Inténtalo de nuevo." };
  }

  // 4. Redirigir a la página de la partida
  redirect('/chess/community');
}
