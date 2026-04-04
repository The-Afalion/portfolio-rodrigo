"use client";

import { useState, useRef, useEffect } from 'react';
import { Save, Trash2, RotateCw, ArrowUp, ArrowDown } from 'lucide-react';
import { saveCourse } from './actions';
import toast from 'react-hot-toast';

// Tipos
type GateType = 'green' | 'red';
interface Gate {
  id: string;
  x: number;
  y: number;
  rotation: number;
  type: GateType;
  number: number;
}

// --- COMPONENTE DEL CANAL (SVG) ---
function RiverBackground() {
  return (
    <g className="pointer-events-none select-none">
      {/* Agua */}
      <path 
        d="M0,100 C150,100 150,300 300,300 C450,300 450,100 600,100 C750,100 750,300 900,300 L900,500 C750,500 750,700 600,700 C450,700 450,500 300,500 C150,500 150,700 0,700 Z" 
        fill="#e0f2fe" 
        stroke="#bae6fd" 
        strokeWidth="2"
      />
      {/* Corrientes (Líneas decorativas) */}
      <path d="M50,200 C150,200 200,250 250,250" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
      <path d="M350,250 C400,250 450,200 550,200" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
      <path d="M650,200 C750,200 800,250 850,250" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
      
      {/* Orillas (Hormigón) */}
      <path 
        d="M0,80 C160,80 140,320 300,320 C460,320 440,80 600,80 C760,80 740,320 900,320 L900,300 C750,300 750,100 600,100 C450,100 450,300 300,300 C150,300 150,100 0,100 Z" 
        fill="#94a3b8" 
      />
       <path 
        d="M0,720 C160,720 140,480 300,480 C460,480 440,720 600,720 C760,720 740,480 900,480 L900,500 C750,500 750,700 600,700 C450,700 450,500 300,500 C150,500 150,700 0,700 Z" 
        fill="#94a3b8" 
      />
    </g>
  );
}

// --- COMPONENTE DE PUERTA ---
function GateElement({ gate, isSelected, onSelect, onDragStart }: { gate: Gate, isSelected: boolean, onSelect: () => void, onDragStart: (e: React.MouseEvent) => void }) {
  const color = gate.type === 'green' ? '#22c55e' : '#ef4444';
  
  return (
    <g 
      transform={`translate(${gate.x}, ${gate.y}) rotate(${gate.rotation})`} 
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onMouseDown={onDragStart}
      className="cursor-move hover:opacity-80 transition-opacity"
    >
      {/* Zona de selección invisible más grande */}
      <rect x="-25" y="-10" width="50" height="20" fill="transparent" />
      
      {/* Palos */}
      <circle cx="-20" cy="0" r="3" fill={color} stroke="black" strokeWidth="1" />
      <circle cx="20" cy="0" r="3" fill={color} stroke="black" strokeWidth="1" />
      
      {/* Línea imaginaria */}
      <line x1="-20" y1="0" x2="20" y2="0" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
      
      {/* Número */}
      <text y="-8" textAnchor="middle" fontSize="10" fontWeight="bold" fill="black">{gate.number}</text>
      
      {/* Indicador de selección */}
      {isSelected && (
        <circle r="25" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
      )}
    </g>
  );
}

export default function SlalomEditor() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Añadir puerta
  const addGate = (type: GateType) => {
    const newGate: Gate = {
      id: crypto.randomUUID(),
      x: 100 + gates.length * 50, // Posición inicial escalonada
      y: 200,
      rotation: 0,
      type,
      number: gates.length + 1
    };
    setGates([...gates, newGate]);
    setSelectedId(newGate.id);
  };

  // Actualizar puerta seleccionada
  const updateSelectedGate = (updates: Partial<Gate>) => {
    if (!selectedId) return;
    setGates(gates.map(g => g.id === selectedId ? { ...g, ...updates } : g));
  };

  // Borrar puerta
  const deleteSelectedGate = () => {
    if (!selectedId) return;
    const newGates = gates.filter(g => g.id !== selectedId);
    // Renumerar
    const renumbered = newGates.map((g, i) => ({ ...g, number: i + 1 }));
    setGates(renumbered);
    setSelectedId(null);
  };

  // Manejo del Drag & Drop
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !svgRef.current) return;
    
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;

    const x = (e.clientX - CTM.e) / CTM.a;
    const y = (e.clientY - CTM.f) / CTM.d;

    updateSelectedGate({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Guardar
  const handleSave = async () => {
    const name = prompt("Nombre de tu diseño:");
    if (!name) return;

    toast.loading("Guardando diseño...");
    const result = await saveCourse(name, gates);
    toast.dismiss();
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("¡Diseño guardado!");
    }
  };

  const selectedGate = gates.find(g => g.id === selectedId);

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Toolbar */}
      <div className="w-full md:w-64 bg-background border-r border-border p-4 flex flex-col gap-6 z-10 shadow-sm">
        <div>
          <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">Añadir Elementos</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addGate('green')} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
              <div className="w-8 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-mono">Bajada</span>
            </button>
            <button onClick={() => addGate('red')} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
              <div className="w-8 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs font-mono">Remonte</span>
            </button>
          </div>
        </div>

        {selectedGate && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-200">
            <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">Propiedades</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Rotación</span>
                <div className="flex gap-1">
                  <button onClick={() => updateSelectedGate({ rotation: selectedGate.rotation - 15 })} className="p-1 hover:bg-secondary rounded"><RotateCw className="-scale-x-100" size={16} /></button>
                  <button onClick={() => updateSelectedGate({ rotation: selectedGate.rotation + 15 })} className="p-1 hover:bg-secondary rounded"><RotateCw size={16} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tipo</span>
                <button 
                  onClick={() => updateSelectedGate({ type: selectedGate.type === 'green' ? 'red' : 'green' })}
                  className={`px-2 py-1 rounded text-xs font-bold text-white ${selectedGate.type === 'green' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                  {selectedGate.type === 'green' ? 'VERDE' : 'ROJA'}
                </button>
              </div>
              <button onClick={deleteSelectedGate} className="w-full flex items-center justify-center gap-2 p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors text-sm">
                <Trash2 size={16} /> Eliminar Puerta
              </button>
            </div>
          </div>
        )}

        <div className="mt-auto">
          <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Save size={18} /> Guardar Diseño
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-grow bg-gray-100 relative cursor-crosshair overflow-auto">
        <svg 
          ref={svgRef}
          viewBox="0 0 900 800" 
          className="w-full h-full min-w-[900px] min-h-[800px]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedId(null)}
        >
          <RiverBackground />
          {gates.map(gate => (
            <GateElement 
              key={gate.id} 
              gate={gate} 
              isSelected={selectedId === gate.id} 
              onSelect={() => setSelectedId(gate.id)}
              onDragStart={(e) => {
                e.stopPropagation();
                setSelectedId(gate.id);
                setIsDragging(true);
              }}
            />
          ))}
        </svg>
        
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-muted-foreground border border-border shadow-sm">
          {gates.length} Puertas
        </div>
      </div>
    </div>
  );
}
