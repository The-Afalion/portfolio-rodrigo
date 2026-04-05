"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";

interface Player {
  x: number;
  y: number;
  color: string;
  alive: boolean;
}

export default function ArtilleryGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [turn, setTurn] = useState<1 | 2>(1); // Player 1 (Cyan) or 2 (Pink)
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState("Apunta y dispara. ¡Destruye la base enemiga!");

  // Refs de estado del juego sin forzar re-renders constantes en React
  const gameRef = useRef({
    terrain: [] as number[],
    p1: { x: 100, y: 0, color: "#0ff", alive: true } as Player,
    p2: { x: 700, y: 0, color: "#f0f", alive: true } as Player,
    projectile: null as { x: number, y: number, vx: number, vy: number, active: boolean, color: string } | null,
    width: 800,
    height: 400
  });

  // Inicializar terreno P1 y P2
  useEffect(() => {
    initGame();
  }, []);

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
    gameRef.current.p1 = { x: p1x, y: t[p1x], color: "#0ff", alive: true };
    gameRef.current.p2 = { x: p2x, y: t[p2x], color: "#f0f", alive: true };
    gameRef.current.projectile = null;
    gameRef.current.width = W;
    gameRef.current.height = H;
    
    setTurn(1);
    setMessage("Partida Iniciada. Turno del Jugador 1 (Cyan)");
    drawFrame();
  };

  const drawFrame = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    
    const w = gameRef.current.width;
    const h = gameRef.current.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Dibujar cielo oscuro
    ctx.fillStyle = "#010103";
    ctx.fillRect(0, 0, w, h);

    // Dibujar terreno (wireframe/neon)
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x < w; x++) {
      ctx.lineTo(x, gameRef.current.terrain[x]);
    }
    ctx.lineTo(w, h);
    ctx.fillStyle = "rgba(10, 10, 30, 0.8)";
    ctx.fill();
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibujar P1
    if (gameRef.current.p1.alive) {
      ctx.fillStyle = gameRef.current.p1.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = gameRef.current.p1.color;
      ctx.fillRect(gameRef.current.p1.x - 10, gameRef.current.p1.y - 20, 20, 20);
      ctx.shadowBlur = 0;
    }

    // Dibujar P2
    if (gameRef.current.p2.alive) {
      ctx.fillStyle = gameRef.current.p2.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = gameRef.current.p2.color;
      ctx.fillRect(gameRef.current.p2.x - 10, gameRef.current.p2.y - 20, 20, 20);
      ctx.shadowBlur = 0;
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
         setMessage("¡JUGADOR 2 (MAGENTA) GANA!");
      }

      // Hit Player 2
      if (proj.active && Math.abs(proj.x - gameRef.current.p2.x) < 15 && Math.abs(proj.y - (gameRef.current.p2.y - 10)) < 15) {
         gameRef.current.p2.alive = false;
         proj.active = false;
         hit = true;
         setMessage("¡JUGADOR 1 (CYAN) GANA!");
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
    <div className="page-shell min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <Link href="/social" className="mb-6 self-start inline-flex items-center gap-2 text-sm text-neon-purple hover:text-white transition-colors">
          <ArrowLeft size={16} /> Volver al Hub
        </Link>
        <div className="text-center mb-6">
           <h1 className="text-4xl font-bold text-white tracking-tight flex justify-center items-center gap-3">
             <Rocket className="text-neon-purple" size={32}/> Artillería <span className="text-neon-purple">Neón</span>
           </h1>
           <p className="text-white/60 mt-2">{message}</p>
        </div>

        <div className="surface-panel p-4 rounded-3xl shrink-0 w-[800px] h-[440px] mb-8 relative border-neon-purple overflow-hidden">
           <canvas
             ref={canvasRef}
             width={800}
             height={400}
             className="bg-black rounded-2xl mx-auto shadow-inner"
           />
           {(!gameRef.current.p1.alive || !gameRef.current.p2.alive) && (
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-center items-center rounded-3xl">
                  <h2 className="text-5xl font-bold text-white mb-6">GAME OVER</h2>
                  <button onClick={initGame} className="px-8 py-4 rounded-full bg-neon-purple font-bold text-black border border-white hover:bg-white transition-colors">
                    REINICIAR PARTIDA
                  </button>
               </div>
           )}
        </div>

        <div className="surface-panel w-full p-6 rounded-[2rem] flex justify-between items-center bg-black/50">
           <div className={`p-4 rounded-xl flex-1 text-center transition-opacity ${turn === 1 ? "bg-neon-cyan/20 border border-neon-cyan shadow-[0_0_15px_rgba(0,255,255,0.2)] opacity-100" : "opacity-30 border border-white/10"}`}>
             <h3 className="font-bold text-neon-cyan mb-2">JUGADOR 1</h3>
             {turn === 1 && !isAnimating && (
               <div className="text-white space-y-4">
                 <div>
                   <label className="text-xs text-white/50 block mb-1">ÁNGULO (0-90)</label>
                   <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full accent-neon-cyan"/>
                   <span className="text-sm font-mono">{angle}°</span>
                 </div>
                 <div>
                   <label className="text-xs text-white/50 block mb-1">POTENCIA (1-100)</label>
                   <input type="range" min="1" max="100" value={power} onChange={e => setPower(Number(e.target.value))} className="w-full accent-neon-cyan"/>
                   <span className="text-sm font-mono">{power}</span>
                 </div>
                 <button onClick={fireProjectile} className="w-full bg-neon-cyan text-black font-bold py-2 rounded-lg mt-2 hover:bg-white transition-colors">DISPARAR</button>
               </div>
             )}
           </div>

           <div className="w-8 shrink-0 text-center text-white/20 font-bold text-2xl">VS</div>

           <div className={`p-4 rounded-xl flex-1 text-center transition-opacity ${turn === 2 ? "bg-neon-pink/20 border border-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.2)] opacity-100" : "opacity-30 border border-white/10"}`}>
             <h3 className="font-bold text-neon-pink mb-2">JUGADOR 2</h3>
             {turn === 2 && !isAnimating && (
               <div className="text-white space-y-4">
                 <div>
                   <label className="text-xs text-white/50 block mb-1">ÁNGULO (0-90)</label>
                   <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full accent-neon-pink"/>
                   <span className="text-sm font-mono">{angle}°</span>
                 </div>
                 <div>
                   <label className="text-xs text-white/50 block mb-1">POTENCIA (1-100)</label>
                   <input type="range" min="1" max="100" value={power} onChange={e => setPower(Number(e.target.value))} className="w-full accent-neon-pink"/>
                   <span className="text-sm font-mono">{power}</span>
                 </div>
                 <button onClick={fireProjectile} className="w-full bg-neon-pink text-black font-bold py-2 rounded-lg mt-2 hover:bg-white transition-colors">DISPARAR</button>
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
