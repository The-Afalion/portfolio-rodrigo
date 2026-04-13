import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import ErrorDisplay from '@/components/ErrorDisplay';
import { createClient } from '@/utils/supabase/server';

// Cargamos el cliente del Nexus de forma dinámica
const NexusClient = dynamicImport(() => import('./NexusClient'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center bg-black"><p className="text-white animate-pulse">Conectando al Nexus...</p></div>,
});

export const dynamic = 'force-dynamic';

export default async function NexusPage() {
  const playerEmailCookie = cookies().get('player-email');
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const playerEmail = user?.email ?? playerEmailCookie?.value ?? null;

  // Si el usuario no está identificado, no puede entrar al Nexus.
  if (!playerEmail) {
    redirect('/chess');
  }

  try {
    // Pasamos el email del jugador y el token de acceso de Supabase al cliente.
    // El token es necesario para que el cliente se autentique con Supabase Realtime.
    // NOTA: Para una app real, generaríamos un token JWT específico, pero para este caso,
    // usaremos una solución más simple si el token no está directamente disponible.
    // Por ahora, solo pasamos el email, la autenticación la manejaremos en el cliente.
    return (
      <NexusClient 
        playerEmail={playerEmail}
      />
    );
  } catch (error: any) {
    return <ErrorDisplay error={error.message} />;
  }
}
