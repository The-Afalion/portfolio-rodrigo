"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usarContextoGlobal } from '@/context/ContextoGlobal';

// --- Utilidad de Audio Sintético ---
const reproducirZzzzt = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Ruido tipo "Zzzzt" (Onda de sierra con caída rápida)
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.error("Audio error", e);
  }
};

// --- Componentes de Eventos Específicos ---

function EventoZzzzt() {
  useEffect(() => {
    reproducirZzzzt();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Efecto de chisporroteo con box-shadow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.8, 1, 0], transition: { duration: 0.5 } }}
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 100px 50px #60a5fa' }}
      />
    </div>
  );
}

function EventoEclipse() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 2 } }}
      exit={{ opacity: 0, transition: { duration: 2, delay: 4 } }}
      className="fixed inset-0 z-[90] bg-black/80 pointer-events-none"
    />
  );
}

function CapsulasDeCarga() {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {[1, 2].map(i => (
        <motion.div
          key={i}
          initial={{ y: '-100vh', x: `${20 + i * 40}vw`, rotate: i * 30 }}
          animate={{ y: '100vh', transition: { duration: 1, delay: i * 0.2, ease: 'easeIn' } }}
          className="absolute top-0 w-20 h-32 bg-gray-600 border-2 border-gray-400 rounded"
        />
      ))}
    </div>
  );
}


// --- Gestor Principal ---

export default function GestorDeEventosRandy() {
  const { eventoRandyActivo, setEventoRandyActivo } = usarContextoGlobal();

  useEffect(() => {
    if (eventoRandyActivo) {
      let duracion = 0;
      switch (eventoRandyActivo) {
        case 'zzzzt': duracion = 1000; break;
        case 'eclipse': duracion = 8000; break;
        case 'capsulas': duracion = 2000; break;
      }
      
      const temporizador = setTimeout(() => {
        setEventoRandyActivo(null);
      }, duracion);

      return () => clearTimeout(temporizador);
    }
  }, [eventoRandyActivo, setEventoRandyActivo]);

  return (
    <AnimatePresence>
      {eventoRandyActivo === 'zzzzt' && <EventoZzzzt />}
      {eventoRandyActivo === 'eclipse' && <EventoEclipse />}
      {eventoRandyActivo === 'capsulas' && <CapsulasDeCarga />}
    </AnimatePresence>
  );
}
