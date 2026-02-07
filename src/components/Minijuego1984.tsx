"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usarContextoGlobal } from '@/context/ContextoGlobal';
import { Type, Printer, ShieldAlert, FileText, Zap, X } from 'lucide-react';

const ANCHO_JUEGO = 900;
const ALTO_JUEGO = 600;
const VELOCIDAD_JUGADOR = 8;
const VELOCIDAD_PROYECTIL = 15;
const VELOCIDAD_GUARDIA = 3;
const DAÑO_ARTICULO = 20;

// --- Tipos ---
type Proyectil = { id: number; x: number; y: number; vx: number };
type Guardia = { id: number; x: number; hp: number };
type Rayo = { id: number; x: number; duracion: number; advertencia: boolean };
type BaseData = { x: number; ancho: number; tipo: 'inicio' | 'escritura' | 'imprenta'; saludTecho: number };

// --- Componentes Visuales ---

function FondoGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,#00ff00_95%)] bg-[size:100%_40px] animate-[scan_2s_linear_infinite]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_95%,#00ff00_95%)] bg-[size:40px_100%]"></div>
    </div>
  );
}

function Jugador({ x, mirandoDerecha, tieneArticulo }: { x: number, mirandoDerecha: boolean, tieneArticulo: boolean }) {
  return (
    <div 
      className="absolute bottom-10 w-10 h-10 flex items-center justify-center z-20 transition-transform duration-75"
      style={{ left: x, transform: `translateX(-50%)` }}
    >
      <div className={`relative w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[24px] border-b-cyan-400 filter drop-shadow-[0_0_8px_#22d3ee] ${mirandoDerecha ? 'rotate-90' : '-rotate-90'}`}>
        {tieneArticulo && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
            <FileText size={16} className="text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>
    </div>
  );
}

function BaseView({ base }: { base: BaseData }) {
  const { x, ancho, tipo, saludTecho } = base;
  const tieneTecho = saludTecho > 0;

  return (
    <div 
      className={`absolute bottom-10 h-32 border-x-2 flex flex-col items-center justify-end pb-4 overflow-hidden z-10 transition-colors duration-300
        ${tipo === 'inicio' ? 'border-green-900/50 bg-green-900/10' : ''}
        ${tipo === 'escritura' ? 'border-yellow-900/50 bg-yellow-900/10' : ''}
        ${tipo === 'imprenta' ? 'border-purple-900/50 bg-purple-900/10' : ''}
      `}
      style={{ left: x, width: ancho, borderTopWidth: tieneTecho ? 2 : 0, borderTopColor: 'transparent' }}
    >
      {/* Techo Destructible */}
      {tieneTecho && (
        <div 
          className={`absolute top-0 left-0 w-full h-2 shadow-[0_0_15px] transition-all duration-300
            ${tipo === 'inicio' ? 'bg-green-500 shadow-green-500' : ''}
            ${tipo === 'escritura' ? 'bg-yellow-500 shadow-yellow-500' : ''}
            ${tipo === 'imprenta' ? 'bg-purple-500 shadow-purple-500' : ''}
          `}
          style={{ opacity: saludTecho / 100 }}
        ></div>
      )}
      
      {tipo === 'escritura' && (
        <>
          <Type size={40} className="mb-2 text-yellow-500 opacity-80" />
          <span className="text-[10px] font-mono text-yellow-500 mb-2">MESA DE REDACCIÓN</span>
          <span className="text-[9px] text-yellow-300/50 mt-1">MANTÉN ESPACIO</span>
        </>
      )}
      
      {tipo === 'imprenta' && (
        <>
          <Printer size={40} className="mb-2 text-purple-500 opacity-80" />
          <span className="text-[10px] font-mono text-purple-500">PUBLICAR</span>
          <span className="text-[9px] text-purple-300/50 mt-1">TRAE EL ARTÍCULO</span>
        </>
      )}

      {tipo === 'inicio' && (
        <div className="text-[10px] font-mono text-green-600">ZONA SEGURA</div>
      )}
    </div>
  );
}

function OjoBoss({ ira, vida }: { ira: number, vida: number }) {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
      <div className="w-[400px] h-6 bg-gray-900 border-2 border-gray-700 mb-4 relative overflow-hidden rounded-sm shadow-lg">
        <div 
          className="h-full bg-gradient-to-r from-red-900 to-red-600 transition-all duration-500"
          style={{ width: `${vida}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white tracking-widest">
          ESTABILIDAD DEL SISTEMA
        </div>
      </div>

      <div 
        className="w-32 h-32 rounded-full border-4 bg-black flex items-center justify-center relative shadow-[0_0_60px_rgba(220,38,38,0.4)] transition-all duration-300"
        style={{ 
          borderColor: ira > 50 ? '#ef4444' : '#7f1d1d',
          transform: `scale(${1 + ira/200})`
        }}
      >
        <div className="w-24 h-24 bg-red-600 rounded-full shadow-[0_0_40px_#dc2626] animate-pulse flex items-center justify-center overflow-hidden">
          <div className="w-10 h-10 bg-black rounded-full relative">
            <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full opacity-80 blur-[1px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RayoView({ rayo }: { rayo: Rayo }) {
  if (rayo.advertencia) {
    return (
      <div 
        className="absolute top-0 bottom-0 w-10 bg-red-500/20 animate-pulse z-10 border-x border-red-500/30 flex items-end justify-center pb-4"
        style={{ left: rayo.x - 20 }}
      >
        <Zap className="text-red-500 animate-bounce" />
      </div>
    );
  }
  return (
    <div 
      className="absolute top-0 bottom-0 w-16 bg-white animate-pulse z-40 shadow-[0_0_30px_white]"
      style={{ left: rayo.x - 32 }}
    >
      <div className="absolute inset-0 bg-red-500 mix-blend-overlay"></div>
    </div>
  );
}

function ProyectilView({ p }: { p: Proyectil }) {
  return (
    <div 
      className="absolute w-6 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] z-20"
      style={{ left: p.x, top: p.y }}
    ></div>
  );
}

function GuardiaView({ g }: { g: Guardia }) {
  return (
    <div 
      className="absolute bottom-10 w-12 h-16 bg-gray-900 border border-red-900 flex flex-col items-center justify-center z-20 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
      style={{ left: g.x, transform: 'translateX(-50%)' }}
    >
      <ShieldAlert className="text-red-600 mb-1" size={20} />
      <div className="w-8 h-1 bg-red-900">
        <div className="h-full bg-red-500" style={{ width: `${(g.hp / 3) * 100}%` }}></div>
      </div>
    </div>
  );
}

// --- Componente Principal ---

export default function Minijuego1984() {
  const { setEstado1984, setLogoCambiado1984 } = usarContextoGlobal();
  
  // Estados del Juego
  const [posicionJugador, setPosicionJugador] = useState(100);
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
  const [mensajeFlotante, setMensajeFlotante] = useState<{texto: string, color: string} | null>(null);

  // Bases (Estado mutable para techos)
  const [bases, setBases] = useState<BaseData[]>([
    { x: 50, ancho: 120, tipo: 'inicio', saludTecho: 100 },
    { x: 400, ancho: 140, tipo: 'escritura', saludTecho: 100 }, 
    { x: 750, ancho: 120, tipo: 'imprenta', saludTecho: 100 }
  ]);

  // Input Loop
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

  // Game Loop Principal (60 FPS)
  useEffect(() => {
    if (estadoJuego !== 'jugando') return;

    const loop = setInterval(() => {
      const ahora = Date.now();

      // --- 1. Movimiento Jugador ---
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

      // --- 2. Mecánica de Escritura ---
      const enEscritura = posicionJugador > bases[1].x && posicionJugador < bases[1].x + bases[1].ancho;
      if (enEscritura && teclasPulsadas.has(' ') && !tieneArticulo) {
        setProgresoEscritura(p => {
          const nuevo = Math.min(100, p + 2); // Más rápido
          if (nuevo >= 100 && p < 100) {
            setTieneArticulo(true);
            setMensajeFlotante({ texto: "¡ARTÍCULO LISTO!", color: "text-yellow-400" });
            setTimeout(() => setMensajeFlotante(null), 1500);
          }
          return nuevo;
        });
      } else if (!enEscritura && !tieneArticulo) {
        setProgresoEscritura(0);
      }

      // --- 3. Mecánica de Publicación ---
      const enImprenta = posicionJugador > bases[2].x && posicionJugador < bases[2].x + bases[2].ancho;
      if (enImprenta && tieneArticulo) {
        setTieneArticulo(false);
        setProgresoEscritura(0);
        setVidaBoss(v => Math.max(0, v - DAÑO_ARTICULO));
        setIraBoss(i => Math.min(100, i + 20));
        setMensajeFlotante({ texto: "¡VERDAD PUBLICADA!", color: "text-purple-400" });
        setTimeout(() => setMensajeFlotante(null), 1500);
      }

      // --- 4. Disparo a Guardias (Tecla Z) ---
      if (teclasPulsadas.has('z') && ahora - ultimoDisparo > 200) {
        setProyectiles(prev => [...prev, { 
          id: ahora, 
          x: posicionJugador, 
          y: ALTO_JUEGO - 50, 
          vx: mirandoDerecha ? VELOCIDAD_PROYECTIL : -VELOCIDAD_PROYECTIL
        }]);
        setUltimoDisparo(ahora);
      }

      // --- 5. Actualizar Proyectiles ---
      setProyectiles(prev => prev
        .map(p => ({ ...p, x: p.x + p.vx }))
        .filter(p => p.x > 0 && p.x < ANCHO_JUEGO)
      );

      // --- 6. Colisiones Proyectil -> Guardias ---
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

      // --- 7. Generar Guardias (Más frecuente) ---
      // Probabilidad base 2% + ira
      if (Math.random() < (0.02 + iraBoss/2000)) {
        const lado = Math.random() > 0.5 ? 'izq' : 'der';
        setGuardias(prev => [...prev, {
          id: Date.now() + Math.random(),
          x: lado === 'izq' ? -50 : ANCHO_JUEGO + 50,
          hp: 3
        }]);
      }

      // --- 8. Mover Guardias ---
      setGuardias(prev => prev.map(g => ({
        ...g,
        x: g.x + (g.x < posicionJugador ? VELOCIDAD_GUARDIA : -VELOCIDAD_GUARDIA)
      })));

      // --- 9. Generar Rayos (Ataque del Ojo) ---
      if (Math.random() < (0.01 + iraBoss/3000)) {
        const xObjetivo = Math.random() * (ANCHO_JUEGO - 100) + 50;
        setRayos(prev => [...prev, {
          id: Date.now() + Math.random(),
          x: xObjetivo,
          duracion: 100, // Ciclos de vida (advertencia + disparo)
          advertencia: true
        }]);
      }

      // --- 10. Actualizar Rayos y Daño ---
      setRayos(prev => {
        const nuevos = [];
        let basesActualizadas = [...bases];
        let jugadorMuerto = false;

        for (const r of prev) {
          const nuevaDuracion = r.duracion - 1;
          
          // Cambio de fase: Advertencia -> Disparo
          if (r.advertencia && nuevaDuracion < 40) {
            r.advertencia = false;
          }

          // Lógica de Daño (Solo en fase de disparo)
          if (!r.advertencia) {
            // Daño a Bases (Techos)
            basesActualizadas = basesActualizadas.map(b => {
              if (r.x > b.x && r.x < b.x + b.ancho) {
                return { ...b, saludTecho: Math.max(0, b.saludTecho - 2) };
              }
              return b;
            });

            // Daño al Jugador
            if (Math.abs(r.x - posicionJugador) < 30) {
              // Verificar si hay techo protegiendo
              const baseProtectora = basesActualizadas.find(b => 
                posicionJugador > b.x && posicionJugador < b.x + b.ancho && b.saludTecho > 0
              );
              if (!baseProtectora) {
                jugadorMuerto = true;
              }
            }
          }

          if (nuevaDuracion > 0) nuevos.push({ ...r, duracion: nuevaDuracion });
        }

        setBases(basesActualizadas);
        if (jugadorMuerto) setEstadoJuego('perdido');
        return nuevos;
      });

      // --- 11. Colisiones Jugador -> Guardias ---
      // Solo si NO está en la base inicial (Zona Segura absoluta)
      const enBaseInicio = posicionJugador > bases[0].x && posicionJugador < bases[0].x + bases[0].ancho;
      if (!enBaseInicio) {
        for (const g of guardias) {
          if (Math.abs(g.x - posicionJugador) < 25) {
            setEstadoJuego('perdido');
          }
        }
      }

      // --- 12. Victoria ---
      if (vidaBoss <= 0) {
        setEstadoJuego('ganado');
        setTimeout(() => {
          setEstado1984('recompensa');
          setLogoCambiado1984(true);
        }, 3000);
      }

    }, 16);

    return () => clearInterval(loop);
  }, [estadoJuego, teclasPulsadas, posicionJugador, tieneArticulo, ultimoDisparo, iraBoss, vidaBoss, guardias, mirandoDerecha, bases, rayos]);


  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center backdrop-blur-sm"
    >
      <div className="relative bg-black border-2 border-gray-800 shadow-2xl overflow-hidden" style={{ width: ANCHO_JUEGO, height: ALTO_JUEGO }}>
        <FondoGrid />
        
        {/* Botón de Salir (Accesibilidad) */}
        <button 
          onClick={() => setEstado1984('inactivo')}
          className="absolute top-4 right-4 z-50 p-2 bg-red-900/50 text-white rounded hover:bg-red-700 transition-colors"
          aria-label="Cerrar Minijuego"
        >
          <X size={24} />
        </button>
        
        {/* UI Controles */}
        <div className="absolute top-4 left-4 text-gray-500 font-mono text-[10px] z-40 bg-black/50 p-2 border border-gray-800 rounded">
          <p>MOVIMIENTO: <span className="text-white">FLECHAS / WASD</span></p>
          <p>ESCRIBIR: <span className="text-yellow-400">MANTENER ESPACIO</span> (EN MESA)</p>
          <p>DISPARAR: <span className="text-cyan-400">TECLA Z</span></p>
        </div>

        {/* Mensaje Flotante */}
        <AnimatePresence>
          {mensajeFlotante && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className={`absolute top-32 left-1/2 -translate-x-1/2 text-2xl font-black font-mono z-50 ${mensajeFlotante.color}`}
            >
              {mensajeFlotante.texto}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Elementos del Juego */}
        <OjoBoss ira={iraBoss} vida={vidaBoss} />
        
        {bases.map((b, i) => <BaseView key={i} base={b} />)}
        
        {estadoJuego === 'jugando' && <Jugador x={posicionJugador} mirandoDerecha={mirandoDerecha} tieneArticulo={tieneArticulo} />}
        
        {proyectiles.map(p => <ProyectilView key={p.id} p={p} />)}
        {guardias.map(g => <GuardiaView key={g.id} g={g} />)}
        {rayos.map(r => <RayoView key={r.id} rayo={r} />)}

        {/* Pantallas Finales */}
        {estadoJuego === 'perdido' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-50">
            <h2 className="text-6xl font-black font-mono text-black mb-4 tracking-tighter">ELIMINADO</h2>
            <p className="text-xl font-mono text-black mb-8">EL GRAN HERMANO SIEMPRE GANA.</p>
            <button onClick={() => {
              setPosicionJugador(100);
              setVidaBoss(100);
              setIraBoss(0);
              setProgresoEscritura(0);
              setTieneArticulo(false);
              setGuardias([]);
              setProyectiles([]);
              setRayos([]);
              setBases(prev => prev.map(b => ({ ...b, saludTecho: 100 })));
              setEstadoJuego('jugando');
            }} className="px-8 py-3 bg-black text-red-500 font-bold font-mono uppercase border border-red-900 hover:bg-gray-900 transition-all">
              Reintentar
            </button>
          </motion.div>
        )}

        {estadoJuego === 'ganado' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-cyan-900/90 flex flex-col items-center justify-center z-50">
            <h2 className="text-6xl font-black font-mono text-white mb-4 tracking-tighter">LIBERTAD</h2>
            <p className="text-xl font-mono text-cyan-200 mb-8">LA VERDAD ES REVOLUCIONARIA.</p>
            <div className="animate-pulse text-cyan-400 font-mono text-sm">ACCEDIENDO AL SISTEMA...</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
