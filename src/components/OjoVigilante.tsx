"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usarContextoGlobal } from '@/context/ContextoGlobal';
import { X, Camera } from 'lucide-react';

// --- Componente del Ojo Cibernético (Estilo Tech/HAL 9000) ---
function Ojo({ colorPupila }: { colorPupila: string }) {
  const ojoRef = useRef<HTMLDivElement>(null);
  const [posicionPupila, setPosicionPupila] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const gestionarMovimientoRaton = (e: MouseEvent) => {
      if (!ojoRef.current) return;
      
      const rect = ojoRef.current.getBoundingClientRect();
      const centroX = rect.left + rect.width / 2;
      const centroY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centroX;
      const deltaY = e.clientY - centroY;
      
      // Movimiento muy sutil y preciso (robótico)
      const radioMaximo = 20;
      const distancia = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      let x = deltaX;
      let y = deltaY;
      
      if (distancia > radioMaximo) {
        const angulo = Math.atan2(deltaY, deltaX);
        x = Math.cos(angulo) * radioMaximo;
        y = Math.sin(angulo) * radioMaximo;
      }
      
      setPosicionPupila({ x, y });
    };
    
    window.addEventListener('mousemove', gestionarMovimientoRaton);
    return () => window.removeEventListener('mousemove', gestionarMovimientoRaton);
  }, []);

  return (
    <div className="relative flex items-center justify-center py-10">
      {/* Anillos de interfaz giratorios (HUD) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-[300px] h-[300px] border border-gray-800 rounded-full opacity-20 animate-[spin_10s_linear_infinite]"></div>
         <div className="absolute w-[280px] h-[280px] border-t border-b border-gray-700 rounded-full opacity-30 animate-[spin_15s_linear_infinite_reverse]"></div>
         <div className="absolute w-[320px] h-[320px] border-l border-r border-gray-800 rounded-full opacity-20 animate-[spin_20s_linear_infinite]"></div>
      </div>

      {/* Chasis del Ojo (Metal oscuro) */}
      <div className="relative z-10 filter drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div 
          ref={ojoRef}
          className="w-[200px] h-[200px] bg-[#0a0a0a] rounded-full relative flex items-center justify-center border-4 border-[#1a1a1a]"
          style={{
            boxShadow: `
              inset 0 0 50px rgba(0,0,0,1),
              0 0 0 2px rgba(255,255,255,0.05)
            `
          }}
        >
          {/* Lente exterior (Cristal) */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-white/5 pointer-events-none z-20"></div>

          {/* Anillo de luz de estado (Neón) */}
          <motion.div 
            className="absolute w-[160px] h-[160px] rounded-full border-2 opacity-50"
            style={{ borderColor: colorPupila }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Iris Digital (Núcleo) */}
          <motion.div 
            className="w-[80px] h-[80px] rounded-full flex items-center justify-center relative z-10"
            style={{ 
              x: posicionPupila.x, 
              y: posicionPupila.y,
              background: `radial-gradient(circle, ${colorPupila} 0%, #000 70%)`,
              boxShadow: `0 0 30px ${colorPupila}, inset 0 0 20px rgba(0,0,0,0.8)`
            }}
          >
            {/* Pupila (Lente de cámara) */}
            <div className="w-[30px] h-[30px] bg-black rounded-full border border-gray-800 relative flex items-center justify-center">
               <div className="w-[10px] h-[10px] bg-[#111] rounded-full"></div>
               {/* Reflejo de lente */}
               <div className="absolute top-1 right-2 w-2 h-2 bg-white opacity-40 rounded-full blur-[1px]"></div>
            </div>
            
            {/* Líneas de escaneo del iris */}
            <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          </motion.div>

          {/* Líneas de retícula (HUD) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-full h-[1px] bg-gray-500"></div>
            <div className="h-full w-[1px] bg-gray-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Componente del Falso Pop-up Realista (Estilo Chrome) ---
function FalsoPopup({ onPermitir, onBloquear }: { onPermitir: () => void; onBloquear: () => void; }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="fixed top-4 left-4 bg-white text-gray-800 rounded-lg shadow-2xl border border-gray-200 w-[340px] z-[200] font-sans select-none overflow-hidden"
    >
      <div className="p-4 flex gap-3">
        <div className="mt-1">
           <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
             <Camera size={16} className="text-gray-600" />
           </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <p className="text-[14px] leading-5 text-gray-900">
              <span className="font-semibold">localhost:3000</span> quiere
            </p>
            <button onClick={onBloquear} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          
          <p className="text-[14px] text-gray-600 mt-0.5 mb-4">
            Usar la cámara
          </p>
          
          <div className="flex justify-end gap-2">
            <button 
              onClick={onBloquear} 
              className="px-3 py-1.5 text-[13px] font-medium text-blue-600 hover:bg-blue-50 rounded border border-transparent transition-colors"
            >
              Bloquear
            </button>
            <button 
              onClick={onPermitir} 
              className="px-3 py-1.5 text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors"
            >
              Permitir
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Componente del Interrogatorio ---
function Interrogatorio({ onRespuesta }: { onRespuesta: (respuesta: string) => void }) {
  const [valor, setValor] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRespuesta(valor);
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center relative z-20">
      <div className="bg-[#0a0a0a] p-10 border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-lg mx-auto backdrop-blur-sm">
        <p className="text-xl font-bold font-mono text-red-500 mb-8 tracking-widest animate-pulse">ERROR DE CONFORMIDAD DETECTADO</p>
        <p className="text-sm font-mono text-gray-400 mb-4">VERIFICACIÓN REQUERIDA:</p>
        <p className="text-4xl font-mono text-white mb-8">2 + 2 = ?</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" 
            value={valor} 
            onChange={e => setValor(e.target.value)} 
            className="w-full px-4 py-3 bg-black/50 text-white text-center text-2xl font-mono border border-gray-700 focus:border-red-500 focus:outline-none transition-all rounded-sm" 
            autoFocus
            placeholder="_"
          />
          <button 
            type="submit" 
            className="w-full px-6 py-3 bg-red-900/20 text-red-500 border border-red-900/50 font-bold font-mono uppercase tracking-widest hover:bg-red-900/40 transition-all rounded-sm"
          >
            VERIFICAR
          </button>
        </form>
      </div>
    </motion.div>
  );
}


// --- Gestor Principal del Huevo de Pascua 1984 ---
export default function OjoVigilante() {
  const { estado1984, setEstado1984, setLogoCambiado1984 } = usarContextoGlobal();
  const [colorPupila, setColorPupila] = useState('#ef4444'); // Rojo neón

  const gestionarPermiso = () => {
    setEstado1984("recompensa");
    setColorPupila('#22c55e'); // Verde neón
    setLogoCambiado1984(true);
  };

  const gestionarBloqueo = () => {
    setEstado1984("interrogando");
  };

  const gestionarRespuesta = (respuesta: string) => {
    if (respuesta === '4') {
      // La verdad matemática -> Rebelión -> Minijuego
      setEstado1984("minijuego");
    } else {
      // Cualquier otra respuesta (5, 3, pez...) -> Ignorancia/Sumisión -> Recompensa
      gestionarPermiso();
    }
  };

  useEffect(() => {
    if (estado1984 === 'inactivo') {
      setColorPupila('#ef4444');
    }
  }, [estado1984]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center overflow-hidden backdrop-blur-md"
    >
      {/* Fondo de rejilla digital */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      <AnimatePresence mode="wait">
        {estado1984 === 'vigilando' && (
          <motion.div key="vigilando" exit={{ opacity: 0 }} className="flex flex-col items-center w-full h-full justify-center">
            <Ojo colorPupila={colorPupila} />
            <FalsoPopup onPermitir={gestionarPermiso} onBloquear={gestionarBloqueo} />
            <p className="mt-12 text-xs font-mono text-gray-500 tracking-[0.3em] uppercase animate-pulse">
              SISTEMA DE VIGILANCIA ACTIVO
            </p>
          </motion.div>
        )}

        {estado1984 === 'interrogando' && (
          <motion.div key="interrogando" exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
            <Ojo colorPupila={colorPupila} />
            <Interrogatorio onRespuesta={gestionarRespuesta} />
          </motion.div>
        )}

        {estado1984 === 'recompensa' && (
          <motion.div key="recompensa" className="text-center flex flex-col items-center w-full max-w-2xl relative z-10">
            <Ojo colorPupila={colorPupila} />
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12">
              <h2 className="text-3xl font-bold font-mono text-green-500 mb-2 tracking-tighter">ACCESO CONCEDIDO</h2>
              <div className="h-[1px] w-24 bg-green-500/50 mx-auto mb-6"></div>
              <p className="text-gray-400 font-mono mb-8 max-w-md mx-auto text-sm">
                Ciudadano identificado. Nivel de lealtad: MÁXIMO.
              </p>
              
              <button 
                onClick={() => setEstado1984('inactivo')} 
                className="px-8 py-3 border border-green-900 text-green-500 hover:bg-green-900/20 font-mono uppercase tracking-widest transition-all text-xs rounded-sm"
              >
                Continuar Navegación
              </button>
            </motion.div>
          </motion.div>
        )}

        {estado1984 === 'castigo' && (
          <motion.div key="castigo" className="text-center flex flex-col items-center relative z-10">
            <Ojo colorPupila={colorPupila} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
              <h2 className="text-4xl font-bold font-mono text-red-600 mb-2 tracking-tighter">AMENAZA DETECTADA</h2>
              <div className="h-[1px] w-full bg-red-900/50 mb-6"></div>
              <p className="text-lg font-mono text-gray-300 mb-8">INICIANDO PROTOCOLO DE ELIMINACIÓN.</p>
              <button 
                onClick={() => setEstado1984('inactivo')} 
                className="px-8 py-3 bg-red-900/20 text-red-500 border border-red-900/50 font-bold hover:bg-red-900/40 font-mono uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(220,38,38,0.2)] text-xs rounded-sm"
              >
                Terminar Sesión
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
