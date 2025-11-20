"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ChessBackground from "@/components/ChessBackground";

const ChessGame = dynamic(() => import("@/components/ChessGame"), {
  ssr: false,
  loading: () => (
    <div className="text-blue-500 font-mono animate-pulse">
      Cargando Simulador...
    </div>
  ),
});

export default function ChessPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ChessBackground />

      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
            <ArrowLeft size={20} />
            cd ..
        </Link>
      </div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground">
          HUMAN vs MACHINE
        </h1>
        <p className="text-muted-foreground font-mono mb-8 text-sm">
          Elige un nivel y demuestra tu estrategia.
        </p>
        <ChessGame />
      </div>
    </main>
  );
}
