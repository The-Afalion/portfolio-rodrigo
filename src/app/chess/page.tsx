import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArrowLeft, Users, Mail, LogOut, Trophy, User as UserIcon, Crown } from 'lucide-react'; // Crown AÑADIDO
import Link from 'next/link';
import FondoAjedrez from '@/components/FondoAjedrez';
import { supabaseAdmin } from '@/lib/db';
import { ChessPlayer } from '@prisma/client';

// --- COMPONENTES DE UI ---

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-secondary/30 backdrop-blur-md border border-border/50 p-4 rounded-xl flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-lg text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold font-mono">{value}</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, href, icon, active = true }: { title: string, description: string, href: string, icon: React.ReactNode, active?: boolean }) {
  return (
    <Link href={active ? href : '#'} className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-secondary/20 p-8 transition-all hover:bg-secondary/40 ${!active && 'opacity-50 cursor-not-allowed'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10 flex flex-col items-start gap-4">
        <div className="p-3 rounded-xl bg-background/50 text-foreground shadow-sm group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
        {active ? (
          <span className="mt-4 text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
            Entrar <ArrowLeft className="rotate-180 w-3 h-3" />
          </span>
        ) : (
          <span className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Próximamente
          </span>
        )}
      </div>
    </Link>
  );
}

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
    <div className="w-full max-w-md z-10">
      <div className="bg-background/60 backdrop-blur-xl border border-border shadow-2xl p-8 rounded-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <UserIcon size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Identifícate</h1>
          <p className="text-muted-foreground text-sm">Para guardar tu progreso y estadísticas.</p>
        </div>

        <form action={identify} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-center placeholder:text-muted-foreground/50"
            />
          </div>
          <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
            Acceder
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">O</span></div>
        </div>

        <form action={continueAsGuest}>
          <button type="submit" className="w-full px-4 py-3 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 active:scale-[0.98] transition-all">
            Continuar como Invitado
          </button>
        </form>
      </div>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---

export default async function ChessHubPage() {
  const emailCookie = cookies().get('player-email');
  const email = emailCookie?.value;

  if (!email) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <FondoAjedrez />
        <div className="absolute top-6 left-6 z-20">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
            <ArrowLeft size={16} /> Volver al Portfolio
          </Link>
        </div>
        <IdentificationGate />
      </main>
    );
  }

  let user = null;
  let stats = { gamesPlayed: 0, wins: 0, rank: 'Novato' };
  
  if (email && email !== 'guest') {
    const { data } = await supabaseAdmin.from('ChessPlayer').select('*').eq('email', email).single();
    user = data;
    if (user) {
      stats = { 
        gamesPlayed: user.winsTotal || 0, // Placeholder
        wins: user.winsTotal || 0, 
        rank: (user.elo || 1200) > 1500 ? 'Maestro' : 'Aficionado' 
      };
    }
  }

  async function logout() {
    'use server';
    cookies().delete('player-email');
    redirect('/chess');
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden">
      <FondoAjedrez />
      
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4">
            <ArrowLeft size={16} /> Volver al Portfolio
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Chess Hub
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            {user ? `Bienvenido de nuevo, ${user.name}. Tu centro de mando estratégico.` : 'Bienvenido, Invitado. Explora el universo del ajedrez.'}
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <form action={logout}>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-secondary/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-medium">
                <LogOut size={14} /> Cerrar Sesión
              </button>
            </form>
          </div>
        )}
      </header>

      {user && (
        <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <StatCard label="Partidas Jugadas" value={stats.gamesPlayed} icon={<Trophy size={20} />} />
          <StatCard label="Victorias" value={stats.wins} icon={<Crown size={20} />} />
          <StatCard label="Rango Actual" value={stats.rank} icon={<Shield size={20} />} />
        </section>
      )}

      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard 
          title="Ajedrez Comunitario" 
          description="Únete a la mente colmena. Vota el siguiente movimiento en una partida masiva contra el mundo. ¿Podrá la comunidad derrotar al caos?"
          href="/chess/community"
          icon={<Users size={32} className="text-primary" />}
        />
        
        <FeatureCard 
          title="Ajedrez por Correspondencia" 
          description="Juega a tu propio ritmo. Desafía a otros usuarios, recibe notificaciones por email y analiza tus partidas con calma."
          href="/chess/play-by-mail"
          icon={<Mail size={32} className="text-purple-400" />}
          active={false}
        />
      </section>

    </main>
  );
}
