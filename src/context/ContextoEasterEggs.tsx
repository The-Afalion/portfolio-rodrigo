"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type TipoEventoRandy = "zzzzt" | "eclipse" | "capsulas" | null;
export type Estado1984 = "inactivo" | "vigilando" | "interrogando" | "recompensa" | "castigo" | "minijuego";

interface ContextoEasterEggsProps {
  efectoMatrixVisible: boolean;
  setEfectoMatrixVisible: (visible: boolean) => void;
  
  eventoRandyActivo: TipoEventoRandy;
  setEventoRandyActivo: (evento: TipoEventoRandy) => void;

  estado1984: Estado1984;
  setEstado1984: (estado: Estado1984) => void;
}

const ContextoEasterEggs = createContext<ContextoEasterEggsProps | undefined>(undefined);

export function ProveedorContextoEasterEggs({ children }: { children: ReactNode }) {
  const [efectoMatrixVisible, setEfectoMatrixVisible] = useState(false);
  const [eventoRandyActivo, setEventoRandyActivo] = useState<TipoEventoRandy>(null);
  const [estado1984, setEstado1984] = useState<Estado1984>("inactivo");

  const valor = {
    efectoMatrixVisible,
    setEfectoMatrixVisible,
    eventoRandyActivo,
    setEventoRandyActivo,
    estado1984,
    setEstado1984,
  };

  return (
    <ContextoEasterEggs.Provider value={valor}>
      {children}
    </ContextoEasterEggs.Provider>
  );
}

export function usarContextoEasterEggs() {
  const contexto = useContext(ContextoEasterEggs);
  if (contexto === undefined) {
    throw new Error('usarContextoEasterEggs debe ser usado dentro de un ProveedorContextoEasterEggs');
  }
  return contexto;
}
