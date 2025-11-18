"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Carga dinámica para evitar errores de hidratación con el tablero
const ChessGame = dynamic(() => import("@/components/ChessGame"), {
  ssr: false,
  loading: () => (
    <div className="text-green-500 font-mono animate-pulse">
      Cargando Tablero...
    </div>
  ),
});

export default function ChessPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent z-0"></div>

      {/* Botón Volver */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors font-mono">
            <ArrowLeft size={20} />
            cd ..
        </Link>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
          HUMAN vs MACHINE
        </h1>
        <p className="text-gray-500 font-mono mb-8 text-sm">
          Algoritmo v1.0 Stable
        </p>
        <ChessGame />
      </div>
    </main>
  );
}