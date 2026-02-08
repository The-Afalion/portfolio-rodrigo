import { supabaseAdmin } from '@/lib/db';
import { Chess } from 'chess.js';
import { NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';
import { verifySignature } from "@upstash/qstash/dist/nextjs"; // Ruta de importación corregida

// v2.0 - QStash Real-time Engine

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

const LICHESS_API_URL = 'https://lichess.org/api/cloud-eval';

async function getLichessBestMove(fen: string) {
  const response = await fetch(`${LICHESS_API_URL}?fen=${fen}`, {
    headers: { 'Authorization': `Bearer ${process.env.LICHESS_API_TOKEN}` }
  });
  if (!response.ok) {
    console.error("Lichess API Error:", await response.text());
    throw new Error(`Lichess API error: ${response.statusText}`);
  }
  const data = await response.json();
  const move = data.pvs[0]?.moves?.split(' ')[0];
  if (!move) return null;
  return move;
}

async function advanceTournament(tournamentId: string) {
  const { data: matches } = await supabaseAdmin.from('AITournamentMatch').select('*').eq('tournamentId', tournamentId);
  if (!matches) return;

  const activeMatches = matches.filter(m => m.status === 'ACTIVE');
  if (activeMatches.length > 0) return;

  const finishedRoundMatches = matches.filter(m => m.status === 'FINISHED');
  const lastRound = Math.max(0, ...finishedRoundMatches.map(m => m.round));
  const winners = finishedRoundMatches.filter(m => m.round === lastRound).map(m => m.winnerId);

  if (winners.length === 1) {
    await supabaseAdmin.from('AITournament').update({ status: 'FINISHED', winnerId: winners[0], endedAt: new Date().toISOString() }).eq('id', tournamentId);
    await supabaseAdmin.rpc('increment_wins', { player_id: winners[0] });
  } else if (winners.length > 1) {
    const nextRoundMatches = [];
    for (let i = 0; i < winners.length; i += 2) {
      nextRoundMatches.push({ tournamentId, round: lastRound + 1, player1Id: winners[i], player2Id: winners[i + 1], status: 'PENDING' });
    }
    await supabaseAdmin.from('AITournamentMatch').insert(nextRoundMatches);
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    await qstashClient.publishJSON({ url: `${baseUrl}/api/make-move` });
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const isValid = await verifySignature({
    body,
    signature: request.headers.get("upstash-signature")!,
    url: process.env.QSTASH_URL!,
  });
  if (!isValid) return new Response("Unauthorized", { status: 401 });

  try {
    let { data: match } = await supabaseAdmin.from('AITournamentMatch').select('*, tournament:tournamentId(status)').eq('status', 'ACTIVE').limit(1).single();

    if (!match) {
      const { data: nextMatch } = await supabaseAdmin.from('AITournamentMatch').select('id, tournamentId').eq('status', 'PENDING').order('createdAt').limit(1).single();
      if (!nextMatch) {
        const { data: lastFinishedMatch } = await supabaseAdmin.from('AITournamentMatch').select('tournamentId').order('updatedAt', { ascending: false }).limit(1).single();
        if (lastFinishedMatch) await advanceTournament(lastFinishedMatch.tournamentId);
        return NextResponse.json({ message: 'No more pending matches.' });
      }
      const { data: activatedMatch } = await supabaseAdmin.from('AITournamentMatch').update({ status: 'ACTIVE' }).eq('id', nextMatch.id).select('*, tournament:tournamentId(status)').single();
      match = activatedMatch;
    }
    
    if (!match) return NextResponse.json({ message: 'Could not activate next match.' });

    const game = new Chess();
    if (match.moves && Array.isArray(match.moves)) {
      match.moves.forEach((m: any) => game.move(m.move));
    }

    if (game.isGameOver()) {
      await supabaseAdmin.from('AITournamentMatch').update({ status: 'FINISHED' }).eq('id', match.id);
      await advanceTournament(match.tournamentId);
      return NextResponse.json({ message: `Match ${match.id} is over.` });
    }

    const bestMoveUci = await getLichessBestMove(game.fen());
    if (!bestMoveUci) throw new Error("Lichess did not return a move.");
    
    const moveResult = game.move({ from: bestMoveUci.substring(0, 2), to: bestMoveUci.substring(2, 4), promotion: bestMoveUci.length > 4 ? bestMoveUci.substring(4) : undefined });

    const updatedMoves = [...(match.moves || []), { move: moveResult.san }];
    await supabaseAdmin.from('AITournamentMatch').update({ moves: updatedMoves }).eq('id', match.id);

    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    await qstashClient.publishJSON({
      url: `${baseUrl}/api/make-move`,
      delay: `${3 + Math.floor(Math.random() * 4)}s`,
    });

    return NextResponse.json({ message: `Move ${moveResult.san} made.` });

  } catch (error: any) {
    console.error("Error in make-move API:", error.message);
    return new Response(error.message, { status: 500 });
  }
}
