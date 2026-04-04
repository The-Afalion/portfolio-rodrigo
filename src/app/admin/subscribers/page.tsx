import prisma from '@/lib/prisma';
import { requireSuperAdminAccess } from '@/lib/editor-access';

export const dynamic = 'force-dynamic'; // Forzar renderizado dinámico
export const runtime = 'nodejs';

export default async function AdminSubscribersPage() {
  await requireSuperAdminAccess();

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Newsletter</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Suscriptores</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Vista consolidada del listado de suscripción con acceso restringido a superadministradores.
        </p>
      </section>

      <section className="rounded-[28px] border border-border bg-secondary/50 p-6">
        <p className="text-sm font-medium text-muted-foreground">Total de suscriptores</p>
        <p className="mt-3 text-4xl font-semibold text-foreground">{subscribers.length}</p>
      </section>

      <div className="bg-secondary border border-border rounded-lg">
        <table className="w-full text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Fecha de Suscripción</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber: any) => (
              <tr key={subscriber.id} className="border-b border-border last:border-b-0">
                <td className="p-4">{subscriber.email}</td>
                <td className="p-4 text-muted-foreground">
                  {new Date(subscriber.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            Aún no hay suscriptores.
          </p>
        )}
      </div>
    </div>
  );
}
