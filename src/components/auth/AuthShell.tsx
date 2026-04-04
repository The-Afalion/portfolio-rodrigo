import type { ReactNode } from 'react';
import type { AuthAudience } from '@/lib/auth';

const audienceCopy: Record<
  AuthAudience,
  {
    eyebrow: string;
    title: string;
    description: string;
    asideTitle: string;
    asideBody: string;
  }
> = {
  general: {
    eyebrow: 'Cuenta Global',
    title: 'Un único acceso para toda la web',
    description: 'Autenticación centralizada para blog, chess y futuras zonas privadas, con una experiencia consistente y profesional.',
    asideTitle: 'Sistema compartido',
    asideBody: 'Tu identidad se mantiene igual en todas las áreas del sitio y el perfil se sincroniza sobre la misma cuenta.',
  },
  editor: {
    eyebrow: 'Portal Editorial',
    title: 'Acceso al panel de edición',
    description: 'Entrada controlada al área editorial del blog con permisos centralizados sobre la misma cuenta global.',
    asideTitle: 'Permisos editoriales',
    asideBody: 'Solo los usuarios autorizados como editores pueden acceder al panel. El resto de la web comparte la misma cuenta base.',
  },
  chess: {
    eyebrow: 'Chess Club',
    title: 'Entra con tu cuenta global',
    description: 'Usa la misma identidad del resto de la web para conservar sesión, perfil y progreso sin duplicar accesos.',
    asideTitle: 'Progreso conectado',
    asideBody: 'La misma cuenta sirve para la arena, el blog y las futuras zonas que se añadan al ecosistema.',
  },
};

export function AuthShell({
  audience,
  children,
}: {
  audience: AuthAudience;
  children: ReactNode;
}) {
  const copy = audienceCopy[audience];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[8%] top-[8%] h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute bottom-[10%] right-[8%] h-80 w-80 rounded-full bg-amber-200/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <p className="page-eyebrow">{copy.eyebrow}</p>
          <div className="space-y-4">
            <h1 className="page-title max-w-3xl">{copy.title}</h1>
            <p className="page-lead max-w-2xl">{copy.description}</p>
          </div>
          <div className="surface-panel max-w-xl p-6 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{copy.asideTitle}</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.asideBody}</p>
          </div>
        </section>

        <section className="w-full">{children}</section>
      </div>
    </main>
  );
}
