"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Upload, FileText, Activity, Database, Lock } from 'lucide-react';

// --- TIPOS ---
interface Node {
  id: string;
  name: string;
  region: string;
  status: 'ONLINE' | 'OFFLINE';
  capacity: number;
  used: number;
  x?: number; // Coordenadas para la animación
  y?: number;
}

interface FileRecord {
  id: string;
  name: string;
  size: string;
  chunks: number;
  status: 'OK' | 'ENCRYPTED';
}

interface DataPacket {
  id: string;
  targetNodeId: string;
  color: string;
}

// --- DATOS INICIALES ---
const INITIAL_NODES: Node[] = [
  { id: 'n1', name: 'Alpha-1', region: 'US-East', status: 'ONLINE', capacity: 1000, used: 450 },
  { id: 'n2', name: 'Beta-2', region: 'EU-West', status: 'ONLINE', capacity: 1000, used: 320 },
  { id: 'n3', name: 'Gamma-3', region: 'Asia-South', status: 'ONLINE', capacity: 1000, used: 120 },
  { id: 'n4', name: 'Delta-4', region: 'US-West', status: 'ONLINE', capacity: 1000, used: 600 },
  { id: 'n5', name: 'Epsilon-5', region: 'EU-North', status: 'OFFLINE', capacity: 1000, used: 0 },
];

// --- UTILIDADES ---
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Función de hash simple para distribuir chunks
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export default function NexusDashboard() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [packets, setPackets] = useState<DataPacket[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Referencias para obtener posiciones de los elementos
  const nodeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const uploaderRef = useRef<HTMLDivElement>(null);

  // Registrar nodos para animación
  const registerNodeRef = (id: string, el: HTMLDivElement | null) => {
    nodeRefs.current[id] = el;
  };

  const toggleNodeStatus = (id: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, status: n.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE' } : n));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // 1. Leer el archivo
    const buffer = await file.arrayBuffer();
    const chunkSize = Math.ceil(buffer.byteLength / 20); // Dividir en ~20 trozos para la demo
    const totalChunks = Math.ceil(buffer.byteLength / chunkSize);
    
    const newFile: FileRecord = {
      id: `f-${Date.now()}`,
      name: file.name,
      size: formatSize(file.size),
      chunks: totalChunks,
      status: 'OK'
    };

    // 2. Procesar chunks uno a uno con retraso para la animación
    for (let i = 0; i < totalChunks; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Retraso visual

      // Simular contenido del chunk
      const chunkContent = new Uint8Array(buffer.slice(i * chunkSize, (i + 1) * chunkSize)).toString();
      
      // Elegir nodo destino basado en hash (Consistent Hashing simplificado)
      const activeNodes = nodes.filter(n => n.status === 'ONLINE');
      if (activeNodes.length === 0) break; // No hay nodos, pérdida de datos
      
      const nodeIndex = simpleHash(chunkContent + i) % activeNodes.length;
      const targetNode = activeNodes[nodeIndex];

      // Lanzar paquete
      const packetId = `p-${Date.now()}-${i}`;
      setPackets(prev => [...prev, { id: packetId, targetNodeId: targetNode.id, color: i % 2 === 0 ? '#4ade80' : '#22d3ee' }]);

      // Actualizar uso del nodo
      setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, used: Math.min(n.capacity, n.used + (chunkSize / 1024 / 1024)) } : n));

      // Limpiar paquete después de la animación
      setTimeout(() => {
        setPackets(prev => prev.filter(p => p.id !== packetId));
      }, 1000);
    }

    setFiles(prev => [newFile, ...prev]);
    setUploading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      {/* Capa de Animación de Paquetes */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {packets.map(packet => {
            const startRect = uploaderRef.current?.getBoundingClientRect();
            const endRect = nodeRefs.current[packet.targetNodeId]?.getBoundingClientRect();
            
            if (!startRect || !endRect) return null;

            // Calcular posición relativa al contenedor padre
            // Esto es una simplificación, en un caso real necesitaríamos coordenadas más precisas
            // Asumimos que el contenedor padre es el contexto de posicionamiento
            
            return (
              <motion.div
                key={packet.id}
                initial={{ 
                  left: uploaderRef.current?.offsetLeft! + 50, 
                  top: uploaderRef.current?.offsetTop! + 50, 
                  opacity: 1, 
                  scale: 1 
                }}
                animate={{ 
                  left: nodeRefs.current[packet.targetNodeId]?.offsetLeft! + 50, 
                  top: nodeRefs.current[packet.targetNodeId]?.offsetTop! + 20, 
                  opacity: 0, 
                  scale: 0.5 
                }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="absolute w-3 h-3 rounded-sm shadow-[0_0_10px_currentColor]"
                style={{ backgroundColor: packet.color, position: 'absolute' }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Columna Izquierda: Red de Nodos */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-green-400 flex items-center gap-2">
            <Database size={20} /> NODE_CLUSTER
          </h2>
          <div className="text-xs text-green-800">
            ACTIVE_NODES: {nodes.filter(n => n.status === 'ONLINE').length}/{nodes.length}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {nodes.map(node => {
            const isOnline = node.status === 'ONLINE';
            const usagePercent = (node.used / node.capacity) * 100;
            return (
              <div 
                key={node.id}
                ref={el => registerNodeRef(node.id, el)}
                onClick={() => toggleNodeStatus(node.id)}
                className={`relative p-4 rounded-lg border cursor-pointer transition-all ${isOnline ? 'border-green-900/50 bg-green-900/10 hover:bg-green-900/20' : 'border-red-900/50 bg-red-900/10 hover:bg-red-900/20'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Server size={18} className={isOnline ? 'text-green-500' : 'text-red-500'} />
                    <span className={`font-bold text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>{node.name}</span>
                  </div>
                  <span className="text-[10px] text-green-800 font-mono">{node.region}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-green-700">
                    <span>STORAGE</span>
                    <span>{usagePercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-1 w-full bg-green-900/30 rounded-full overflow-hidden">
                    <div className={`h-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${usagePercent}%` }} />
                  </div>
                </div>
                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Columna Derecha: Uploader y Archivos */}
      <div className="space-y-6">
        <div className="bg-green-900/10 border border-green-900/30 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
            <Activity size={16} /> SYSTEM_STATUS
          </h3>
          <div className="space-y-2 text-xs font-mono text-green-600">
            <div className="flex justify-between"><span>ENCRYPTION</span><span className="text-green-400 flex items-center gap-1"><Lock size={10}/> AES-256</span></div>
            <div className="flex justify-between"><span>SHARDING</span><span className="text-white">ENABLED</span></div>
          </div>
        </div>

        <div 
          ref={uploaderRef}
          className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all ${uploading ? 'border-green-500 bg-green-900/20' : 'border-green-900/50 hover:border-green-500/50 hover:bg-green-900/10'}`}
        >
          <input 
            type="file" 
            onChange={handleFileUpload} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <Upload size={32} className={`mb-2 ${uploading ? 'text-green-400 animate-bounce' : 'text-green-700'}`} />
          <span className="text-sm font-bold text-green-500">{uploading ? 'FRAGMENTING & DISTRIBUTING...' : 'UPLOAD_FILE'}</span>
          <span className="text-xs text-green-800 mt-1">Click to select file</span>
        </div>

        <div className="border border-green-900/50 rounded-lg bg-black/50 overflow-hidden">
          <div className="bg-green-900/20 p-2 text-xs font-bold text-green-500 border-b border-green-900/50 flex justify-between">
            <span>FILESYSTEM</span>
            <span>/root</span>
          </div>
          <div className="p-2 space-y-1">
            {files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-2 hover:bg-green-900/10 rounded cursor-pointer group">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-green-600 group-hover:text-green-400" />
                  <span className="text-sm text-green-400">{file.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-green-800">{file.size}</span>
                  <span className="px-1.5 py-0.5 rounded bg-green-900/30 text-green-500">{file.chunks} chunks</span>
                </div>
              </div>
            ))}
            {files.length === 0 && <p className="text-center text-green-900 text-xs py-4">NO_FILES_FOUND</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
