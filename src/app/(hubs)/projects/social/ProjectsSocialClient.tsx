"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Gamepad2, Users, MessageSquare, Radio, ShieldAlert, Sparkles, Plus, Check, Play } from "lucide-react";

// Web Audio API Synthesizer for high-fidelity sci-fi sounds
const playBeep = (freq = 800, type = "sine", duration = 0.08, volume = 0.05) => {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type as any;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

// Simulated spaceship crew characters for offline play
const SIMULATED_CREW = [
  { id: "crew-1", name: "HAL-9000", status: "Orbitando", elo: 2400, replies: [
    "Hola, Rodrigo. He analizado tus estadísticas y considero que una partida sería muy instructiva.",
    "El juego táctico es mi especialidad. ¿Estás preparado?",
    "Me temo que no puedo dejar que ganes esta ronda sin esforzarte al máximo."
  ] },
  { id: "crew-2", name: "Major Tom", status: "En Criosueño", elo: 1450, replies: [
    "Ground Control a Rodrigo Alonso... Recibo tu señal. Las estrellas se ven increíbles desde aquí.",
    "Listo para pilotar en Chrono Dasher. Prepárate.",
    "Iniciando secuencia de lanzamiento. ¿Echamos una partida rápida?"
  ] },
  { id: "crew-3", name: "Spock", status: "Navegando", elo: 1890, replies: [
    "Tu invitación a jugar es completamente lógica, Rodrigo.",
    "Fascinante. La estrategia en estos juegos ejercita la mente de manera excelente.",
    "Larga vida y prosperidad. Acepto el desafío."
  ] },
  { id: "crew-4", name: "R2-D2", status: "Orbitando", elo: 1200, replies: [
    "¡Beep boop bleep! *ruidos alegres de droide*",
    "*Chirridos metálicos insistentes sugiriendo una partida*",
    "¡Bleep blop! Dispuesto a jugar ahora mismo."
  ] },
  { id: "crew-5", name: "Deckard", status: "En la Cantina", elo: 1600, replies: [
    "He visto cosas que vosotros no creeríais... naves de ataque en llamas más allá de Orión...",
    "Todos esos momentos se perderán en el tiempo... como lágrimas en la lluvia. Juguemos antes de que pase.",
    "¿Un juego de tablero? Bien. Vamos a ver de qué eres capaz."
  ] }
];

const AVAILABLE_GAMES = [
  { id: "chess", title: "Ajedrez Clásico", path: "/chess", desc: "Duelo de reyes ennogrecido por el tiempo.", category: "Tablero" },
  { id: "checkers", title: "Damas Estelares", path: "/games/checkers", desc: "Clásico táctico de saltos y capturas.", category: "Tablero" },
  { id: "battleship", title: "Batalla de Flotas", path: "/games/battleship", desc: "Ubica tu flota espacial y destruye al rival.", category: "Estrategia" },
  { id: "artillery", title: "Artillería", path: "/games/artillery", desc: "Cálculo de trayectorias en gravedades variables.", category: "Cálculo" },
  { id: "chrono", title: "Chrono Dasher 3D", path: "/chrono-dasher", desc: "Supervivencia de reflejos en el hiperespacio.", category: "Acción" },
  { id: "aetheria", title: "Aetheria Tactics", path: "/projects/aetheria", desc: "Combate estratégico de cartas sobre rejilla 4x4.", category: "Cartas" },
  { id: "sandbox", title: "Deep Space Sandbox", path: "/projects/sandbox", desc: "Explora la órbita en simulación de vuelo libre.", category: "Simulador" }
];

export default function ProjectsSocialClient({ currentUser, initialMessages, initialFriendships, isDbOffline }: any) {
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatTarget, setChatTarget] = useState<any>(null); // Null means global chat
  const [selectedGame, setSelectedGame] = useState(AVAILABLE_GAMES[0]);
  const [inviteTarget, setInviteTarget] = useState<any>(null);
  
  // Custom states for juicy interaction
  const [transmissionStatus, setTransmissionStatus] = useState<string | null>(null);
  const [transmissionProgress, setTransmissionProgress] = useState(0);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [radarZoom, setRadarZoom] = useState(1);
  const [radarHovered, setRadarHovered] = useState<any>(null);
  const [isSimulatedMode, setIsSimulatedMode] = useState(isDbOffline);
  const [newFriendName, setNewFriendName] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize friends and messages
  useEffect(() => {
    if (isSimulatedMode) {
      // Seed simulation friends
      setFriends(SIMULATED_CREW);
      setMessages([
        { id: "msg-init-1", senderId: "system", senderName: "Estación", content: "MÓDULO SOCIAL OFFLINE: Conexión local simulada.", timestamp: Date.now() - 600000 },
        { id: "msg-init-2", senderId: "crew-2", senderName: "Major Tom", content: "¡Hola! Estoy orbitando tu portfolio Rodrigo, listo para jugar si me envías un reto.", timestamp: Date.now() - 300000 }
      ]);
    } else {
      // Setup online friends
      const formattedFriends = initialFriendships.map((f: any) => {
        const isRequester = f.requesterId === currentUser.id;
        const otherUser = isRequester ? f.addressee : f.requester;
        return {
          id: otherUser.id,
          name: otherUser.username || `Usuario-${otherUser.id.substring(0, 5)}`,
          status: "Orbitando",
          elo: otherUser.elo || 1000
        };
      });
      setFriends(formattedFriends);
      setMessages(initialMessages.map((m: any) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        content: m.content,
        timestamp: m.timestamp
      })));
    }
  }, [isSimulatedMode, initialFriendships, initialMessages, currentUser.id]);

  // Handle auto-scroll in chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Online polling for global chat (only if online database available)
  useEffect(() => {
    if (isSimulatedMode) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/chess/lobby-messages");
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            content: m.content,
            timestamp: m.timestamp
          })));
        }
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [isSimulatedMode]);

  // Simulated replies from crew
  const triggerCrewReply = (crewId: string, crewName: string, text: string) => {
    const character = SIMULATED_CREW.find(c => c.id === crewId);
    if (!character) return;
    
    // Choose reply
    let replyText = character.replies[Math.floor(Math.random() * character.replies.length)];
    if (text.toLowerCase().includes("hola") || text.toLowerCase().includes("saludos")) {
      replyText = `Saludos, Rodrigo. Soy ${crewName}. ${character.replies[0]}`;
    }

    setTimeout(() => {
      playBeep(650, "sine", 0.15, 0.04);
      setMessages(prev => [...prev, {
        id: "crew-msg-" + Date.now(),
        senderId: crewId,
        senderName: crewName,
        content: replyText,
        timestamp: Date.now()
      }]);
    }, 1500 + Math.random() * 1000);
  };

  // Chat message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    playBeep(900, "triangle", 0.08, 0.06);
    const text = chatInput;
    const newMsg = {
      id: "user-msg-" + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: text,
      timestamp: Date.now(),
      targetId: chatTarget?.id || null
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput("");

    if (isSimulatedMode) {
      if (chatTarget) {
        triggerCrewReply(chatTarget.id, chatTarget.name, text);
      } else {
        // Broadcast response from random astronaut
        const randomCrew = SIMULATED_CREW[Math.floor(Math.random() * SIMULATED_CREW.length)];
        triggerCrewReply(randomCrew.id, randomCrew.name, text);
      }
    } else {
      // POST to database
      await fetch("/api/chess/lobby-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text })
      });
    }
  };

  // Add simulated or real friend
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    playBeep(850, "sine", 0.12, 0.05);

    if (isSimulatedMode) {
      const newCrew = {
        id: "crew-" + Date.now(),
        name: newFriendName,
        status: "En Órbita",
        elo: 1000 + Math.floor(Math.random() * 600),
        replies: [
          `Recibido alto y claro, Rodrigo. ¿Qué juego iniciamos?`,
          `Un placer unirme a tu tripulación estelar en el portfolio.`,
          `Listo para coordinar tácticas. Retame cuando quieras.`
        ]
      };
      setFriends(prev => [...prev, newCrew]);
      setNewFriendName("");
    } else {
      // Invite real friend via POST
      try {
        const res = await fetch("/api/chess/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: newFriendName })
        });
        if (res.ok) {
          alert("Solicitud enviada con éxito.");
          setNewFriendName("");
        } else {
          const err = await res.json();
          alert(err.error || "No se pudo añadir al usuario.");
        }
      } catch (e) {
        alert("Error de conexión al enviar invitación.");
      }
    }
  };

  // Dispatch Invitation sequence
  const handleDispatchInvite = () => {
    const target = inviteTarget || friends[0];
    if (!target) return;

    playBeep(1200, "square", 0.1, 0.05);
    setTransmissionStatus("Iniciando conexión láser de banda ancha...");
    setTransmissionProgress(10);

    const timer = setInterval(() => {
      setTransmissionProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          playBeep(1400, "sine", 0.25, 0.06);
          setTransmissionStatus("¡TELEMETRÍA ENVIADA! Esperando confirmación del receptor...");

          // Simulate acceptance
          setTimeout(() => {
            playBeep(950, "sine", 0.3, 0.07);
            setTransmissionStatus(null);
            setTransmissionProgress(0);
            
            setActiveNotification({
              title: "¡Invitación Aceptada!",
              message: `${target.name} ha aceptado tu invitación para jugar a ${selectedGame.title}. Las coordenadas de la cabina de juego están listas.`,
              actionLabel: "Iniciar Partida",
              path: selectedGame.path
            });
          }, 2500);

          return 100;
        }
        playBeep(600 + prev * 5, "triangle", 0.04, 0.02);
        return prev + 15;
      });
    }, 200);
  };

  // Interactive Radar Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    // Seed orbital offsets for planets so they orbit slowly
    const orbits = friends.map((f, i) => ({
      friend: f,
      radius: 40 + i * 25,
      speed: (0.002 + i * 0.0015) * (i % 2 === 0 ? 1 : -1),
      angle: (i * Math.PI * 2) / friends.length + Math.random(),
      size: 4 + (f.elo % 4)
    }));

    const render = () => {
      // Clear with dark alpha to leave trail
      ctx.fillStyle = "rgba(2, 2, 5, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw radar circular grid
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = 1;
      for (let r = 30; r < 150; r += 30) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r * radarZoom, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw radar axes
      ctx.beginPath();
      ctx.moveTo(centerX - 150, centerY);
      ctx.lineTo(centerX + 150, centerY);
      ctx.moveTo(centerX, centerY - 150);
      ctx.lineTo(centerX, centerY + 150);
      ctx.stroke();

      // Draw sonar sweep line
      sweepAngle += 0.015;
      const sweepX = centerX + Math.cos(sweepAngle) * 150;
      const sweepY = centerY + Math.sin(sweepAngle) * 150;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.3)";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      // Center Station indicator
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10 + Math.sin(sweepAngle * 4) * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Draw orbiting crew nodes
      orbits.forEach(o => {
        o.angle += o.speed;
        const planetX = centerX + Math.cos(o.angle) * o.radius * radarZoom;
        const planetY = centerY + Math.sin(o.angle) * o.radius * radarZoom;

        // Pulse effect
        const pulse = 1 + Math.sin(sweepAngle * 6 + o.radius) * 0.35;
        
        ctx.fillStyle = o.friend.status === "Orbitando" ? "#34d399" : "#fbbf24";
        ctx.beginPath();
        ctx.arc(planetX, planetY, o.size * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Orbit path line
        ctx.strokeStyle = "rgba(6, 182, 212, 0.03)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, o.radius * radarZoom, 0, Math.PI * 2);
        ctx.stroke();

        // Text indicator
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "8px monospace";
        ctx.fillText(o.friend.name, planetX + 8, planetY + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [friends, radarZoom]);

  // Handle canvas mouse move for interactive lock-on
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Detect closest friend planet
    let closestFriend: any = null;
    let minDistance = 20; // Maximum lock-on radius

    // Recalculate angles to coordinates
    friends.forEach((f, i) => {
      const radius = 40 + i * 25;
      // Approximate angle back from time (using simple offset estimation)
      const angle = (i * Math.PI * 2) / friends.length; 
      const px = centerX + Math.cos(angle) * radius * radarZoom;
      const py = centerY + Math.sin(angle) * radius * radarZoom;

      const dist = Math.hypot(mouseX - px, mouseY - py);
      if (dist < minDistance) {
        minDistance = dist;
        closestFriend = f;
      }
    });

    if (closestFriend !== radarHovered) {
      if (closestFriend) {
        playBeep(1100, "sine", 0.03, 0.02);
      }
      setRadarHovered(closestFriend);
    }
  };

  // Canvas click selects chat/invite target
  const handleCanvasClick = () => {
    if (radarHovered) {
      playBeep(950, "sine", 0.1, 0.05);
      setChatTarget(radarHovered);
      setInviteTarget(radarHovered);
    } else {
      setChatTarget(null);
    }
  };

  // Periodic random event simulation (Simulated crew sending invites)
  useEffect(() => {
    if (!isSimulatedMode) return;
    const timer = setInterval(() => {
      if (activeNotification || transmissionStatus) return;

      // 15% chance to trigger an invite alert every 15 seconds
      if (Math.random() < 0.15 && friends.length > 0) {
        const randomFriend = friends[Math.floor(Math.random() * friends.length)];
        const randomGame = AVAILABLE_GAMES[Math.floor(Math.random() * AVAILABLE_GAMES.length)];

        playBeep(450, "square", 0.4, 0.08);
        setActiveNotification({
          title: "TRANSMISIÓN ENTRANTE",
          message: `Alerta sonar: ${randomFriend.name} te envía un enlace táctico directo para jugar a ${randomGame.title}. ¿Entrar a cabina?`,
          actionLabel: "Sellar Enlace",
          path: randomGame.path,
          isIncoming: true
        });
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [isSimulatedMode, friends, activeNotification, transmissionStatus]);

  return (
    <div className="flex flex-col gap-4 h-full max-h-full">
      {/* DB Offline/Simulated Mode Warning Indicator */}
      {isDbOffline && (
        <div className="flex items-center gap-3 border border-amber-500/30 bg-amber-500/5 px-4 py-3 rounded-lg text-xs text-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.05)] shrink-0 select-none">
          <ShieldAlert size={16} className="text-amber-500 animate-pulse shrink-0" />
          <div className="flex-1">
            <span className="font-bold uppercase tracking-wider">Base de datos no disponible:</span> El sistema no ha podido establecer conexión con el servidor central de perfiles compartidos. Se ha activado el <strong>Modo Simulado local</strong>; la tripulación, retos y telecomunicaciones son recreados localmente por la estación.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
      
      {/* LEFT COLUMN: Orbital Radar and Friends */}
      <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
        
        {/* ORBITAL RADAR BLOCK */}
        <div className="border border-cyan-500/30 bg-black/60 rounded-xl p-5 flex flex-col items-center justify-between shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden shrink-0">
          <div className="absolute top-2 left-4 text-[10px] uppercase font-bold text-cyan-400/80 tracking-widest flex items-center gap-1.5">
            <Radio size={12} className="animate-pulse" /> Telemetría de Radar
          </div>

          <div className="mt-4 flex items-center justify-center relative bg-black/40 rounded-full border border-cyan-500/10 p-2">
            <canvas 
              ref={canvasRef} 
              width={260} 
              height={260} 
              onMouseMove={handleCanvasMouseMove}
              onClick={handleCanvasClick}
              className="rounded-full cursor-crosshair"
            />
            {radarHovered && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 border border-emerald-500/50 text-[10px] text-emerald-400 px-3 py-1.5 rounded font-mono shadow-lg text-center min-w-[140px]">
                <p className="font-bold">{radarHovered.name}</p>
                <p>Status: {radarHovered.status}</p>
                <p>ELO: {radarHovered.elo}</p>
              </div>
            )}
          </div>

          <div className="w-full flex items-center justify-between mt-3 text-[10px] text-cyan-500/60 uppercase">
            <span>Escala: {radarZoom}x</span>
            <div className="flex gap-2">
              <button 
                onClick={() => { playBeep(700); setRadarZoom(prev => Math.max(0.5, prev - 0.25)) }}
                className="px-2 py-0.5 border border-cyan-500/30 hover:border-cyan-400 hover:text-white"
              >
                -
              </button>
              <button 
                onClick={() => { playBeep(850); setRadarZoom(prev => Math.min(2.0, prev + 0.25)) }}
                className="px-2 py-0.5 border border-cyan-500/30 hover:border-cyan-400 hover:text-white"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* CREW DIRECTORY */}
        <div className="border border-cyan-500/20 bg-black/40 rounded-xl p-5 flex-1 flex flex-col min-h-0 relative">
          <div className="flex items-center justify-between mb-4 border-b border-cyan-500/10 pb-2.5">
            <h2 className="text-xs uppercase font-bold text-white tracking-widest flex items-center gap-2">
              <Users size={14} className="text-cyan-400" /> Crew & Amigos
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-500/40 uppercase">Modo:</span>
              <button
                onClick={() => {
                  playBeep(1000, "sine", 0.08, 0.04);
                  setIsSimulatedMode(!isSimulatedMode);
                }}
                className={`px-2 py-0.5 text-[9px] uppercase font-bold border rounded transition-colors ${
                  isSimulatedMode 
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400" 
                    : "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                }`}
              >
                {isSimulatedMode ? "Simulado" : "En línea"}
              </button>
            </div>
          </div>

          <form onSubmit={handleAddFriend} className="mb-4">
            <div className="flex gap-2 bg-black/60 p-1.5 rounded border border-cyan-500/30">
              <input 
                type="text" 
                placeholder={isSimulatedMode ? "Nombre de tripulante..." : "ID de usuario Supabase..."} 
                value={newFriendName}
                onChange={e => setNewFriendName(e.target.value)}
                className="flex-1 bg-transparent px-2 py-1 text-xs text-white outline-none placeholder-cyan-500/30 font-mono" 
              />
              <button type="submit" className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 px-3 py-1 rounded text-xs border border-cyan-500/30 transition-all">
                Añadir
              </button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {friends.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-cyan-500/40 py-6 border border-dashed border-cyan-500/10 rounded-lg">
                <ShieldAlert size={24} className="mb-2 opacity-50 text-cyan-500" />
                <p className="text-[11px] leading-relaxed">No hay tripulación registrada en el cuadrante.</p>
              </div>
            ) : (
              friends.map((f: any) => (
                <div 
                  key={f.id} 
                  onClick={() => {
                    playBeep(880, "sine", 0.05, 0.03);
                    setChatTarget(f);
                    setInviteTarget(f);
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    chatTarget?.id === f.id
                      ? "bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : "bg-black/30 border-cyan-500/10 hover:border-cyan-500/40 hover:bg-cyan-500/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center">
                        <Users size={12} className="text-cyan-400" />
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                        f.status === "Orbitando" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">{f.name}</span>
                      <span className="text-[9px] text-cyan-500/60 uppercase tracking-widest mt-0.5">{f.status}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {f.elo} ELO
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MIDDLE COLUMN: Holographic Chat Room */}
      <div className="lg:col-span-5 flex flex-col min-h-0 border border-cyan-500/20 bg-black/40 rounded-xl p-5 shadow-[inset_0_0_40px_rgba(6,182,212,0.05)] relative">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-cyan-400 animate-pulse" />
            <h2 className="text-xs uppercase font-bold text-white tracking-widest">
              {chatTarget ? `Canal Privado: ${chatTarget.name}` : "Canal de Frecuencia Pública"}
            </h2>
          </div>
          {chatTarget && (
            <button 
              onClick={() => { playBeep(700); setChatTarget(null); }}
              className="text-[9px] uppercase tracking-widest text-cyan-500/50 hover:text-cyan-300 hover:border-cyan-500/30 border border-cyan-500/10 px-2 py-0.5 rounded"
            >
              Salir del Canal
            </button>
          )}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-cyan-500/20">
          {messages
            .filter(m => !chatTarget ? !m.targetId : m.senderId === chatTarget.id || (m.senderId === currentUser.id && m.targetId === chatTarget.id))
            .map((m: any) => {
              const isMe = m.senderId === currentUser.id;
              const isSystem = m.senderId === "system";

              if (isSystem) {
                return (
                  <div key={m.id} className="text-center py-1.5 px-3 border border-cyan-500/10 bg-cyan-500/5 rounded text-[10px] text-cyan-400 tracking-wider">
                    {m.content}
                  </div>
                );
              }

              return (
                <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className={`text-[9px] uppercase tracking-wider mb-1 ${isMe ? "text-cyan-400" : "text-cyan-500/60"}`}>
                    {isMe ? "Transmisor Rodrigo" : m.senderName}
                  </span>
                  <div className={`p-3 rounded-lg text-xs leading-relaxed max-w-[85%] break-words border relative
                    ${isMe 
                      ? "bg-cyan-500/10 text-cyan-100 border-cyan-500/30 rounded-tr-none shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                      : "bg-black/40 text-cyan-300 border-cyan-500/15 rounded-tl-none"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSendMessage} className="shrink-0">
          <div className="flex items-center gap-2 bg-black/60 p-2 rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder={chatTarget ? `Mensaje directo a ${chatTarget.name}...` : "Escribe tu reporte a la tripulación..."}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-cyan-200 outline-none placeholder-cyan-500/30 font-mono"
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()}
              className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 px-4 py-2 rounded border border-cyan-500/30 transition-all disabled:opacity-30 flex items-center justify-center"
            >
              <Send size={12} />
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Game Dispatch and Active Invites */}
      <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
        
        {/* GAME DISPATCHER */}
        <div className="border border-cyan-500/20 bg-black/40 rounded-xl p-5 flex-1 flex flex-col min-h-0 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
          <h2 className="text-xs uppercase font-bold text-white tracking-widest flex items-center gap-2 border-b border-cyan-500/10 pb-2.5 mb-4 shrink-0">
            <Gamepad2 size={14} className="text-cyan-400" /> Estante de Juegos
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
            {AVAILABLE_GAMES.map((g) => (
              <div 
                key={g.id} 
                onClick={() => {
                  playBeep(1000, "sine", 0.05, 0.03);
                  setSelectedGame(g);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer relative group ${
                  selectedGame.id === g.id
                    ? "bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "bg-black/30 border-cyan-500/10 hover:border-cyan-500/40 hover:bg-cyan-500/5"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{g.title}</span>
                  <span className="text-[8px] uppercase tracking-wider text-cyan-400/60 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    {g.category}
                  </span>
                </div>
                <p className="text-[10px] text-cyan-500/60 leading-relaxed font-sans">{g.desc}</p>
              </div>
            ))}
          </div>

          {/* Invitation sender deck */}
          <div className="border-t border-cyan-500/10 pt-4 shrink-0">
            <div className="text-[10px] text-cyan-500/60 uppercase mb-2">
              Destinatario: <span className="text-white font-bold">{inviteTarget ? inviteTarget.name : "Selecciona un amigo..."}</span>
            </div>
            
            {transmissionStatus ? (
              <div className="space-y-2">
                <div className="w-full bg-cyan-950/50 rounded-full h-1.5 overflow-hidden border border-cyan-500/20">
                  <div className="bg-cyan-400 h-full transition-all duration-200" style={{ width: `${transmissionProgress}%` }} />
                </div>
                <p className="text-[9px] text-cyan-400/80 animate-pulse font-mono leading-tight">{transmissionStatus}</p>
              </div>
            ) : (
              <button 
                onClick={handleDispatchInvite}
                disabled={!inviteTarget && friends.length === 0}
                className="w-full bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/40 text-white py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Radio size={14} className="animate-pulse" /> Transmitir Reto
              </button>
            )}
          </div>
        </div>

        {/* ACTIVE HUD NOTIFICATIONS / GAME ENTRANCES */}
        {activeNotification && (
          <div className="border border-emerald-500/50 bg-[#020d08]/90 rounded-xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles size={12} /> {activeNotification.title}
              </span>
              <button 
                onClick={() => { playBeep(500); setActiveNotification(null); }}
                className="text-[9px] text-cyan-500/40 hover:text-white uppercase"
              >
                Ignorar
              </button>
            </div>
            <p className="text-[11px] text-emerald-300/80 leading-relaxed mb-4 font-mono">
              {activeNotification.message}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  playBeep(1200, "sine", 0.3, 0.08);
                  router.push(activeNotification.path);
                }}
                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-white text-xs uppercase font-bold py-2 rounded transition-all flex items-center justify-center gap-1.5"
              >
                <Play size={10} /> {activeNotification.actionLabel}
              </button>
              {activeNotification.isIncoming && (
                <button
                  onClick={() => { playBeep(500); setActiveNotification(null); }}
                  className="px-3 border border-red-500/30 hover:border-red-500/60 text-red-400 text-xs py-2 rounded"
                >
                  Declinar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
    </div>
  );
}
