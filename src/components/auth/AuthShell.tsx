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
    eyebrow: 'Cuenta',
    title: 'Un acceso para todo el portfolio',
    description: 'La misma cuenta sirve para blog, chess y futuras áreas privadas.',
    asideTitle: 'Acceso unificado',
    asideBody: 'Una sola identidad, una sola sesión y un historial compartido en todo el sitio.',
  },
  editor: {
    eyebrow: 'Editorial',
    title: 'Acceso al panel de edición',
    description: 'Entrada reservada a usuarios con permisos editoriales.',
    asideTitle: 'Permisos',
    asideBody: 'El área editorial comparte la misma cuenta base, pero mantiene permisos separados.',
  },
  chess: {
    eyebrow: 'Chess Club',
    title: 'Accede con tu cuenta global',
    description: 'Mantén tu perfil, tu progreso y tu historial con una sola sesión.',
    asideTitle: 'Perfil conectado',
    asideBody: 'El mismo usuario se utiliza en chess, blog y futuras áreas del ecosistema.',
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
    <main className="page-shell">
      <div className="page-container">
        <div className="grid min-h-[calc(100vh-10rem)] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-8">
            <div className="space-y-4">
              <p className="page-eyebrow">{copy.eyebrow}</p>
              <h1 className="page-title max-w-3xl">{copy.title}</h1>
              <p className="page-lead max-w-2xl">{copy.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface-panel-muted p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{copy.asideTitle}</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.asideBody}</p>
              </div>
              <div className="surface-panel-muted p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Seguridad</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">Acceso simple, restablecimiento de contraseña y sesión centralizada.</p>
              </div>
            </div>
          </section>

          <section className="w-full">{children}</section>
        </div>
      </div>
    </main>
  );
}
