"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

interface UsuarioChess {
  id: string;
  email: string;
  username: string;
  elo: number;
  botsDefeated: string[];
}

interface ContextoChessProps {
  usuario: UsuarioChess | null;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrarse: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  registrarVictoria: (botId: string) => Promise<void>;
  error: string | null;
  mensaje: string | null;
  cargando: boolean;
}

const ContextoChess = createContext<ContextoChessProps | undefined>(undefined);

function getBotsStorageKey(userId: string) {
  return `chess-bots-defeated:${userId}`;
}

function readBotsDefeated(userId: string) {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(getBotsStorageKey(userId));
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistBotsDefeated(userId: string, botsDefeated: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getBotsStorageKey(userId), JSON.stringify(botsDefeated));
}

async function ensureProfileAndLoadUser() {
  const response = await fetch('/api/auth/ensure-profile', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('No se pudo preparar el perfil del usuario.');
  }

  const payload = await response.json();
  const botsDefeated = readBotsDefeated(payload.user.id);

  return {
    id: payload.user.id as string,
    email: (payload.user.email as string | null) ?? '',
    username: payload.user.displayName as string,
    elo: payload.profile.elo as number,
    botsDefeated,
  };
}

export function ProveedorContextoChess({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioChess | null>(null);
  const [error, setError] = useState<string | null>(
    supabase ? null : 'Las variables publicas de Supabase no estan configuradas.'
  );
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    const syncCurrentUser = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session?.user) {
        setUsuario(null);
        return;
      }

      try {
        const currentUser = await ensureProfileAndLoadUser();
        setUsuario(currentUser);
      } catch (syncError) {
        console.error('Error cargando perfil global:', syncError);
        setError('No se pudo cargar tu perfil compartido.');
      }
    };

    syncCurrentUser();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUsuario(null);
        return;
      }

      ensureProfileAndLoadUser()
        .then((currentUser) => {
          setUsuario(currentUser);
        })
        .catch((syncError) => {
          console.error('Error sincronizando perfil:', syncError);
          setError('No se pudo sincronizar tu perfil.');
        });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const iniciarSesion = async (email: string, password: string) => {
    if (!supabase) {
      setError('Configura Supabase antes de usar el area de ajedrez.');
      return;
    }

    setCargando(true);
    setError(null);
    setMensaje(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      const currentUser = await ensureProfileAndLoadUser();
      setUsuario(currentUser);
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Error desconocido.';
      setError(message === 'Invalid login credentials' ? 'Credenciales incorrectas.' : message);
    } finally {
      setCargando(false);
    }
  };

  const registrarse = async (email: string, password: string) => {
    if (!supabase) {
      setError('Configura Supabase antes de usar el area de ajedrez.');
      return;
    }

    setCargando(true);
    setError(null);
    setMensaje(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            display_name: normalizedEmail.split('@')[0],
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (data.session) {
        const currentUser = await ensureProfileAndLoadUser();
        setUsuario(currentUser);
        setMensaje('Cuenta creada correctamente. Ya puedes usar el mismo usuario en toda la web.');
      } else {
        setMensaje('Cuenta creada. Si tu proyecto exige confirmacion por correo, revisa tu email para activarla.');
      }
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Error desconocido.';
      setError(message === 'User already registered' ? 'Ese correo ya esta registrado.' : message);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setMensaje(null);
    setError(null);
    setUsuario(null);
    router.push('/chess');
  };

  const registrarVictoria = async (botId: string) => {
    if (!usuario) {
      return;
    }

    const nuevosBots = [...new Set([...usuario.botsDefeated, botId])];
    const previousElo = usuario.elo;
    const shouldAwardElo = !usuario.botsDefeated.includes(botId);
    const nuevoElo = shouldAwardElo ? previousElo + 50 : previousElo;

    persistBotsDefeated(usuario.id, nuevosBots);
    setUsuario({ ...usuario, botsDefeated: nuevosBots, elo: nuevoElo });

    if (!shouldAwardElo) {
      return;
    }

    try {
      const response = await fetch('/api/chess/profile/victory', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar la victoria.');
      }

      const payload = await response.json();
      setUsuario((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              botsDefeated: nuevosBots,
              elo: typeof payload.elo === 'number' ? payload.elo : nuevoElo,
            }
          : currentUser
      );
    } catch (saveError) {
      console.error('Error guardando victoria:', saveError);
    }
  };

  return (
    <ContextoChess.Provider
      value={{
        usuario,
        iniciarSesion,
        registrarse,
        cerrarSesion,
        registrarVictoria,
        error,
        mensaje,
        cargando,
      }}
    >
      {children}
    </ContextoChess.Provider>
  );
}

export function useChess() {
  const context = useContext(ContextoChess);
  if (!context) {
    throw new Error('useChess debe usarse dentro de ProveedorContextoChess');
  }
  return context;
}
