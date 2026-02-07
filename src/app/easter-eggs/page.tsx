"use client";

import { usarContextoGlobal } from "@/context/ContextoGlobal";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Eye, Zap, Grid, Moon } from "lucide-react";

export default function PaginaEasterEggs() {
  const { 
    setEfectoMatrixVisible, 
    setEventoRandyActivo, 
    setEstado1984 
  } = usarContextoGlobal();

  return (
    <main className="min-h-screen bg-black text-green-500 font-mono p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link href="/" className="flex items-center gap-2 text-green-700 hover:text-green-400 mb-8 transition-colors">
          <ArrowLeft size={20} />
          cd ..
        </Link>

        <h1 className="text-4xl font-bold mb-2 glitch-text">PANEL DE CONTROL SECRETO</h1>
        <p className="text-green-800 mb-12 border-b border-green-900 pb-4">
          Acceso de Administrador // Nivel 5
        </p>

        <div className="grid gap-6">
          {/* Matrix */}
          <div className="border border-green-900 p-6 rounded hover:bg-green-900/10 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <Grid size={24} />
              <h2 className="text-xl font-bold">Protocolo Matrix</h2>
            </div>
            <p className="text-sm text-green-700 mb-4">Activa la lluvia de código digital en toda la pantalla.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setEfectoMatrixVisible(true)}
                className="px-4 py-2 bg-green-900/30 border border-green-600 hover:bg-green-600 hover:text-black transition-all"
              >
                ACTIVAR
              </button>
              <button 
                onClick={() => setEfectoMatrixVisible(false)}
                className="px-4 py-2 border border-green-900 text-green-800 hover:text-green-500 transition-all"
              >
                DESACTIVAR
              </button>
            </div>
          </div>

          {/* 1984 */}
          <div className="border border-green-900 p-6 rounded hover:bg-green-900/10 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <Eye size={24} />
              <h2 className="text-xl font-bold">Vigilancia 1984</h2>
            </div>
            <p className="text-sm text-green-700 mb-4">Invoca al Gran Hermano. (Responde '4' para jugar).</p>
            <button 
              onClick={() => setEstado1984('vigilando')}
              className="px-4 py-2 bg-green-900/30 border border-green-600 hover:bg-green-600 hover:text-black transition-all"
            >
              INICIAR VIGILANCIA
            </button>
          </div>

          {/* Eventos Randy */}
          <div className="border border-green-900 p-6 rounded hover:bg-green-900/10 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <Zap size={24} />
              <h2 className="text-xl font-bold">Eventos Aleatorios (Randy)</h2>
            </div>
            <p className="text-sm text-green-700 mb-4">Dispara eventos del narrador aleatorio.</p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setEventoRandyActivo('zzzzt')}
                className="px-4 py-2 border border-green-700 hover:bg-green-700 hover:text-black transition-all"
              >
                Zzzzt (Cortocircuito)
              </button>
              <button 
                onClick={() => setEventoRandyActivo('eclipse')}
                className="px-4 py-2 border border-green-700 hover:bg-green-700 hover:text-black transition-all"
              >
                Eclipse Solar
              </button>
              <button 
                onClick={() => setEventoRandyActivo('capsulas')}
                className="px-4 py-2 border border-green-700 hover:bg-green-700 hover:text-black transition-all"
              >
                Cápsulas de Carga
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-green-900 font-mono">
          SYSTEM_ID: RODO_PORTFOLIO_V3
          <br />
          STATUS: ONLINE
        </div>
      </div>
    </main>
  );
}
