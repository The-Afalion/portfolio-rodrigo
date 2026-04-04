import { AlertTriangle } from 'lucide-react';

export default function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex items-center gap-4 mb-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-bold">Ha ocurrido un error</h1>
      </div>
      <p className="text-muted-foreground font-mono bg-secondary p-4 rounded-md">
        {error}
      </p>
    </div>
  );
}
