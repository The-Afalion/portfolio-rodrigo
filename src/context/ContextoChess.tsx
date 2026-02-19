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

export function ProveedorContextoChess({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioChess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  // Cargar sesión al iniciar (si existe token o cookie, aquí simplificado con localStorage para persistencia básica de sesión)
  useEffect(() => {
    const savedUser = localStorage.getItem('chess_user_session');
    if (savedUser) {
      setUsuario(JSON.parse(savedUser));
    }
  }, []);

  const iniciarSesion = async (username: string, password: string) => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/chess/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

      setUsuario(data);
      localStorage.setItem('chess_user_session', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const registrarse = async (username: string, password: string) => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/chess/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al registrarse');

      setUsuario(data);
      localStorage.setItem('chess_user_session', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('chess_user_session');
    router.push('/chess');
  };

  const registrarVictoria = async (botId: string) => {
    if (!usuario) return;
    
    // Optimistic UI update
    const nuevosBots = [...usuario.botsDefeated, botId];
    const nuevoElo = usuario.elo + 50;
    
    setUsuario({ ...usuario, botsDefeated: nuevosBots, elo: nuevoElo });
    localStorage.setItem('chess_user_session', JSON.stringify({ ...usuario, botsDefeated: nuevosBots, elo: nuevoElo }));

    // Aquí deberías llamar a una API para guardar el progreso en la DB real
    // await fetch('/api/chess/progress', { ... });
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
