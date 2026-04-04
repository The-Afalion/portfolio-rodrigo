"use client";

import { useState, useTransition } from 'react';
import { Shield, ShieldCheck, UserMinus, UserPlus2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { promoteEditorByEmail, revokeEditorAccess } from './actions';

type TeamMember = {
  id: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN';
  lastSignInAt: string | null;
  createdAt: string | null;
};

export default function TeamManagementPanel({
  members,
}: {
  members: TeamMember[];
}) {
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  function handlePromote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = email.trim();

    if (!nextEmail) {
      return;
    }

    startTransition(async () => {
      const result = await promoteEditorByEmail(nextEmail);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success ?? 'Equipo actualizado.');
      setEmail('');
    });
  }

  function handleRevoke(userId: string) {
    setPendingUserId(userId);

    startTransition(async () => {
      const result = await revokeEditorAccess(userId);
      setPendingUserId(null);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success ?? 'Permisos actualizados.');
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border bg-secondary/50 p-6">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <UserPlus2 size={20} className="text-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Promover por correo</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Si el usuario ya existe, obtendrá permisos de editor inmediatamente. Si aún no existe, se le enviará una invitación y quedará habilitado al completar su acceso.
            </p>
          </div>
        </div>

        <form onSubmit={handlePromote} className="flex flex-col gap-3 lg:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="editor@empresa.com"
            className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/40"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Actualizando...' : 'Dar acceso editorial'}
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-border bg-secondary/50 p-6">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <ShieldCheck size={20} className="text-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Equipo editorial actual</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Los correos <span className="font-medium text-foreground">@rodocodes.dev</span> conservan acceso superadministrador automático. El resto puede ser promovido o retirado desde aquí.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {members.map((member) => {
            const isSuperAdmin = member.role === 'SUPERADMIN';
            const isRowPending = pendingUserId === member.id && isPending;

            return (
              <div
                key={member.id}
                className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-background/70 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="truncate text-sm font-semibold text-foreground">{member.email}</p>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {isSuperAdmin ? <Shield size={12} /> : <ShieldCheck size={12} />}
                      {isSuperAdmin ? 'Superadmin' : 'Editor'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Alta: {member.createdAt ?? 'sin dato'}</span>
                    <span>Último acceso: {member.lastSignInAt ?? 'sin dato'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isSuperAdmin ? (
                    <span className="text-xs text-muted-foreground">Protegido por dominio</span>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRevoke(member.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <UserMinus size={16} />
                      <span>{isRowPending ? 'Retirando...' : 'Retirar acceso'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {members.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Aún no hay usuarios editoriales registrados.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
