import { NextResponse } from 'next/server';
import { executeMostVotedMove } from '@/app/chess/community/actions';

// Esta es la ruta que el Cron Job de Vercel llamará.
// GET /api/cron/execute-move
export async function GET(request: Request) {
  // 1. Proteger la ruta
  // El Cron Job de Vercel incluirá un secreto en la cabecera 'Authorization'.
  // Este secreto se debe configurar como una variable de entorno en Vercel.
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  // 2. Ejecutar la lógica del movimiento
  try {
    const result = await executeMostVotedMove();
    if (result.error) {
      console.error('Cron Job Error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    console.log('Cron Job Success:', result.success || result.message);
    return NextResponse.json({ success: true, message: result.success || result.message });
  } catch (error: any) {
    console.error('Cron Job Failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
