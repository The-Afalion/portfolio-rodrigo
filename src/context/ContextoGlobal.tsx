"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

// --- Tipos para los Huevos de Pascua ---
export type TipoEventoRandy = "zzzzt" | "eclipse" | "capsulas" | null;
export type Estado1984 = "inactivo" | "vigilando" | "interrogando" | "recompensa" | "castigo" | "minijuego";

interface ContextoGlobalProps {
  // Huevo de Pascua: Matrix
  efectoMatrixVisible: boolean;
  setEfectoMatrixVisible: (visible: boolean) => void;
  
  // Huevo de Pascua: RimWorld
  eventoRandyActivo: TipoEventoRandy;
  setEventoRandyActivo: (evento: TipoEventoRandy) => void;

  // Huevo de Pascua: 1984
  estado1984: Estado1984;
  setEstado1984: (estado: Estado1984) => void;
  logoCambiado1984: boolean;
  setLogoCambiado1984: (cambiado: boolean) => void;
}

// --- Creación del Contexto ---
const ContextoGlobal = createContext<ContextoGlobalProps | undefined>(undefined);

// --- Proveedor del Contexto ---
export function ProveedorContextoGlobal({ children }: { children: ReactNode }) {
  const [efectoMatrixVisible, setEfectoMatrixVisible] = useState(false);
  const [eventoRandyActivo, setEventoRandyActivo] = useState<TipoEventoRandy>(null);
  const [estado1984, setEstado1984] = useState<Estado1984>("inactivo");
  const [logoCambiado1984, setLogoCambiado1984] = useState(false);

  const valor = {
    efectoMatrixVisible,
    setEfectoMatrixVisible,
    eventoRandyActivo,
    setEventoRandyActivo,
    estado1984,
    setEstado1984,
    logoCambiado1984,
    setLogoCambiado1984,
  };

  return (
    <ContextoGlobal.Provider value={valor}>
      {children}
    </ContextoGlobal.Provider>
  );
}

// --- Hook personalizado para usar el contexto ---
export function usarContextoGlobal() {
  const contexto = useContext(ContextoGlobal);
  if (contexto === undefined) {
    throw new Error('usarContextoGlobal debe ser usado dentro de un ProveedorContextoGlobal');
  }
  return contexto;
}
