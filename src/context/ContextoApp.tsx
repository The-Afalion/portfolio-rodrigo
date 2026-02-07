"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ContextoAppProps {
  logoCambiado1984: boolean;
  setLogoCambiado1984: (cambiado: boolean) => void;
}

const ContextoApp = createContext<ContextoAppProps | undefined>(undefined);

export function ProveedorContextoApp({ children }: { children: ReactNode }) {
  const [logoCambiado1984, setLogoCambiado1984] = useState(false);

  const valor = {
    logoCambiado1984,
    setLogoCambiado1984,
  };

  return (
    <ContextoApp.Provider value={valor}>
      {children}
    </ContextoApp.Provider>
  );
}

export function usarContextoApp() {
  const contexto = useContext(ContextoApp);
  if (contexto === undefined) {
    throw new Error('usarContextoApp debe ser usado dentro de un ProveedorContextoApp');
  }
  return contexto;
}
