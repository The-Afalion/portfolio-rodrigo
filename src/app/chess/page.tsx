import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import FondoAjedrez from '@/components/FondoAjedrez';
import { supabaseAdmin } from '@/lib/db';
import { ChessPlayer } from '@prisma/client';

// Componente para el formulario de identificación
function IdentificationGate() {
  async function identify(formData: FormData) {
    'use server';
    const email = formData.get('email') as string;
    if (email) {
      cookies().set('player-email', email, { maxAge: 60 * 60 * 24 * 365 });
      redirect('/chess');
    }
  }

  async function continueAsGuest() {
    'use server';
    cookies().set('player-email', 'guest', { maxAge: 60 * 60 * 24 * 365 });
    redirect('/chess');
  }

  return (
    <div className="w-full max-w-md text-center z-10 bg-background/50 backdrop-blur-sm border border-border p-8 rounded-lg">
      <h1 className="text-3xl font-bold tracking-tighter mb-2">Bienvenido al Laboratorio de Ajedrez</h1>
      <p className="text-muted-foreground font-mono mb-6">Identifícate para ver tus estadísticas y partidas, o continúa como invitado.</p>
      <form action={identify} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="tu@email.com"
          required
          className="w-full p-3 bg-secondary border border-border rounded-md font-mono text-center"
        />
        <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white font-mono rounded-md hover:bg-blue-700 transition-colors">
          Identificarse
        </button>
      </form>
      <div className="my-4 flex items-center gap-4">
        <div className="flex-grow h-px bg-border"></div>
        <span className="text-muted-foreground font-mono text-sm">O</span>
        <div className="flex-grow h-px bg-border"></div>
      </div>
      <form action={continueAsGuest}>
        <button type="submit" className="w-full px-4 py-3 bg-secondary text-foreground font-mono rounded-md hover:bg-border transition-colors">
          Continuar como invitado
        </button>
      </form>
    </div>
  );
}

// Widget para el Torneo de IAs
async function TournamentWidget() {
  const { data: match } = await supabaseAdmin
    .from('AITournamentMatch')
    .select('*, player1:player1Id(name), player2:player2Id(name)')
    .eq('status', 'ACTIVE')
    .limit(1)
    .single();

  return (
    <div className="bg-secondary/50 backdrop-blur-sm border border-border p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Torneo de Titanes</h2>
      {match ? (
        <div>
          <p className="font-mono text-center text-sm mb-2">En directo:</p>
          <p className="text-center font-bold">{match.player1.name} vs {match.player2.name}</p>
        </div>
      ) : (
        <p className="text-muted-foreground font-mono">No hay partidas en directo.</p>
      )}
      <Link href="/chess/ai-battle" className="mt-4 block w-full text-center bg-blue-600/20 text-blue-300 py-2 rounded-md hover:bg-blue-600/40 transition-colors">
        Ver Torneo Completo
      </Link>
    </div>
  );
}

// Widget para el Ajedrez Comunitario
async function CommunityWidget() {
  const { data: game } = await supabaseAdmin.from('CommunityChessGame').select('id').eq('id', 'main_game').single();
  return (
    <div className="bg-secondary/50 backdrop-blur-sm border border-border p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Ajedrez Comunitario</h2>
      {game ? (
        <p className="text-muted-foreground font-mono">La partida global está en curso. ¡Tu voto decide el próximo movimiento!</p>
      ) : (
        <p className="text-muted-foreground font-mono">La partida comunitaria no está disponible.</p>
      )}
      <Link href="/chess/community" className="mt-4 block w-full text-center bg-blue-600/20 text-blue-300 py-2 rounded-md hover:bg-blue-600/40 transition-colors">
        Participar
      </Link>
    </div>
  );
}

// Widget para las Partidas del Usuario
async function UserGamesWidget({ user }: { user: ChessPlayer | null }) {
  if (!user) return null;
  // Lógica para obtener las partidas del usuario (a implementar)
  return (
    <div className="bg-secondary/50 backdrop-blur-sm border border-border p-6 rounded-lg col-span-1 md:col-span-2">
      <h2 className="text-xl font-bold mb-4">Tus Partidas por Correspondencia</h2>
      <p className="text-muted-foreground font-mono">Aquí aparecerán tus partidas activas.</p>
      <Link href="#" className="mt-4 block w-full text-center bg-blue-600/20 text-blue-300 py-2 rounded-md hover:bg-blue-600/40 transition-colors">
        Jugar
      </Link>
    </div>
  );
}


export default async function ChessHubPage() {
  const emailCookie = cookies().get('player-email');
  const email = emailCookie?.value;

  if (!email) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <FondoAjedrez />
        <IdentificationGate />
      </main>
    );
  }

  let user = null;
  if (email && email !== 'guest') {
    const { data } = await supabaseAdmin.from('ChessPlayer').select('*').eq('email', email).single();
    user = data;
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <FondoAjedrez />
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
          <ArrowLeft size={20} />
          Volver al Portfolio
        </Link>
      </div>

      <div className="text-center mb-12 z-10 relative">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground">
          Laboratorio de Ajedrez
        </h1>
        <p className="text-muted-foreground font-mono mt-2">
          {user ? `Bienvenido, ${user.name}` : 'Bienvenido, Invitado'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto z-10 relative grid grid-cols-1 md:grid-cols-2 gap-6">
        <TournamentWidget />
        <CommunityWidget />
        <UserGamesWidget user={user} />
      </div>
    </main>
  );
}
