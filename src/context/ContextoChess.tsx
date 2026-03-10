"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface UsuarioChess {
  id: string;
  username: string;
  elo: number;
  botsDefeated: string[];
}

interface ContextoChessProps {
  usuario: UsuarioChess | null;
  iniciarSesion: (username: string, password: string) => Promise<void>;
  registrarse: (username: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
  registrarVictoria: (botId: string) => Promise<void>;
  error: string | null;
  cargando: boolean;
}

const ContextoChess = createContext<ContextoChessProps | undefined>(undefined);

import { supabase } from '@/lib/supabase-client';

export function ProveedorContextoChess({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioChess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Cargar la sesión actual desde Supabase JWT
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await cargarDatosPerfil(session.user.id);
      }
    };
    getSession();

    // 2. Suscribirse a cambios de estado de Auth (Login, Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await cargarDatosPerfil(session.user.id);
      } else {
        setUsuario(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const cargarDatosPerfil = async (userId: string) => {
    try {
      // Pedir los datos extendidos del jugador a nuestra tabla personalizada
      const { data, error } = await supabase
        .from('chess_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error cargando perfil:", error);
        return;
      }

      if (data) {
        setUsuario({
          id: data.id,
          username: data.username,
          elo: data.elo,
          botsDefeated: data.bots_defeated || [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const iniciarSesion = async (username: string, password: string) => {
    setCargando(true);
    setError(null);
    try {
      // Para iniciar sesión con Supabase Auth necesitamos un email.
      // Así que generamos un email virtual en base al username.
      const virtualEmail = `${username.toLowerCase()}@chesshub.local`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: virtualEmail,
        password: password,
      });

      if (error) throw new Error(error.message);

      if (data.user) {
        await cargarDatosPerfil(data.user.id);
      }
    } catch (err: any) {
      setError(err.message === "Invalid login credentials" ? "Credenciales incorrectas" : err.message);
    } finally {
      setCargando(false);
    }
  };

  const registrarse = async (username: string, password: string) => {
    setCargando(true);
    setError(null);
    try {
      const virtualEmail = `${username.toLowerCase()}@chesshub.local`;

      // 1. Crear el usuario en auth.users
      const { data, error } = await supabase.auth.signUp({
        email: virtualEmail,
        password: password,
        options: {
          data: {
            username: username // Esto viaja a auth.users.raw_user_meta_data para el Trigger SQL
          }
        }
      });

      if (error) throw new Error(error.message);

      if (data.user) {
        // En este punto, el Trigger SQL ya debió haber insertado en 'chess_profiles'
        // pero le daremos 1 segundo de margen para evitar condiciones de carrera por red local.
        setTimeout(() => {
          cargarDatosPerfil(data.user!.id);
        }, 1000);
      }

    } catch (err: any) {
      setError(err.message === "User already registered" ? "El usuario ya existe" : err.message);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    router.push('/chess');
  };

  const registrarVictoria = async (botId: string) => {
    if (!usuario) return;

    // UI Optimista
    const nuevosBots = [...new Set([...usuario.botsDefeated, botId])];
    const nuevoElo = usuario.elo + 50;

    setUsuario({ ...usuario, botsDefeated: nuevosBots, elo: nuevoElo });

    // Actualizar BBDD Real
    const { error } = await supabase
      .from('chess_profiles')
      .update({
        elo: nuevoElo,
        bots_defeated: nuevosBots
      })
      .eq('id', usuario.id);

    if (error) {
      console.error("Error guardando victoria:", error);
    }
  };

  return (
    <ContextoChess.Provider value={{
      usuario,
      iniciarSesion,
      registrarse,
      cerrarSesion,
      registrarVictoria,
      error,
      cargando
    }}>
      {children}
    </ContextoChess.Provider>
  );
}

export function useChess() {
  const context = useContext(ContextoChess);
  if (!context) throw new Error("useChess debe usarse dentro de ProveedorContextoChess");
  return context;
}
