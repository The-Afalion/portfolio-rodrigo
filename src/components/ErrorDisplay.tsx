import { AlertTriangle } from 'lucide-react';

export default function ErrorDisplay({ error }: { error: string }) {
  const message = error ? "La experiencia no pudo abrirse en este momento." : "La experiencia no está disponible.";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex items-center gap-4 mb-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-bold">Experiencia en pausa</h1>
      </div>
      <p className="max-w-md rounded-md bg-secondary p-4 text-center text-sm leading-7 text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
