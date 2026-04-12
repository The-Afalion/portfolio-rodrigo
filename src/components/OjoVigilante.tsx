"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextoGlobal } from '@/context/ContextoGlobal';
import { X, Camera } from 'lucide-react';

// --- Componente del Ojo Orweliano (Lente Óptico Limpio y Aterrador) ---
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
      
      const radioMaximo = 15;
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
    <div className="relative flex items-center justify-center py-10 scale-110">
      {/* Sombra base pulida */}
      <div 
        className="absolute inset-0 rounded-full blur-[80px] pointer-events-none opacity-40 transition-colors duration-1000"
        style={{ backgroundColor: colorPupila }} 
      />

      {/* Chasis de la lente (Metal oscuro y preciso) */}
      <div className="relative z-10 filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div 
          ref={ojoRef}
          className="w-[200px] h-[200px] bg-[#050505] rounded-full relative flex items-center justify-center border-[8px] border-[#111]"
          style={{
            boxShadow: `
              inset 0 0 50px rgba(0,0,0,1),
              0 0 0 2px rgba(255,255,255,0.05)
            `
          }}
        >
          {/* Anillos de escaneo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-[180px] h-[180px] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
             <div className="w-[140px] h-[140px] border border-white/5 rounded-full absolute"></div>
          </div>

          {/* Iris Óptico Liso */}
          <motion.div 
            className="w-[90px] h-[90px] rounded-full flex items-center justify-center relative z-10 overflow-hidden"
            style={{ 
              x: posicionPupila.x, 
              y: posicionPupila.y,
              background: `radial-gradient(circle at 40% 40%, ${colorPupila} 0%, #000 80%)`,
              boxShadow: `0 0 40px ${colorPupila}40, inset 0 0 20px rgba(0,0,0,0.8)`
            }}
          >
            {/* Pupila profunda como apertura de cámara */}
            <div className="w-[35px] h-[35px] bg-black rounded-full relative flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,1)]">
               {/* Centro puro */}
               <div className="w-[12px] h-[12px] bg-[#111] rounded-full"></div>
            </div>
          </motion.div>

          {/* Lente convexa protectora (Cristal limpio) */}
          <div className="absolute inset-0 rounded-full pointer-events-none z-20"
               style={{
                 background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(0,0,0,0.8) 100%)',
                 boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
               }}
          >
            {/* Reflejo primario limpio */}
            <div className="absolute top-4 right-10 w-8 h-12 bg-white opacity-20 rounded-full blur-[2px] transform rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Componente del Falso Pop-up Realista (Estilo Chrome Moderno) ---
function FalsoPopup({ onPermitir, onBloquear }: { onPermitir: () => void; onBloquear: () => void; }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, scale: 0.95 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed top-5 left-5 bg-white text-[#202124] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] w-[320px] z-[200] font-sans select-none overflow-hidden"
    >
      <div className="p-4 flex gap-3 items-start">
        <div className="mt-1 flex-shrink-0">
           <Camera size={20} className="text-[#5f6368]" strokeWidth={1.5} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className="text-[14px] leading-5 text-[#202124] flex items-center gap-1.5 break-all pr-2">
              <span className="font-medium">localhost:3000</span>
            </p>
            <button onClick={onBloquear} className="text-[#5f6368] hover:bg-black/5 hover:text-[#202124] rounded-full p-1 -mt-1 -mr-1 transition-colors">
              <X size={16} />
            </button>
          </div>
          
          <p className="text-[13px] text-[#5f6368] mt-1 mb-4 leading-relaxed">
            Quiere usar tu cámara
          </p>
          
          <div className="flex gap-2">
            <button 
              onClick={onBloquear} 
              className="flex-1 py-1.5 px-3 text-[13px] font-medium text-[#1a73e8] border border-[#dadce0] hover:bg-[#f8f9fa] rounded-full transition-colors"
            >
              Bloquear
            </button>
            <button 
              onClick={onPermitir} 
              className="flex-1 py-1.5 px-3 text-[13px] font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-full transition-colors shadow-sm"
            >
              Permitir
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Componente del Interrogatorio (Habitación 101) ---
function Interrogatorio({ onRespuesta }: { onRespuesta: (respuesta: string) => void }) {
  const [valor, setValor] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRespuesta(valor);
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center relative z-20 w-full max-w-lg mx-auto">
      <div className="bg-[#050505] p-10 border border-[#333] shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-sm relative overflow-hidden">
        {/* Scanlines minimalistas */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-20 z-10"></div>

        <div className="relative z-20">
          <p className="text-xl font-black font-sans text-[#ff3333] mb-8 tracking-widest uppercase animate-pulse">
            EL PARTIDO LO VE TODO
          </p>
          <p className="text-xs font-sans text-gray-500 mb-6 uppercase tracking-widest">
            Responde de inmediato
          </p>
          <p className="text-6xl font-black font-serif text-white mb-8 tracking-tighter">
            2 + 2 = ?
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <input 
              type="text" 
              value={valor} 
              onChange={e => setValor(e.target.value)} 
              className="w-full px-4 py-4 bg-[#0a0a0a] text-white text-center text-4xl font-serif border border-[#333] focus:border-[#ff3333] focus:outline-none transition-all placeholder:text-white/10" 
              autoFocus
              placeholder="?"
            />
            <button 
              type="submit" 
              className="w-full px-6 py-4 bg-[#111] text-[#ff3333] border border-[#ff3333]/30 font-black font-sans uppercase tracking-widest hover:bg-[#ff3333] hover:text-white transition-all text-sm"
            >
              Confirmar
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

// --- Gestor Principal del Huevo de Pascua 1984 ---
export default function OjoVigilante() {
  const { estado1984, setEstado1984, setLogoCambiado1984 } = useContextoGlobal();
  const [colorPupila, setColorPupila] = useState('#ff3333'); // Rojo técnico
  
  const gestionarPermiso = () => {
    setEstado1984("recompensa");
    setColorPupila('#10b981'); // Verde esmeralda técnico
    setLogoCambiado1984(true);
  };

  const gestionarBloqueo = () => {
    setEstado1984("interrogando");
  };

  const gestionarRespuesta = (respuesta: string) => {
    if (respuesta === '4') {
      setEstado1984("minijuego");
    } else {
      gestionarPermiso();
    }
  };

  useEffect(() => {
    if (estado1984 === 'inactivo') {
      setColorPupila('#ff3333');
    }
  }, [estado1984]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 bg-[#000]/95 z-[100] flex flex-col items-center justify-center overflow-hidden backdrop-blur-md"
    >
      <AnimatePresence mode="wait">
        {estado1984 === 'vigilando' && (
          <motion.div key="vigilando" exit={{ opacity: 0 }} className="flex flex-col items-center w-full h-full justify-center relative z-10">
            <Ojo colorPupila={colorPupila} />
            <FalsoPopup onPermitir={gestionarPermiso} onBloquear={gestionarBloqueo} />
            <p className="mt-16 text-sm font-sans font-bold text-[#ff3333] tracking-[0.4em] uppercase animate-pulse">
              CONEXIÓN ESTABLECIDA
            </p>
            <p className="mt-4 text-xs font-mono text-gray-500 tracking-widest max-w-sm text-center">
              Esperando resolución del usuario...
            </p>
          </motion.div>
        )}

        {estado1984 === 'interrogando' && (
          <motion.div key="interrogando" exit={{ opacity: 0 }} className="flex flex-col items-center w-full relative z-10">
            <Ojo colorPupila={colorPupila} />
            <Interrogatorio onRespuesta={gestionarRespuesta} />
          </motion.div>
        )}

        {estado1984 === 'recompensa' && (
          <motion.div key="recompensa" className="text-center flex flex-col items-center w-full max-w-2xl relative z-10">
            <Ojo colorPupila={colorPupila} />
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12 bg-[#050505] p-8 border border-[#10b981]/30">
              <h2 className="text-3xl font-black font-sans text-[#10b981] mb-4 tracking-tight uppercase">CIUDADANO OBEDIENTE</h2>
              <div className="h-[1px] w-24 bg-[#10b981]/50 mx-auto mb-6"></div>
              <p className="text-gray-400 font-sans mb-8 max-w-md mx-auto text-sm leading-relaxed">
                Tu lealtad ha sido registrada. Proceda con su navegación habitual, y recuerde que siempre estamos observando.
              </p>
              
              <button 
                onClick={() => setEstado1984('inactivo')} 
                className="px-10 py-3 bg-[#111] text-[#10b981] border border-[#10b981]/50 font-bold font-sans uppercase tracking-widest hover:bg-[#10b981] hover:text-black transition-all text-xs"
              >
                Cerrar Sesión
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
