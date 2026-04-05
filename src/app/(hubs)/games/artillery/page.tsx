"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";

import MatchmakingLobby from "@/components/games/MatchmakingLobby";

interface Player {
  x: number;
  y: number;
  color: string;
  alive: boolean;
}

export default function ArtilleryGame() {
  const [phase, setPhase] = useState<"menu"|"queue"|"playing">("menu");
  const [gameMode, setGameMode] = useState<"hotseat"|"online">("hotseat");
  const [onlineRole, setOnlineRole] = useState<"player1"|"player2"|null>(null);
  const [matchId, setMatchId] = useState<string|null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [turn, setTurn] = useState<1 | 2>(1); // Player 1 (Cyan) or 2 (Pink)
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState("Apunta y dispara. ¡Destruye la base enemiga!");

  // Refs de estado del juego sin forzar re-renders constantes en React
  const gameRef = useRef({
    terrain: [] as number[],
    p1: { x: 100, y: 0, color: "#8c4030", alive: true } as Player,
    p2: { x: 700, y: 0, color: "#2e404d", alive: true } as Player,
    projectile: null as { x: number, y: number, vx: number, vy: number, active: boolean, color: string } | null,
    width: 800,
    height: 400
  });

  // Ya no iniciamos el juego automaticamente, esperan a la fase "playing"
  useEffect(() => {
    if (phase === "playing") {
       initGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const initGame = () => {
    const W = 800;
    const H = 400;
    const t = [];
    // Generar montañas suaves
    for (let x = 0; x < W; x++) {
      const height = 150 + Math.sin(x * 0.01) * 50 + Math.cos(x * 0.03) * 30 + Math.sin(x * 0.005) * 60;
      t.push(H - height);
    }
    gameRef.current.terrain = t;
    
    // Posicionar jugadores
    const p1x = 100;
    const p2x = 700;
    gameRef.current.p1 = { x: p1x, y: t[p1x], color: "#8c4030", alive: true };
    gameRef.current.p2 = { x: p2x, y: t[p2x], color: "#2e404d", alive: true };
    gameRef.current.projectile = null;
    gameRef.current.width = W;
    gameRef.current.height = H;
    
    setTurn(1);
    setMessage("Partida Iniciada. Turno de Tinta Roja (Jugador 1)");
    drawFrame();
  };

  const drawFrame = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    
    const w = gameRef.current.width;
    const h = gameRef.current.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Dibujar cielo oscuro -> pergamino
    ctx.fillStyle = "#fcfaf4";
    ctx.fillRect(0, 0, w, h);

    // Dibujar terreno (tinta vintage)
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x < w; x++) {
      ctx.lineTo(x, gameRef.current.terrain[x]);
    }
    ctx.lineTo(w, h);
    ctx.fillStyle = "rgba(140, 103, 61, 0.1)";
    ctx.fill();
    ctx.strokeStyle = "#8c673d";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibujar P1
    if (gameRef.current.p1.alive) {
      ctx.fillStyle = gameRef.current.p1.color;
      ctx.fillRect(gameRef.current.p1.x - 10, gameRef.current.p1.y - 20, 20, 20);
    }

    // Dibujar P2
    if (gameRef.current.p2.alive) {
      ctx.fillStyle = gameRef.current.p2.color;
      ctx.fillRect(gameRef.current.p2.x - 10, gameRef.current.p2.y - 20, 20, 20);
    }

    // Dibujar proyectil
    const proj = gameRef.current.projectile;
    if (proj && proj.active) {
      ctx.fillStyle = proj.color;
      ctx.shadowBlur = 20;
      ctx.shadowColor = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  const fireProjectile = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const p = turn === 1 ? gameRef.current.p1 : gameRef.current.p2;
    
    // Convertir angulo y potencia a velocidad
    // El angulo es 0-180, para p2 hay que invertir
    const rad = (turn === 1 ? angle : 180 - angle) * (Math.PI / 180);
    const v = power * 0.8;
    const vx = Math.cos(rad) * v;
    const vy = -Math.sin(rad) * v; // Negativo porque Y crece hacia abajo en JS

    gameRef.current.projectile = {
      x: p.x,
      y: p.y - 20,
      vx,
      vy,
      active: true,
      color: p.color
    };

    let lastTime = performance.now();
    
    const update = (time: number) => {
      const proj = gameRef.current.projectile;
      if (!proj || !proj.active) return;
      
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      // Update physics (60 ticks per frame approx to not jump over walls)
      const gravity = 250; // pixels per sec^2
      
      proj.x += proj.vx * dt;
      proj.vy += gravity * dt;
      proj.y += proj.vy * dt;

      // Colisiones
      let hit = false;

      // Out of bounds
      if (proj.x < 0 || proj.x > gameRef.current.width || proj.y > gameRef.current.height) {
        proj.active = false;
        hit = true;
        setMessage("Vaya, el tiro se ha perdido.");
      } 
      // Terreno
      else if (proj.y >= gameRef.current.terrain[Math.floor(proj.x)]) {
         // Cráter en el terreno
         const ix = Math.floor(proj.x);
         for(let w = -20; w <= 20; w++){
           if(ix+w >=0 && ix+w < gameRef.current.width) {
             gameRef.current.terrain[ix+w] += Math.max(0, 20 - Math.abs(w)); 
           }
         }
         proj.active = false;
         hit = true;
         setMessage(`¡Impacto en tierra firme! (${Math.floor(proj.x)}, ${Math.floor(proj.y)})`);
      }
      
      // Hit Player 1
      if (proj.active && Math.abs(proj.x - gameRef.current.p1.x) < 15 && Math.abs(proj.y - (gameRef.current.p1.y - 10)) < 15) {
         gameRef.current.p1.alive = false;
         proj.active = false;
         hit = true;
         setMessage("¡TINTA AZUL (2) GANA!");
      }

      // Hit Player 2
      if (proj.active && Math.abs(proj.x - gameRef.current.p2.x) < 15 && Math.abs(proj.y - (gameRef.current.p2.y - 10)) < 15) {
         gameRef.current.p2.alive = false;
         proj.active = false;
         hit = true;
         setMessage("¡TINTA ROJA (1) GANA!");
      }

      drawFrame();

      if (!hit) {
        requestAnimationFrame(update);
      } else {
        setIsAnimating(false);
        if (gameRef.current.p1.alive && gameRef.current.p2.alive) {
           setTurn(turn === 1 ? 2 : 1);
        }
      }
    };
    
    requestAnimationFrame(update);
  };

  return (
    <div className="page-shell min-h-screen py-10 px-4 bg-[#f4ead5] font-serif">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
         <Link href="/social" className="mb-6 self-start inline-flex items-center gap-2 text-sm text-[#8c673d] hover:text-[#3e2b22] font-bold transition-colors">
          <ArrowLeft size={16} /> Volver a la Tavera
        </Link>
        <div className="text-center mb-6">
           <h1 className="text-4xl font-black text-[#3e2b22] tracking-tight flex justify-center items-center gap-3">
             <Rocket className="text-[#a64020]" size={32}/> Artillería <span className="text-[#a64020]">Clásica</span>
           </h1>
           {phase === "playing" && <p className="text-[#8a765f] italic mt-2 font-medium">{message}</p>}
        </div>

        {phase === "menu" && (
           <div className="bg-[#fcfaf4] p-10 flex flex-col gap-4 text-center mt-10 rounded-sm w-full max-w-md mx-auto border border-[#d6c4a5] shadow-[5px_8px_15px_rgba(100,70,40,0.15)] relative transform rotate-1">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#cc6640] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#a64020]" />
              <h2 className="text-2xl font-serif font-bold text-[#3e3024] mb-6 mt-2">Modalidad de Partida</h2>
              <button onClick={() => { setGameMode("hotseat"); setPhase("playing"); }} className="w-full bg-[#f4ead5] border border-[#d6c4a5] text-[#453628] font-bold font-serif py-4 justify-center hover:bg-[#8c4030] hover:text-[#fdfbf7] shadow-sm transition-colors">
                 Jugar en Persona (Local)
              </button>
              <div className="flex items-center gap-4 text-[#a6967c] my-2">
                 <div className="flex-1 border-t border-dashed border-[#d6c4a5]"></div>
                 <span className="text-xs uppercase font-mono tracking-widest">Conexión Postal</span>
                 <div className="flex-1 border-t border-dashed border-[#d6c4a5]"></div>
              </div>
              <button 
                onClick={() => setPhase("queue")} 
                className="w-full bg-[#8c4030] text-[#fdfbf7] font-bold font-serif py-4 justify-center hover:bg-[#453628] shadow-sm transition-colors"
               >
                 Enviar Telegrama de Reto
              </button>
           </div>
        )}

        {phase === "queue" && (
           <MatchmakingLobby 
              gameKey="artillery" 
              gameName="Artillería Neón" 
              onCancel={() => setPhase("menu")}
              onMatchFound={(id, role) => {
                 setMatchId(id);
                 setOnlineRole(role as any);
                 setGameMode("online");
                 setPhase("playing");
              }}
           />
        )}

        {phase === "playing" && (
        <div className="w-full flex flex-col items-center">
           <div className="bg-[#fcfaf4] p-4 shrink-0 w-[820px] h-[460px] mb-8 relative border-[12px] border-[#3e3024] shadow-[10px_15px_30px_rgba(60,40,30,0.3)]">
             <canvas
               ref={canvasRef}
               width={800}
               height={400}
               className="bg-[#fcfaf4] mx-auto opacity-90"
             />
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-20 pointer-events-none mix-blend-multiply" />
           {(!gameRef.current.p1.alive || !gameRef.current.p2.alive) && (
               <div className="absolute inset-0 bg-[#3e3024]/80 backdrop-blur-sm flex flex-col justify-center items-center">
                  <h2 className="text-5xl font-black text-[#e8dcc4] mb-6 tracking-widest">FIN DEL COMBATE</h2>
                  <button onClick={initGame} className="px-8 py-4 bg-[#8c4030] font-bold text-[#fdfbf7] border-2 border-[#d6c4a5] hover:bg-[#a64020] transition-colors shadow-lg">
                    DIBUJAR NUEVO TERRENO
                  </button>
               </div>
           )}
        </div>

        <div className="w-[820px] p-6 bg-[#fcfaf4] shadow-md border-y border-[#d6c4a5] flex justify-between items-center relative transform rotate-[0.5deg]">
           <div className={`p-4 flex-1 text-center font-bold font-serif transition-colors border-2 ${turn === 1 ? "bg-[#f4ead5] border-[#8c4030] text-[#8c4030]" : "border-transparent text-[#b5a38a]"}`}>
             <h3 className="mb-2">JUGADOR 1 (TINTA ROJA)</h3>
             {turn === 1 && !isAnimating && (
               <div className="text-[#3e3024] space-y-4 font-mono text-xs">
                 <div className="flex flex-col items-center">
                   <label className="block mb-1">ÁNGULO ({angle}°)</label>
                   <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full accent-[#8c4030]"/>
                 </div>
                 <div className="flex flex-col items-center">
                   <label className="block mb-1">PÓLVORA ({power})</label>
                   <input type="range" min="1" max="100" value={power} onChange={e => setPower(Number(e.target.value))} className="w-full accent-[#8c4030]"/>
                 </div>
                 <button onClick={fireProjectile} className="w-full bg-[#8c4030] text-[#fdfbf7] font-bold font-serif py-2 mt-2 hover:bg-[#a64020] transition-colors shadow-sm">DISPARAR</button>
               </div>
             )}
           </div>

           <div className="w-12 shrink-0 text-center text-[#8a765f] font-serif italic text-2xl px-2">VS</div>

           <div className={`p-4 flex-1 text-center font-bold font-serif transition-colors border-2 ${turn === 2 ? "bg-[#e8dcc4] border-[#2e404d] text-[#2e404d]" : "border-transparent text-[#b5a38a]"}`}>
             <h3 className="mb-2">JUGADOR 2 (TINTA AZUL)</h3>
             {turn === 2 && !isAnimating && (
               <div className="text-[#3e3024] space-y-4 font-mono text-xs">
                 <div className="flex flex-col items-center">
                   <label className="block mb-1">ÁNGULO ({angle}°)</label>
                   <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full accent-[#2e404d]"/>
                 </div>
                 <div className="flex flex-col items-center">
                   <label className="block mb-1">PÓLVORA ({power})</label>
                   <input type="range" min="1" max="100" value={power} onChange={e => setPower(Number(e.target.value))} className="w-full accent-[#2e404d]"/>
                 </div>
                 <button onClick={fireProjectile} className="w-full bg-[#2e404d] text-[#fdfbf7] font-bold font-serif py-2 mt-2 hover:bg-[#3c5a6b] transition-colors shadow-sm">DISPARAR</button>
               </div>
             )}
           </div>
        </div>
         </div>
        )}
      </div>
    </div>
  );
}
