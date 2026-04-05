"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";

interface MatchmakingLobbyProps {
  gameKey: string;
  gameName: string;
  onMatchFound: (matchId: string, role: string) => void;
  onCancel: () => void;
}

export default function MatchmakingLobby({ gameKey, gameName, onMatchFound, onCancel }: MatchmakingLobbyProps) {
  const [status, setStatus] = useState("Conectando al servidor...");

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    const joinQueue = async () => {
      try {
        const res = await fetch("/api/arcade/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameKey, action: "join" })
        });
        const data = await res.json();
        
        if (data.matched) {
          onMatchFound(data.matchId, data.role);
        } else {
          setStatus("Buscando oponentes en línea...");
          // Start polling
          pollingInterval = setInterval(pollQueue, 3000);
        }
      } catch (e) {
        setStatus("Error al conectar. Reintentando...");
      }
    };

    const pollQueue = async () => {
      try {
        const res = await fetch("/api/arcade/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameKey, action: "join" })
        });
        const data = await res.json();
        if (data.matched) {
          clearInterval(pollingInterval);
          setStatus("¡Oponente encontrado! Conectando...");
          setTimeout(() => onMatchFound(data.matchId, data.role), 1500);
        }
      } catch (e) {}
    };

    joinQueue();

    return () => {
      clearInterval(pollingInterval);
      // Salir de cola al desmontar
      fetch("/api/arcade/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameKey, action: "leave" }),
        keepalive: true
      });
    };
  }, [gameKey, onMatchFound]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-[2rem]">
      <div className="surface-panel p-8 max-w-md w-full text-center flex flex-col items-center border border-neon-cyan shadow-[0_0_30px_rgba(0,255,255,0.2)]">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-widest uppercase">{gameName}</h2>
        <div className="my-8 relative">
          <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full animate-pulse" />
          <Loader2 size={64} className="text-neon-cyan animate-spin relative z-10" />
        </div>
        <p className="text-neon-cyan font-semibold mb-6 animate-pulse">{status}</p>
        
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-2 rounded-full border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
        >
          <X size={18} /> Cancelar Búsqueda
        </button>
      </div>
    </div>
  );
}
