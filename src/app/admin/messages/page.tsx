import prisma from '@/lib/prisma';
import { Mail, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { requireSuperAdminAccess } from '@/lib/editor-access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function markAsRead(id: string) {
  "use server";
  await requireSuperAdminAccess();
  await prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });
  revalidatePath('/admin/messages');
}

async function deleteMessage(id: string) {
  "use server";
  await requireSuperAdminAccess();
  await prisma.contactMessage.delete({
    where: { id },
  });
  revalidatePath('/admin/messages');
}

export default async function AdminMessagesPage() {
  await requireSuperAdminAccess();

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  const unreadMessages = messages.filter((message) => !message.read).length;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Mensajes</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Bandeja de entrada</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Consulta mensajes de contacto, detecta pendientes y procesa el buzón desde un único lugar.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <p className="text-sm font-medium text-muted-foreground">Mensajes totales</p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{messages.length}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-secondary/50 p-6">
          <p className="text-sm font-medium text-muted-foreground">Sin leer</p>
          <p className="mt-3 text-4xl font-semibold text-foreground">{unreadMessages}</p>
        </div>
      </section>

      <div className="space-y-4">
        {messages.map((message: any) => (
          <div key={message.id} className={`p-6 border rounded-lg ${message.read ? 'bg-secondary/50 border-border' : 'bg-secondary border-blue-500/50'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">{message.name} <span className="font-normal text-muted-foreground">&lt;{message.email}&gt;</span></p>
                <p className="text-sm text-muted-foreground">{new Date(message.createdAt).toLocaleString('es-ES')}</p>
              </div>
              <div className="flex gap-2">
                <form action={async () => { "use server"; await markAsRead(message.id); }}>
                  <button type="submit" disabled={message.read} className="p-2 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed" title="Marcar como leído">
                    <Mail size={18} />
                  </button>
                </form>
                <form action={async () => { "use server"; await deleteMessage(message.id); }}>
                  <button type="submit" className="p-2 text-red-500 hover:bg-red-900/20 rounded" title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-4 text-foreground/80 whitespace-pre-wrap">{message.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            No hay mensajes nuevos.
          </p>
        )}
      </div>
    </div>
  );
}
