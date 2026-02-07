import prisma from '@/lib/prisma';

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Suscriptores de la Newsletter</h1>

      <div className="bg-secondary border border-border rounded-lg">
        <table className="w-full text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Fecha de Suscripción</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
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
