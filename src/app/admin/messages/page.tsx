import prisma from '@/lib/prisma';
import { Mail, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function markAsRead(id: string) {
  "use server";
  await prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });
  revalidatePath('/admin/messages');
}

async function deleteMessage(id: string) {
  "use server";
  await prisma.contactMessage.delete({
    where: { id },
  });
  revalidatePath('/admin/messages');
}

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Bandeja de Entrada</h1>

      <div className="space-y-4">
        {messages.map((message) => (
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
                <form action={async () => { "use server"; if(confirm('¿Eliminar este mensaje?')) await deleteMessage(message.id); }}>
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
