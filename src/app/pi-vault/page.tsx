"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Unlock, RefreshCw, Binary } from 'lucide-react';
import { generateOffsetFromKey, encryptData, decryptData, textToBytes, bytesToText, bytesToHex } from '@/lib/pi-engine';

export default function PiVaultPage() {
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');
  const [output, setOutput] = useState('');
  const [isHex, setIsHex] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [matrixEffect, setMatrixEffect] = useState<string[]>([]);

  // Efecto visual de fondo
  useEffect(() => {
    const interval = setInterval(() => {
      const chars = '0123456789ABCDEFπ';
      const line = Array(50).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join(' ');
      setMatrixEffect(prev => [line, ...prev.slice(0, 20)]);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleProcess = async (mode: 'encrypt' | 'decrypt') => {
    if (!key) {
      alert("Se requiere una Clave Maestra (Semilla) para localizar la posición en Pi.");
      return;
    }
    
    setProcessing(true);
    
    // Simular tiempo de cálculo para efecto dramático
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const offset = await generateOffsetFromKey(key);
      
      let resultBytes: Uint8Array;
      
      if (mode === 'encrypt') {
        const dataBytes = textToBytes(input);
        resultBytes = encryptData(dataBytes, offset);
        setOutput(bytesToHex(resultBytes));
        setIsHex(true);
      } else {
        // Para desencriptar, asumimos que el input es Hex
        const hexString = input.replace(/\s/g, '');
        const bytes = new Uint8Array(hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
        resultBytes = decryptData(bytes, offset);
        setOutput(bytesToText(resultBytes));
        setIsHex(false);
      }
    } catch (e) {
      setOutput("ERROR: Datos corruptos o clave incorrecta.");
    }
    
    setProcessing(false);
  };

  return (
    <main className="min-h-screen bg-black text-cyan-500 font-mono p-6 relative overflow-hidden selection:bg-cyan-900 selection:text-white">
      
      {/* Fondo Matrix */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none flex flex-col text-xs leading-none overflow-hidden">
        {matrixEffect.map((line, i) => (
          <div key={i} className="whitespace-nowrap">{line}</div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12 border-b border-cyan-900/50 pb-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-400 transition-colors text-sm mb-2">
              <ArrowLeft size={16} /> SYSTEM_EXIT
            </Link>
            <h1 className="text-4xl font-bold tracking-tighter text-white flex items-center gap-3">
              <span className="text-6xl">π</span>-VAULT
            </h1>
            <p className="text-cyan-800 text-xs mt-1">Transcendental Stream Cipher v3.14</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs text-cyan-700">SECURE CONNECTION</p>
            <p className="text-xs text-cyan-700">BBP ALGORITHM: ACTIVE</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Panel Izquierdo: Controles */}
          <div className="space-y-6">
            <div className="bg-cyan-950/10 border border-cyan-900/50 p-6 rounded-lg backdrop-blur-sm">
              <label className="block text-xs font-bold mb-2 text-cyan-300">1. SEMILLA (CLAVE MAESTRA)</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Introduce tu secreto..."
                  className="w-full bg-black border border-cyan-800 rounded p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors pl-10"
                />
                <Lock size={16} className="absolute left-3 top-3.5 text-cyan-700" />
              </div>
              <p className="text-[10px] text-cyan-800 mt-2">
                Esta clave determina el punto de inicio en la secuencia infinita de decimales de Pi.
              </p>
            </div>

            <div className="bg-cyan-950/10 border border-cyan-900/50 p-6 rounded-lg backdrop-blur-sm">
              <label className="block text-xs font-bold mb-2 text-cyan-300">2. DATOS DE ENTRADA</label>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe texto plano para encriptar o pega código Hex para desencriptar..."
                className="w-full h-40 bg-black border border-cyan-800 rounded p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors resize-none text-sm"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => handleProcess('encrypt')}
                disabled={processing}
                className="flex-1 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 py-3 rounded hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50"
              >
                {processing ? <RefreshCw className="animate-spin" /> : <Lock size={18} />}
                ENCRIPTAR
              </button>
              <button 
                onClick={() => handleProcess('decrypt')}
                disabled={processing}
                className="flex-1 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 py-3 rounded hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50"
              >
                {processing ? <RefreshCw className="animate-spin" /> : <Unlock size={18} />}
                DESENCRIPTAR
              </button>
            </div>
          </div>

          {/* Panel Derecho: Resultado */}
          <div className="bg-black border border-cyan-900 rounded-lg p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Binary size={16} className="text-cyan-500" /> SALIDA DEL SISTEMA
              </h3>
              <span className="text-[10px] px-2 py-1 bg-cyan-900/30 rounded text-cyan-300">
                {isHex ? 'HEXADECIMAL' : 'TEXTO PLANO'}
              </span>
            </div>
            
            <div className="flex-grow bg-cyan-950/5 rounded border border-cyan-900/30 p-4 overflow-auto font-mono text-xs break-all text-cyan-100 shadow-inner min-h-[300px]">
              {output || <span className="text-cyan-900 animate-pulse">Esperando flujo de datos...</span>}
            </div>

            <div className="mt-4 flex justify-between text-[10px] text-cyan-800">
              <span>STREAM_OFFSET: {key ? 'CALCULATED' : 'UNKNOWN'}</span>
              <span>INTEGRITY: OK</span>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
