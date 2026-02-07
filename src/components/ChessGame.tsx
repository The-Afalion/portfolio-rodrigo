"use client";
import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { motion } from "framer-motion";
import { RefreshCw, Cpu, Zap, Shield, Brain } from "lucide-react";
import { obtenerMovimientoIA, evaluarTablero } from "@/utils/chessAI";

type Dificultad = "Fácil" | "Medio" | "Difícil";

const coloresDificultad = {
  Fácil: "bg-green-500",
  Medio: "bg-yellow-500",
  Difícil: "bg-red-500",
};

export default function ChessGame() {
  const [partida, setPartida] = useState(new Chess());
  const [estado, setEstado] = useState("Tu turno (Blancas)");
  const [dificultad, setDificultad] = useState<Dificultad>("Medio");
  const [puntuacion, setPuntuacion] = useState(0);

  const realizarMovimientoIA = useCallback((partidaActual: Chess) => {
    const movimientoIA = obtenerMovimientoIA(partidaActual, dificultad);
    if (movimientoIA) {
      const nuevaPartida = new Chess(partidaActual.fen());
      nuevaPartida.move(movimientoIA);
      setPartida(nuevaPartida);
    }
  }, [dificultad]);

  function realizarMovimiento(movimiento: string | { from: string; to: string; promotion?: string }) {
    try {
      const copiaPartida = new Chess(partida.fen());
      const resultado = copiaPartida.move(movimiento);
      
      if (resultado) {
        setPartida(copiaPartida);
        setEstado("Pensando...");
        
        setTimeout(() => realizarMovimientoIA(copiaPartida), 300);
      }
      return resultado;
    } catch (e) {
      return null;
    }
  }

  function alSoltarPieza(casillaOrigen: string, casillaDestino: string) {
    const movimiento = realizarMovimiento({
      from: casillaOrigen,
      to: casillaDestino,
      promotion: "q",
    });
    return movimiento !== null;
  }

  useEffect(() => {
    let nuevoEstado = "";
    if (partida.isCheckmate()) {
      nuevoEstado = `Jaque Mate - ${partida.turn() === "w" ? "Ganan las Negras" : "Ganan las Blancas"}`;
    } else if (partida.isDraw()) {
      nuevoEstado = "Partida en Tablas";
    } else {
      nuevoEstado = partida.turn() === "w" ? "Tu turno (Blancas)" : "Turno de la IA (Negras)";
      if (partida.isCheck()) {
        nuevoEstado += " - Jaque";
      }
    }
    setEstado(nuevoEstado);
    setPuntuacion(evaluarTablero(partida));
  }, [partida]);

  const porcentajeEvaluacion = Math.max(0, Math.min(100, 50 + puntuacion * 5));

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl mx-auto">
      <div className="w-full lg:w-2/3">
        <Chessboard
          position={partida.fen()}
          onPieceDrop={alSoltarPieza}
          customDarkSquareStyle={{ backgroundColor: "#B58863" }}
          customLightSquareStyle={{ backgroundColor: "#F0D9B5" }}
        />
      </div>
      <div className="w-full lg:w-1/3 p-6 bg-secondary rounded-lg border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="text-blue-500" />
          <h2 className="text-2xl font-bold font-mono">SISTEMA_IA</h2>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Evaluación</h3>
          <div className="w-full bg-background rounded-full h-4 overflow-hidden border border-border">
            <div
              className="h-full bg-foreground transition-all duration-500"
              style={{ width: `${porcentajeEvaluacion}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-background rounded-md mb-4 min-h-[60px] flex items-center">
          <p className="font-mono text-sm text-muted-foreground">&gt; {estado}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Nivel de Dificultad</h3>
          <div className="flex gap-2">
            {(["Fácil", "Medio", "Difícil"] as Dificultad[]).map((nivel) => (
              <motion.button
                key={nivel}
                onClick={() => setDificultad(nivel)}
                className={`flex-1 px-3 py-2 text-sm font-mono rounded-md transition-colors text-white ${
                  dificultad === nivel
                    ? coloresDificultad[nivel]
                    : "bg-background text-foreground hover:bg-accent"
                }`}
                whileHover={{ opacity: dificultad === nivel ? 1 : 0.8 }}
                whileTap={{ scale: 0.95 }}
              >
                {nivel === "Fácil" && <Shield size={14} className="inline mr-1" />}
                {nivel === "Medio" && <Zap size={14} className="inline mr-1" />}
                {nivel === "Difícil" && <Brain size={14} className="inline mr-1" />}
                {nivel}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={() => { setPartida(new Chess()); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-background text-foreground font-mono text-sm rounded-md border border-border"
          whileHover={{ backgroundColor: "hsl(var(--accent))" }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw size={16} /> REINICIAR PARTIDA
        </motion.button>
      </div>
    </div>
  );
}
