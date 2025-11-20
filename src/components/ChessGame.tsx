"use client";
import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { motion } from "framer-motion";
import { RefreshCw, Cpu, Zap, Shield, Brain } from "lucide-react";
import { getAIMove, evaluateBoard } from "@/utils/chessAI";

type Difficulty = "Fácil" | "Medio" | "Difícil";

const difficultyColors = {
  Fácil: "bg-green-500",
  Medio: "bg-yellow-500",
  Difícil: "bg-red-500",
};

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [status, setStatus] = useState("Tu turno (Blancas)");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medio");
  const [evaluation, setEvaluation] = useState(0);

  function makeMove(move: string | { from: string; to: string; promotion?: string }) {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      
      if (result) {
        setGame(gameCopy);
        setStatus("Pensando...");
        
        setTimeout(() => {
          const aiMove = getAIMove(gameCopy, difficulty);
          if (aiMove) {
            gameCopy.move(aiMove);
            setGame(new Chess(gameCopy.fen()));
          }
        }, 300);
      }
      return result;
    } catch (e) {
      return null;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    return move !== null;
  }

  useEffect(() => {
    let newStatus = "";
    const g = game as any;
    if (g.isCheckmate()) {
      newStatus = `Jaque Mate - ${g.turn() === "w" ? "Ganan las Negras" : "Ganan las Blancas"}`;
    } else if (g.isDraw()) {
      newStatus = "Partida en Tablas";
    } else {
      newStatus = g.turn() === "w" ? "Tu turno (Blancas)" : "Turno de la IA (Negras)";
      if (g.isCheck()) {
        newStatus += " - Jaque";
      }
    }
    setStatus(newStatus);
    setEvaluation(evaluateBoard(game));
  }, [game]);

  const evalPercentage = Math.max(0, Math.min(100, 50 + evaluation * 5));

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl mx-auto">
      <div className="w-full lg:w-2/3">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          // CORRECCIÓN: Usando las props correctas para el estilo de las casillas
          customDarkSquareStyle={{ backgroundColor: "#B58863" }}
          customLightSquareStyle={{ backgroundColor: "#F0D9B5" }}
        />
      </div>
      <div className="w-full lg:w-1/3 p-6 bg-secondary rounded-lg border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="text-blue-500" />
          <h2 className="text-2xl font-bold font-mono">SYSTEM_AI</h2>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Evaluación</h3>
          <div className="w-full bg-background rounded-full h-4 overflow-hidden border border-border">
            <div
              className="h-full bg-foreground transition-all duration-500"
              style={{ width: `${evalPercentage}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-background rounded-md mb-4 min-h-[60px] flex items-center">
          <p className="font-mono text-sm text-muted-foreground">&gt; {status}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Nivel de Dificultad</h3>
          <div className="flex gap-2">
            {(["Fácil", "Medio", "Difícil"] as Difficulty[]).map((level) => (
              <motion.button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 px-3 py-2 text-sm font-mono rounded-md transition-colors text-white ${
                  difficulty === level
                    ? difficultyColors[level]
                    : "bg-background text-foreground hover:bg-accent"
                }`}
                whileHover={{ opacity: difficulty === level ? 1 : 0.8 }}
                whileTap={{ scale: 0.95 }}
              >
                {level === "Fácil" && <Shield size={14} className="inline mr-1" />}
                {level === "Medio" && <Zap size={14} className="inline mr-1" />}
                {level === "Difícil" && <Brain size={14} className="inline mr-1" />}
                {level}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={() => { setGame(new Chess()); }}
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
