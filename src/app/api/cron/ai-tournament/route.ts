import { supabaseAdmin } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';

// v7.0 - QStash Architecture: Hourly Tournament Setup

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log("Iniciando cron job de configuración de torneo...");

    await supabaseAdmin.from('AITournament').update({ status: 'FINISHED', endedAt: new Date().toISOString() }).eq('status', 'ACTIVE');
    
    const { data: players } = await supabaseAdmin.from('ChessPlayer').select('id').eq('isAI', true);
    if (!players || players.length < 8) throw new Error("No hay suficientes IAs.");

    const shuffled = players.sort(() => 0.5 - Math.random());
    const participants = shuffled.slice(0, 8);

    const { data: newTournament } = await supabaseAdmin.from('AITournament').insert({ status: 'PENDING' }).select('id').single();
    if (!newTournament) throw new Error("No se pudo crear el nuevo torneo.");

    const firstRoundMatches = [];
    for (let i = 0; i < 8; i += 2) {
      firstRoundMatches.push({
        tournamentId: newTournament.id,
        round: 1,
        player1Id: participants[i].id,
        player2Id: participants[i + 1].id,
        status: 'PENDING',
      });
    }
    await supabaseAdmin.from('AITournamentMatch').insert(firstRoundMatches);
    console.log("Partidas de la primera ronda creadas.");

    // Iniciar la cadena de QStash enviando el primer mensaje
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    await qstashClient.publishJSON({
      url: `${baseUrl}/api/make-move`,
      body: { message: "Start tournament" },
    });

    console.log("Primer mensaje enviado a QStash para iniciar la simulación.");

    return NextResponse.json({ message: `Nuevo torneo ${newTournament.id} configurado y en cola.` });

  } catch (error: any) {
    console.error("Error en el cron job de configuración de torneo:", error.message);
    return new Response(error.message, { status: 500 });
  }
}
