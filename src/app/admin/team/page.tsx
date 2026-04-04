import prisma from '@/lib/prisma';
import { Shield, Users, UserPlus2 } from 'lucide-react';
import { isSuperAdminEmail, requireSuperAdminAccess } from '@/lib/editor-access';
import { listAllSupabaseUsers } from '@/lib/supabase-admin';
import TeamManagementPanel from './TeamManagementPanel';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function formatDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminTeamPage() {
  await requireSuperAdminAccess();

  const [profiles, authUsers] = await Promise.all([
    prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        role: true,
        createdAt: true,
      },
    }),
    listAllSupabaseUsers(),
  ]);

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const members = authUsers
    .filter((user) => {
      const email = user.email?.trim().toLowerCase();
      const profile = profileById.get(user.id);
      return Boolean(email && (isSuperAdminEmail(email) || profile?.role === 'ADMIN'));
    })
    .map((user) => {
      const email = user.email!.trim().toLowerCase();
      const isSuperAdmin = isSuperAdminEmail(email);
      const profile = profileById.get(user.id);

      return {
        id: user.id,
        email,
        role: isSuperAdmin ? 'SUPERADMIN' as const : 'ADMIN' as const,
        createdAt: formatDate(profile?.createdAt?.toISOString() ?? user.created_at ?? null),
        lastSignInAt: formatDate(user.last_sign_in_at ?? null),
      };
    })
    .sort((left, right) => left.email.localeCompare(right.email));

  const totalUsers = authUsers.length;
  const totalEditors = members.length;
  const totalSuperAdmins = members.filter((member) => member.role === 'SUPERADMIN').length;
  const promotedEditors = totalEditors - totalSuperAdmins;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Equipo editorial</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Administración de permisos</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Aquí controlas quién puede entrar al panel. Los usuarios con correo <span className="font-medium text-foreground">@rodocodes.dev</span> actúan como superadministradores automáticos. El resto solo obtiene acceso si lo promueves desde esta interfaz.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Usuarios Auth</p>
            <Users size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{totalUsers}</p>
        </div>

        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Editores activos</p>
            <UserPlus2 size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{totalEditors}</p>
        </div>

        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Superadmins</p>
            <Shield size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{totalSuperAdmins}</p>
        </div>

        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Promovidos manualmente</p>
            <Shield size={18} className="text-muted-foreground" />
          </div>
          <p className="text-4xl font-semibold text-foreground">{promotedEditors}</p>
        </div>
      </section>

      <TeamManagementPanel members={members} />
    </div>
  );
}
