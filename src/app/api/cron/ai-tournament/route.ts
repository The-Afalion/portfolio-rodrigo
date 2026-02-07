import { supabaseAdmin } from '@/lib/db';
import { NextResponse } from 'next/server';

// v3.0 - Maintenance Cron Job: Ensure AIs exist.
const AI_PERSONALITIES: { [name: string]: string } = {
  "ByteBard": "PAWN_MASTER", "HexaMind": "AGGRESSIVE", "CodeCaster": "ADAPTIVE", 
  "NexoZero": "BALANCED", "QuantumLeap": "CHAOTIC", "SiliconSoul": "DEFENSIVE", 
  "LogicLoom": "FORTRESS", "KernelKing": "OPENING_BOOK", "VoidRunner": "BERSERKER", 
  "FluxAI": "REACTIONARY", "CygnusX1": "OPPORTUNIST", "ApexBot": "PRESSURER"
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Obtener las IAs que ya existen
    const { data: existingAIs, error: fetchError } = await supabaseAdmin
      .from('ChessPlayer')
      .select('name')
      .eq('isAI', true);

    if (fetchError) {
      throw new Error(`Error al obtener IAs existentes: ${fetchError.message}`);
    }

    const existingAINames = existingAIs.map(ai => ai.name);
    const missingAIs = Object.keys(AI_PERSONALITIES).filter(name => !existingAINames.includes(name));

    if (missingAIs.length === 0) {
      return NextResponse.json({ message: 'Todas las IAs ya existen. No se necesita ninguna acción.' });
    }

    // 2. Crear solo las IAs que faltan
    const aisToCreate = missingAIs.map(name => ({
      email: `${name.toLowerCase()}@system.io`,
      name,
      isAI: true,
      personality: AI_PERSONALITIES[name],
    }));

    const { error: insertError } = await supabaseAdmin.from('ChessPlayer').insert(aisToCreate);

    if (insertError) {
      throw new Error(`Error al insertar las IAs que faltan: ${insertError.message}`);
    }

    return NextResponse.json({ message: `${aisToCreate.length} IAs creadas con éxito.` });

  } catch (error: any) {
    console.error("Error en el cron job de mantenimiento de IAs:", error.message);
    return new Response(error.message, { status: 500 });
  }
}
