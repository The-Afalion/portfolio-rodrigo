"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextoGlobal } from '@/context/ContextoGlobal';
import { Eye, BookOpen, AlertOctagon } from 'lucide-react';

const ANCHO_JUEGO = 900;
const ALTO_JUEGO = 600;
const VELOCIDAD_JUGADOR = 6;
const VELOCIDAD_PROYECTIL = 12;
const VELOCIDAD_GUARDIA = 2.5;
const DAÑO_ARTICULO = 20;

// --- Tipos ---
type Proyectil = { id: number; x: number; y: number; vx: number };
type Guardia = { id: number; x: number; hp: number };
type Rayo = { id: number; x: number; duracion: number; advertencia: boolean };
type BaseData = { x: number; ancho: number; tipo: 'prole' | 'diario' | 'ministerio'; saludTecho: number };

// --- Componentes Visuales ---

function FondoGrid({ ira }: { ira: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none transition-colors duration-1000" style={{ backgroundColor: `rgba(${10 + ira}, 10, 10, 0.9)` }}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
      <div className="absolute top-0 bottom-0 left-0 w-full bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-50 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-red-900/5 mix-blend-color-burn"></div>
    </div>
  );
}

function Winston({ x, mirandoDerecha, tieneArticulo }: { x: number, mirandoDerecha: boolean, tieneArticulo: boolean }) {
  return (
    <motion.div 
      className="absolute bottom-10 w-10 h-16 flex flex-col items-center justify-end z-20"
      style={{ left: x, translateX: '-50%' }}
      animate={{ scaleX: mirandoDerecha ? 1 : -1 }}
      transition={{ duration: 0.1 }}
    >
      <div className="w-4 h-4 bg-gray-300 rounded-full mb-1 border border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"></div>
      <div className="w-8 h-10 bg-gray-500 border border-black relative">
        <div className="absolute inset-x-0 h-1 bg-gray-800 top-2"></div>
      </div>
      <div className="flex gap-1 mt-0">
        <div className="w-3 h-5 bg-gray-700 border border-black"></div>
        <div className="w-3 h-5 bg-gray-700 border border-black"></div>
      </div>
      {tieneArticulo && (
        <motion.div 
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-md"
        >
          <BookOpen size={20} className="text-white fill-[#222]" />
        </motion.div>
      )}
    </motion.div>
  );
}

function EdificioView({ base }: { base: BaseData }) {
  const { x, ancho, tipo, saludTecho } = base;
  const tieneTecho = saludTecho > 0;

  return (
    <div 
      className={`absolute bottom-10 h-40 border-x-4 flex flex-col items-center justify-end pb-4 overflow-hidden z-10 transition-colors duration-300
        ${tipo === 'prole' ? 'border-[#333] bg-[#111]' : ''}
        ${tipo === 'diario' ? 'border-[#444] bg-[#1a1a1a]' : ''}
        ${tipo === 'ministerio' ? 'border-[#8b0000] bg-[#2a0000]' : ''}
      `}
      style={{ 
         left: x, 
         width: ancho, 
         borderTopWidth: tieneTecho ? 6 : 0, 
         borderTopColor: tieneTecho ? (tipo === 'ministerio' ? '#8b0000' : '#444') : 'transparent' 
      }}
    >
      {/* Viga de Techo Destructible */}
      {tieneTecho && (
        <div 
          className="absolute top-0 left-0 w-full h-2 bg-black opacity-50 transition-all duration-300"
          style={{ width: `${saludTecho}%` }}
        ></div>
      )}
      
      {tipo === 'diario' && (
        <>
          <span className="text-[10px] font-mono font-bold text-gray-400 mb-2 whitespace-nowrap">SECTOR PROLE</span>
          <span className="text-[9px] text-gray-500 mt-1">SANTUARIO</span>
        </>
      )}
      
      {tipo === 'ministerio' && (
        <>
          <span className="text-[10px] font-black font-serif text-[#ff4444] mb-2 tracking-widest text-center px-2">MINISTERIO DE LA VERDAD</span>
          <span className="text-[9px] text-[#ff4444]/50 mt-1">ZONA DE REBELIÓN</span>
        </>
      )}

      {tipo === 'prole' && (
        <div className="text-[10px] font-mono font-bold text-gray-600">ZONA SEGURA</div>
      )}
      
      {/* Estética de bloque de cemento */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] mix-blend-overlay pointer-events-none"></div>
    </div>
  );
}

function PantallaBoss({ ira, vida }: { ira: number, vida: number }) {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
      <div className="w-[400px] h-6 bg-[#111] border-2 border-[#333] mb-6 relative overflow-hidden flex items-center">
        <motion.div 
          className="h-full bg-[#ff3333] relative"
          animate={{ width: `${vida}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] mix-blend-overlay"></div>
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono text-white tracking-[0.3em] font-bold shadow-[0_0_10px_black] mix-blend-difference pointer-events-none z-10 w-full">
          PODER DEL PARTIDO
        </div>
      </div>

      <motion.div 
        className="relative flex items-center justify-center filter drop-shadow-[0_10px_30px_rgba(255,51,51,0.5)]"
        animate={{ scale: 1 + ira/150 }}
      >
         <Eye size={120} className="text-[#ff3333] opacity-90 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" strokeWidth={1.5} />
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-black rounded-full border-2 border-[#ff3333]"></div>
         </div>
      </motion.div>
    </div>
  );
}

function RayoView({ rayo }: { rayo: Rayo }) {
  if (rayo.advertencia) {
    return (
      <div 
        className="absolute top-0 bottom-0 w-8 bg-[#ff3333]/10 animate-pulse z-10 border-x border-[#ff3333]/30 flex items-end justify-center pb-4"
        style={{ left: rayo.x - 16 }}
      >
        <span className="text-[10px] font-mono text-[#ff4444] tracking-widest rotate-90 block mb-10">ATENCIÓN</span>
      </div>
    );
  }
  return (
    <div 
      className="absolute top-0 bottom-0 w-16 z-40 bg-white"
      style={{ left: rayo.x - 32 }}
    >
      <div className="absolute inset-0 bg-[#ff3333] mix-blend-multiply opacity-90 animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
    </div>
  );
}

function ProyectilView({ p }: { p: Proyectil }) {
  return (
    <div 
      className="absolute flex items-center justify-center z-20"
      style={{ left: p.x, top: p.y }}
    >
      <BookOpen size={20} className={`text-white fill-[#111] font-black ${p.vx > 0 ? 'animate-[spin_0.2s_linear_infinite]' : 'animate-[spin_0.2s_linear_infinite_reverse]'}`} />
    </div>
  );
}

function PoliciaView({ g }: { g: Guardia }) {
  return (
    <div 
      className="absolute bottom-10 w-12 h-16 bg-[#111] border border-[#333] flex flex-col items-center justify-center z-20 shadow-lg"
      style={{ left: g.x, transform: 'translateX(-50%)' }}
    >
      <AlertOctagon className="text-gray-400 mb-1" size={20} />
      <div className="w-8 h-1 bg-[#222]">
        <div className="h-full bg-[#ff3333]" style={{ width: `${(g.hp / 4) * 100}%` }}></div>
      </div>
    </div>
  );
}

// --- Componente Principal ---

export default function Minijuego1984() {
  const { setEstado1984, setLogoCambiado1984, setBigBrotherWon } = useContextoGlobal();
  
  // Estados del Juego
  const [posicionJugador, setPosicionJugador] = useState(80);
  const [mirandoDerecha, setMirandoDerecha] = useState(true);
  const [estadoJuego, setEstadoJuego] = useState<'jugando' | 'ganado' | 'perdido'>('jugando');
  const [teclasPulsadas, setTeclasPulsadas] = useState<Set<string>>(new Set());
  
  // Mecánicas
  const [progresoEscritura, setProgresoEscritura] = useState(0);
  const [tieneArticulo, setTieneArticulo] = useState(false);
  const [proyectiles, setProyectiles] = useState<Proyectil[]>([]);
  const [guardias, setGuardias] = useState<Guardia[]>([]);
  const [rayos, setRayos] = useState<Rayo[]>([]);
  const [iraBoss, setIraBoss] = useState(0);
  const [vidaBoss, setVidaBoss] = useState(100);
  const [ultimoDisparo, setUltimoDisparo] = useState(0);
  const [mensajeFlotante, setMensajeFlotante] = useState<{texto: string, color: string, id: number} | null>(null);
  const [efectoBatalla, setEfectoBatalla] = useState(false);

  // Bases -> Edificios
  const bases: BaseData[] = [
    { x: 30, ancho: 120, tipo: 'prole', saludTecho: 100 },
    { x: 320, ancho: 120, tipo: 'diario', saludTecho: 100 }, 
    { x: 670, ancho: 180, tipo: 'ministerio', saludTecho: 100 }
  ];
  const [techos, setTechos] = useState([100, 100, 100]); // Salud de techos sincronizada por índice

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setTeclasPulsadas(prev => new Set(prev).add(e.key.toLowerCase()));
    const handleKeyUp = (e: KeyboardEvent) => setTeclasPulsadas(prev => {
      const next = new Set(prev);
      next.delete(e.key.toLowerCase());
      return next;
    });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const triggerImpacto = () => {
    setEfectoBatalla(true);
    setTimeout(() => setEfectoBatalla(false), 200);
  };

  useEffect(() => {
    if (estadoJuego !== 'jugando') return;

    const loop = setInterval(() => {
      const ahora = Date.now();

      // --- 1. Movimiento ---
      setPosicionJugador(prev => {
        let nueva = prev;
        if (teclasPulsadas.has('arrowleft') || teclasPulsadas.has('a')) {
          nueva -= VELOCIDAD_JUGADOR;
          setMirandoDerecha(false);
        }
        if (teclasPulsadas.has('arrowright') || teclasPulsadas.has('d')) {
          nueva += VELOCIDAD_JUGADOR;
          setMirandoDerecha(true);
        }
        return Math.max(20, Math.min(nueva, ANCHO_JUEGO - 20));
      });

      // --- 2. Crimen de Pensamiento (Cargar Diarios) ---
      const enDiario = posicionJugador > bases[1].x && posicionJugador < bases[1].x + bases[1].ancho;
      if (enDiario && teclasPulsadas.has(' ') && !tieneArticulo) {
        setProgresoEscritura(p => {
          const nuevo = Math.min(100, p + 1.5);
          if (nuevo >= 100 && p < 100) {
            setTieneArticulo(true);
            setMensajeFlotante({ texto: "PENSAMIENTO FORMADO", color: "text-white", id: ahora });
          }
          return nuevo;
        });
      } else if (!enDiario && !tieneArticulo) {
        setProgresoEscritura(0);
      }

      // --- 3. Publicación ---
      const enMinisterio = posicionJugador > bases[2].x && posicionJugador < bases[2].x + bases[2].ancho;
      if (enMinisterio && tieneArticulo) {
        setTieneArticulo(false);
        setProgresoEscritura(0);
        triggerImpacto();
        setVidaBoss(v => Math.max(0, v - DAÑO_ARTICULO));
        setIraBoss(i => Math.min(100, i + 30));
        setMensajeFlotante({ texto: "REBELIÓN PUBLICADA", color: "text-[#ff3333]", id: ahora });
      }

      // --- 4. Disparo de Herejías ---
      if (teclasPulsadas.has('z') && ahora - ultimoDisparo > 250) {
        setProyectiles(prev => [...prev, { 
          id: ahora, 
          x: posicionJugador, 
          y: ALTO_JUEGO - 65, 
          vx: mirandoDerecha ? VELOCIDAD_PROYECTIL : -VELOCIDAD_PROYECTIL
        }]);
        setUltimoDisparo(ahora);
      }

      // --- 5 & 6. Proyectiles y Policía ---
      setProyectiles(prev => prev
        .map(p => ({ ...p, x: p.x + p.vx }))
        .filter(p => p.x > 0 && p.x < ANCHO_JUEGO)
      );

      setProyectiles(prev => {
        const activos = [];
        let guardiasActualizados = [...guardias];
        
        for (const p of prev) {
          let impacto = false;
          guardiasActualizados = guardiasActualizados.map(g => {
            if (!impacto && Math.abs(g.x - p.x) < 30) {
              impacto = true;
              return { ...g, hp: g.hp - 1 };
            }
            return g;
          }).filter(g => g.hp > 0);

          if (!impacto) activos.push(p);
        }
        
        setGuardias(guardiasActualizados);
        return activos;
      });

      // --- 7. Generar Policía del Pensamiento ---
      if (Math.random() < (0.015 + iraBoss/1500)) {
        const lado = Math.random() > 0.5 ? 'izq' : 'der';
        setGuardias(prev => [...prev, {
          id: Date.now() + Math.random(),
          x: lado === 'izq' ? -50 : ANCHO_JUEGO + 50,
          hp: 4 // Más resistentes
        }]);
      }

      setGuardias(prev => prev.map(g => ({
        ...g,
        x: g.x + (g.x < posicionJugador ? VELOCIDAD_GUARDIA : -VELOCIDAD_GUARDIA)
      })));

      // --- 9. Generar Miradas (Ataque) ---
      // IMPORTANTE: Nunca generar rayos en la zona de inicio (Base 0: 30 a 150 px)
      if (Math.random() < (0.01 + iraBoss/2000)) {
        let xObjetivo = Math.random() * (ANCHO_JUEGO - 100) + 50;
        
        // Evitar generar en la zona segura (Prole)
        if (xObjetivo < bases[0].x + bases[0].ancho + 20) {
          xObjetivo = Math.random() * (ANCHO_JUEGO - 200) + 200;
        }

        setRayos(prev => [...prev, {
          id: Date.now() + Math.random(),
          x: xObjetivo,
          duracion: 80, 
          advertencia: true
        }]);
      }

      setRayos(prev => {
        const nuevos = [];
        let techosActualizados = [...techos];
        let jugadorMuerto = false;

        for (const r of prev) {
          const nuevaDuracion = r.duracion - 1;
          
          if (r.advertencia && nuevaDuracion < 35) {
            r.advertencia = false;
          }

          if (!r.advertencia) {
            // Daño a los techos
            bases.forEach((b, index) => {
               if (r.x > b.x && r.x < b.x + b.ancho) {
                  techosActualizados[index] = Math.max(0, techosActualizados[index] - 4);
               }
            });

            if (Math.abs(r.x - posicionJugador) < 25) {
              const indiceBase = bases.findIndex(b => posicionJugador > b.x && posicionJugador < b.x + b.ancho);
              const protegidoPorTecho = indiceBase !== -1 && techosActualizados[indiceBase] > 0;
              
              if (!protegidoPorTecho) {
                jugadorMuerto = true;
              }
            }
          }

          if (nuevaDuracion > 0) nuevos.push({ ...r, duracion: nuevaDuracion });
        }

        setTechos(techosActualizados);
        
        // --- Condición de Pérdida ---
        if (jugadorMuerto) {
           setEstadoJuego('perdido');
           setBigBrotherWon(true);
        }
        return nuevos;
      });

      // --- Colisiones con Guardias ---
      const enBaseInicio = posicionJugador > bases[0].x && posicionJugador < bases[0].x + bases[0].ancho;
      if (!enBaseInicio) {
        for (const g of guardias) {
          if (Math.abs(g.x - posicionJugador) < 28) {
            setEstadoJuego('perdido');
            setBigBrotherWon(true);
          }
        }
      }

      if (vidaBoss <= 0) {
        setEstadoJuego('ganado');
        setTimeout(() => {
          setEstado1984('recompensa');
          setLogoCambiado1984(true);
        }, 3000);
      }

    }, 16);

    return () => clearInterval(loop);
  }, [estadoJuego, teclasPulsadas, posicionJugador, tieneArticulo, ultimoDisparo, iraBoss, vidaBoss, guardias, mirandoDerecha, techos, rayos, setEstado1984, setLogoCambiado1984, setBigBrotherWon, bases]);

  const handleReintentar = () => {
    setPosicionJugador(80);
    setMirandoDerecha(true);
    setIraBoss(0);
    setVidaBoss(100);
    setProgresoEscritura(0);
    setTieneArticulo(false);
    setProyectiles([]);
    setGuardias([]);
    setRayos([]);
    setTechos([100, 100, 100]);
    // Nota: Aunque reintente, el BigBrotherWon flag ya marcó al sistema
    setEstadoJuego('jugando');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 bg-[#050505]/98 z-[200] flex flex-col items-center justify-center backdrop-blur-xl py-10"
    >
       <div className="flex w-full max-w-[900px] justify-between items-center mb-4 px-4 bg-[#111] border border-[#333] p-4 text-white">
          <p className="font-mono text-sm tracking-widest text-gray-400">EXPEDIENTE W-84</p>
          <button 
            onClick={() => setEstado1984('inactivo')}
            className="px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors font-bold font-sans uppercase text-sm"
          >
            Abandonar Sesión
          </button>
       </div>

      <motion.div 
        animate={efectoBatalla ? { x: [-10, 10, -5, 5, 0], y: [-5, 5, -2, 2, 0] } : {}}
        transition={{ duration: 0.2 }}
        className="relative bg-[#020202] border-4 border-[#1a1a1a] shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden" 
        style={{ width: ANCHO_JUEGO, height: ALTO_JUEGO, filter: 'sepia(0.6) contrast(1.5) grayscale(0.8)' }}
      >
        <FondoGrid ira={iraBoss} />
        
        <div className="absolute top-4 left-4 text-white/50 font-mono text-[10px] z-40 bg-black/80 p-3 border border-white/10 font-bold tracking-widest shadow-[0_0_10px_black]">
          <p className="mb-1 text-gray-400">DIRECCIONES: <span className="text-white">FLECHAS / WASD</span></p>
          <p className="mb-1">PENSAMIENTO: <span className="text-white">MANTENER ESPACIO</span></p>
          <p>DIFUSIÓN: <span className="text-white">TECLA Z</span></p>
        </div>

        {/* Barra de escritura flotante */}
        {progresoEscritura > 0 && !tieneArticulo && (
          <div className="absolute z-50 bg-[#111] border border-gray-600 h-2 w-32" style={{ left: posicionJugador - 64, bottom: 90 }}>
             <div className="h-full bg-white" style={{ width: `${progresoEscritura}%` }}></div>
          </div>
        )}

        <AnimatePresence>
          {mensajeFlotante && (
            <motion.div 
              key={mensajeFlotante.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`absolute top-40 left-1/2 -translate-x-1/2 text-2xl font-black font-sans tracking-tight z-50 bg-[#111]/90 px-6 py-3 border-2 border-current shadow-lg ${mensajeFlotante.color}`}
            >
              {mensajeFlotante.texto}
            </motion.div>
          )}
        </AnimatePresence>

        <PantallaBoss ira={iraBoss} vida={vidaBoss} />
        
        {bases.map((b, i) => <EdificioView key={i} base={{ ...b, saludTecho: techos[i] }} />)}
        
        {estadoJuego === 'jugando' && <Winston x={posicionJugador} mirandoDerecha={mirandoDerecha} tieneArticulo={tieneArticulo} />}
        
        {proyectiles.map(p => <ProyectilView key={p.id} p={p} />)}
        {guardias.map(g => <PoliciaView key={g.id} g={g} />)}
        {rayos.map(r => <RayoView key={r.id} rayo={r} />)}

        {estadoJuego === 'perdido' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-10 text-center backdrop-blur-sm">
            <h2 className="text-7xl font-black font-sans text-white mb-4 tracking-tighter uppercase drop-shadow-[0_0_10px_black]">VIGILANDO</h2>
            <p className="text-xl font-mono text-[#ff3333] mb-8 tracking-widest uppercase relative z-10 bg-black p-4 border border-[#ff3333]">El Pensamiento no muere tan rápido.</p>
            <p className="max-w-md text-xs font-mono text-gray-400 mb-10 leading-loose uppercase z-10">
              Has sido atrapado, pero el sistema aún registra insubordinación.
            </p>
            <div className="flex gap-4">
              <button onClick={() => {
                setEstado1984('inactivo');
              }} className="px-8 py-3 bg-[#111] text-gray-400 font-bold font-sans uppercase hover:bg-gray-200 hover:text-black transition-all text-sm border-2 border-gray-600">
                Aceptar Destino
              </button>
              <button onClick={handleReintentar} className="px-8 py-3 bg-white text-black font-black font-sans uppercase tracking-widest hover:bg-[#ff3333] hover:text-white hover:border-[#ff3333] transition-all text-sm border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                Reintentar
              </button>
            </div>
          </motion.div>
        )}

        {estadoJuego === 'ganado' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-white flex flex-col items-center justify-center z-50 border-[20px] border-black">
            <h2 className="text-7xl font-black font-serif text-black mb-4 tracking-tighter uppercase">ANOMALÍA</h2>
            <p className="text-xl font-serif text-gray-800 mb-8 tracking-widest uppercase font-bold">Ruptura del sistema. Pensamiento libre detectado.</p>
            <div className="animate-pulse text-gray-500 font-mono text-xs uppercase tracking-[0.3em] font-bold">REDIRECCIONANDO DATOS AL NUEVO ORDEN...</div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
