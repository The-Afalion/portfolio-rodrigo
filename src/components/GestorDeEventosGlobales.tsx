"use client";

import { useState, useEffect, useCallback } from 'react';
import { usarContextoGlobal, TipoEventoRandy } from '@/context/ContextoGlobal';

const CODIGO_KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const TEXTO_RANDY = 'randy';
const TEXTO_RIMWORLD = 'rimworld';
const TEXTO_1984 = '1984';

const EVENTOS_RANDY: TipoEventoRandy[] = ["zzzzt", "eclipse", "capsulas"];

export default function GestorDeEventosGlobales() {
  const [secuenciaTeclas, setSecuenciaTeclas] = useState<string[]>([]);
  const { 
    setEfectoMatrixVisible, 
    setEventoRandyActivo, 
    eventoRandyActivo,
    setEstado1984,
    estado1984
  } = usarContextoGlobal();

  const gestionarPulsacion = useCallback((evento: KeyboardEvent) => {
    // Ignorar pulsaciones si un modo ya está activo
    if (estado1984 !== 'inactivo' || eventoRandyActivo) return;
    setSecuenciaTeclas(prev => [...prev, evento.key].slice(-15));
  }, [estado1984, eventoRandyActivo]);

  useEffect(() => {
    window.addEventListener('keydown', gestionarPulsacion);
    return () => {
      window.removeEventListener('keydown', gestionarPulsacion);
    };
  }, [gestionarPulsacion]);

  useEffect(() => {
    const secuenciaComoTexto = secuenciaTeclas.join('').toLowerCase();

    if (secuenciaTeclas.slice(-CODIGO_KONAMI.length).join('') === CODIGO_KONAMI.join('')) {
      setEfectoMatrixVisible(true);
      setSecuenciaTeclas([]);
      return;
    }

    if ((secuenciaComoTexto.includes(TEXTO_RANDY) || secuenciaComoTexto.includes(TEXTO_RIMWORLD)) && !eventoRandyActivo) {
      const eventoAleatorio = EVENTOS_RANDY[Math.floor(Math.random() * EVENTOS_RANDY.length)];
      setEventoRandyActivo(eventoAleatorio);
      setSecuenciaTeclas([]);
      return;
    }

    if (secuenciaComoTexto.includes(TEXTO_1984)) {
      setEstado1984('vigilando');
      setSecuenciaTeclas([]);
      return;
    }

  }, [secuenciaTeclas, setEfectoMatrixVisible, setEventoRandyActivo, eventoRandyActivo, setEstado1984]);

  return null;
}
