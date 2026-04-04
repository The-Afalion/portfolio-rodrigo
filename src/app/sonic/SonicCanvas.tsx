"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Trash2, Pencil } from 'lucide-react';

// --- TIPOS ---
type Waveform = 'sine' | 'square' | 'triangle' | 'sawtooth';

type Note = { 
  x: number; 
  y: number;
  color: string;
  waveform: Waveform;
  radius: number;
};

// --- PALETA DE SONIDOS/COLORES ---
const SOUND_PALETTE = [
  { color: '#ef4444', waveform: 'sine' as Waveform, label: 'Sine (Smooth)' },      // Red
  { color: '#eab308', waveform: 'square' as Waveform, label: 'Square (Retro)' },  // Yellow
  { color: '#22c55e', waveform: 'triangle' as Waveform, label: 'Triangle (Flute)'},// Green
  { color: '#06b6d4', waveform: 'sawtooth' as Waveform, label: 'Sawtooth (Brass)'},// Cyan
  { color: '#a855f7', waveform: 'sine' as Waveform, label: 'Sine Alt (Ghost)' }    // Purple
];

// --- MOTOR DE AUDIO ---
class AudioEngine {
  private audioContext: AudioContext;
  private mainGain: GainNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.mainGain = this.audioContext.createGain();
    this.mainGain.gain.value = 0.5;
    this.mainGain.connect(this.audioContext.destination);
  }

  playNote(yPosition: number, canvasHeight: number, waveform: Waveform) {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const minFreq = 200;
    const maxFreq = 1000;
    const freq = maxFreq - (yPosition / canvasHeight) * (maxFreq - minFreq);

    const oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);

    const noteGain = this.audioContext.createGain();
    noteGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    noteGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.01);
    noteGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.2);

    oscillator.connect(noteGain);
    noteGain.connect(this.mainGain);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }
}

// --- COMPONENTE PRINCIPAL ---
export default function SonicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [activeBrush, setActiveBrush] = useState(SOUND_PALETTE[3]); // cyan default
  const [isDrawing, setIsDrawing] = useState(false);
  const audioEngine = useRef<AudioEngine | null>(null);

  useEffect(() => {
    audioEngine.current = new AudioEngine();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    let animationFrameId: number;
    const loop = () => {
      setPlayhead(p => (p + 1.5) % (canvasRef.current?.width || 1));
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw notes
    notes.forEach(note => {
      ctx.beginPath();
      ctx.arc(note.x, note.y, note.radius || 4, 0, Math.PI * 2);
      ctx.fillStyle = note.color;
      ctx.fill();
    });

    // Draw playhead
    if (isPlaying) {
      ctx.beginPath();
      ctx.moveTo(playhead, 0);
      ctx.lineTo(playhead, canvas.height);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [notes, isPlaying, playhead]);

  useEffect(() => {
    if (!isPlaying || !audioEngine.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Play notes when playhead crosses them
    const notesAtPlayhead = notes.filter(note => Math.abs(note.x - playhead) < 1.6);
    notesAtPlayhead.forEach(note => {
      audioEngine.current?.playNote(note.y, canvas.height, note.waveform);
    });
  }, [playhead, isPlaying, notes]);

  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    // Scale handling relative to responsivenes on mobile and tablets
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return { 
      x: (e.clientX - rect.left) * scaleX, 
      y: (e.clientY - rect.top) * scaleY 
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Capture pointer events (good for mobile and stylus)
    const canvas = canvasRef.current;
    if (canvas) canvas.setPointerCapture(e.pointerId);

    setIsDrawing(true);
    const coords = getCoords(e);
    if (coords) {
      // Sensibilidad para Apple Pencil y S-Pen
      const pressure = e.pointerType === 'pen' && e.pressure ? e.pressure : 0.6;
      const radius = 2 + pressure * 6; // radio de pincel depende de presión, de 2 a 8
      
      setNotes(prev => [...prev, { 
        ...coords, 
        color: activeBrush.color, 
        waveform: activeBrush.waveform, 
        radius 
      }]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoords(e);
    if (coords) {
      const pressure = e.pointerType === 'pen' && e.pressure ? e.pressure : 0.6;
      const radius = 2 + pressure * 6;
      
      setNotes(prev => [...prev, { 
        ...coords, 
        color: activeBrush.color, 
        waveform: activeBrush.waveform, 
        radius 
      }]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) canvas.releasePointerCapture(e.pointerId);
    setIsDrawing(false);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-4 px-2">
      <div className="w-full p-4 bg-black/50 border border-cyan-900/50 rounded-lg flex justify-center items-center gap-4 flex-wrap shadow-xl">
        <button 
          onClick={() => setIsPlaying(!isPlaying)} 
          className={`p-3 rounded-md transition-colors ${isPlaying ? 'bg-cyan-500/40 text-cyan-200' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'}`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button 
          onClick={() => setNotes([])} 
          className="p-3 bg-secondary/30 text-muted-foreground rounded-md hover:bg-secondary/60 hover:text-white transition-colors"
          title="Clear Canvas"
        >
          <Trash2 />
        </button>

        <div className="h-8 w-px bg-cyan-900/50 hidden sm:block"></div>

        {/* Las herramientas de dibujo en forma de paleta de color */}
        <div className="flex gap-3 items-center bg-black/40 px-4 py-2 rounded-lg ml-0 sm:ml-4 border border-white/5">
          <Pencil size={18} className="text-white/50" />
          {SOUND_PALETTE.map(brush => (
            <button 
              key={brush.color} 
              onClick={() => setActiveBrush(brush)} 
              className={`w-8 h-8 rounded-full border-2 transition-all transform ${activeBrush.color === brush.color ? 'scale-125 border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'}`}
              style={{ backgroundColor: brush.color }}
              title={brush.label}
            />
          ))}
        </div>
      </div>
      
      {/* 
        touch-none es vital con Pointer Events para evitar que al
        dibujar en el móvil, la pantalla haga scroll involuntario 
      */}
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="bg-black/80 border border-cyan-900/50 rounded-lg cursor-crosshair touch-none w-full max-w-full h-auto shadow-[0_0_30px_rgba(6,182,212,0.1)]"
        style={{ touchAction: 'none' }}
      />
      <div className="text-center w-full my-2">
        <p className="text-xs text-cyan-400/50 font-mono flex items-center justify-center">
          Dibuja en el lienzo. Optimizado para móvil y S-Pen / Apple Pencil.
        </p>
      </div>
    </div>
  );
}
