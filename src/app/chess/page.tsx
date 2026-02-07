import dynamic from 'next/dynamic';

// Carga dinámica del componente cliente con la opción `ssr: false`
// Esto le dice a Next.js que NUNCA intente renderizar este componente en el servidor.
const ChessHubClient = dynamic(() => import('./ChessHubClient'), { 
  ssr: false,
  // Opcional: Muestra un mensaje de carga mientras el componente se carga en el cliente
  loading: () => <p className="min-h-screen flex items-center justify-center">Cargando Laboratorio...</p> 
});

export default function ChessPage() {
  return <ChessHubClient />;
}
