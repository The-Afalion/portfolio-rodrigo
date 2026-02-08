"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Trash2, Square, Triangle, Waves } from 'lucide-react';

// --- TIPOS ---
type Note = { x: number; y: number };
type Waveform = 'sine' | 'square' | 'triangle' | 'sawtooth';

// --- MOTOR DE AUDIO ---
class AudioEngine {
  private audioContext: AudioContext;
  private mainGain: GainNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.mainGain = this.audioContext.createGain();
    this.mainGain.gain.value = 0.5; // Volumen maestro
    this.mainGain.connect(this.audioContext.destination);
  }

  playNote(yPosition: number, canvasHeight: number, waveform: Waveform) {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Mapear Y a una frecuencia (ej: 200Hz a 1000Hz)
    const minFreq = 200;
    const maxFreq = 1000;
    const freq = maxFreq - (yPosition / canvasHeight) * (maxFreq - minFreq);

    const oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);

    // Envolvente de volumen para evitar "clics"
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
  const [waveform, setWaveform] = useState<Waveform>('sine');
  const audioEngine = useRef<AudioEngine | null>(null);

  // Inicializar motor de audio
  useEffect(() => {
    audioEngine.current = new AudioEngine();
  }, []);

  // Bucle del secuenciador
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;
    const loop = () => {
      setPlayhead(p => (p + 1) % (canvasRef.current?.width || 1));
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  // Dibujar en el canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar notas
    notes.forEach(note => {
      ctx.beginPath();
      ctx.arc(note.x, note.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();
    });

    // Dibujar playhead
    if (isPlaying) {
      ctx.beginPath();
      ctx.moveTo(playhead, 0);
      ctx.lineTo(playhead, canvas.height);
      ctx.strokeStyle = '#a5f3fc';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [notes, isPlaying, playhead]);

  // Disparar notas
  useEffect(() => {
    if (!isPlaying || !audioEngine.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const notesAtPlayhead = notes.filter(note => Math.abs(note.x - playhead) < 2);
    notesAtPlayhead.forEach(note => {
      audioEngine.current?.playNote(note.y, canvas.height, waveform);
    });
  }, [playhead, isPlaying, notes, waveform]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNotes([...notes, { x, y }]);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-4">
      <div className="w-full p-4 bg-black/50 border border-cyan-900/50 rounded-lg flex justify-center items-center gap-4">
        <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-cyan-500/20 text-cyan-300 rounded-md hover:bg-cyan-500/40">
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button onClick={() => setNotes([])} className="p-3 bg-secondary/50 text-muted-foreground rounded-md hover:bg-secondary">
          <Trash2 />
        </button>
        <div className="h-8 w-px bg-cyan-900/50"></div>
        {/* Selector de forma de onda */}
        {(['sine', 'square', 'triangle', 'sawtooth'] as Waveform[]).map(wf => (
          <button key={wf} onClick={() => setWaveform(wf)} className={`p-2 rounded-md ${waveform === wf ? 'bg-cyan-500 text-black' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}>
            {wf === 'sine' && <Waves size={20} />}
            {wf === 'square' && <Square size={20} />}
            {wf === 'triangle' && <Triangle size={20} />}
            {wf === 'sawtooth' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 18h20L2 6v12z"/></svg>}
          </button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        onClick={handleCanvasClick}
        className="bg-black/50 border border-cyan-900/50 rounded-lg cursor-crosshair"
      />
    </div>
  );
}
