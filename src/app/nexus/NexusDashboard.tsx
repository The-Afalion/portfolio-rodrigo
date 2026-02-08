"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, HardDrive, Upload, FileText, Activity, AlertTriangle, Database } from 'lucide-react';

// Tipos simulados para el frontend
interface Node {
  id: string;
  name: string;
  region: string;
  status: 'ONLINE' | 'OFFLINE' | 'RECOVERING';
  capacity: number;
  used: number;
}

interface File {
  id: string;
  name: string;
  size: string;
  chunks: number;
  status: 'OK' | 'DAMAGED';
}

// Datos iniciales de ejemplo
const INITIAL_NODES: Node[] = [
  { id: 'n1', name: 'Alpha-1', region: 'US-East', status: 'ONLINE', capacity: 1000, used: 450 },
  { id: 'n2', name: 'Beta-2', region: 'EU-West', status: 'ONLINE', capacity: 1000, used: 320 },
  { id: 'n3', name: 'Gamma-3', region: 'Asia-South', status: 'ONLINE', capacity: 1000, used: 120 },
  { id: 'n4', name: 'Delta-4', region: 'US-West', status: 'ONLINE', capacity: 1000, used: 600 },
  { id: 'n5', name: 'Epsilon-5', region: 'EU-North', status: 'OFFLINE', capacity: 1000, used: 0 },
];

const INITIAL_FILES: File[] = [
  { id: 'f1', name: 'project_specs.pdf', size: '2.4 MB', chunks: 4, status: 'OK' },
  { id: 'f2', name: 'backup_db.sql', size: '150 MB', chunks: 12, status: 'DAMAGED' },
];

function NodeCard({ node, onClick }: { node: Node, onClick: () => void }) {
  const isOnline = node.status === 'ONLINE';
  const usagePercent = (node.used / node.capacity) * 100;

  return (
    <motion.div 
      layoutId={node.id}
      onClick={onClick}
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
          <div 
            className={`h-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} 
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Indicador de estado */}
      <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
    </motion.div>
  );
}

function FileList({ files }: { files: File[] }) {
  return (
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
              <span className={`px-1.5 py-0.5 rounded ${file.status === 'OK' ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
                {file.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NexusDashboard() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [files, setFiles] = useState<File[]>(INITIAL_FILES);
  const [uploading, setUploading] = useState(false);

  const toggleNodeStatus = (id: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, status: n.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE' } : n));
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setFiles([...files, { id: `f${Date.now()}`, name: `upload_${Date.now()}.dat`, size: '50 MB', chunks: 5, status: 'OK' }]);
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <AnimatePresence>
            {nodes.map(node => (
              <NodeCard key={node.id} node={node} onClick={() => toggleNodeStatus(node.id)} />
            ))}
          </AnimatePresence>
          
          {/* Botón para añadir nodo (simulado) */}
          <button className="border border-dashed border-green-900/50 rounded-lg p-4 flex flex-col items-center justify-center text-green-800 hover:text-green-500 hover:border-green-500/50 transition-colors">
            <Server size={24} className="mb-2 opacity-50" />
            <span className="text-xs">ADD_NODE</span>
          </button>
        </div>

        {/* Visualizador de Tráfico (Placeholder para la animación) */}
        <div className="h-48 border border-green-900/30 rounded-lg bg-black/30 relative overflow-hidden flex items-center justify-center">
          <p className="text-green-900 text-xs font-mono">NETWORK_TRAFFIC_VISUALIZER // IDLE</p>
          {/* Aquí irán las partículas viajando */}
        </div>
      </div>

      {/* Columna Derecha: Archivos y Acciones */}
      <div className="space-y-6">
        <div className="bg-green-900/10 border border-green-900/30 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
            <Activity size={16} /> SYSTEM_STATUS
          </h3>
          <div className="space-y-2 text-xs font-mono text-green-600">
            <div className="flex justify-between"><span>UPTIME</span><span className="text-white">99.99%</span></div>
            <div className="flex justify-between"><span>LATENCY</span><span className="text-white">24ms</span></div>
            <div className="flex justify-between"><span>REPLICATION</span><span className="text-green-400">3x</span></div>
          </div>
        </div>

        <div 
          onClick={handleUpload}
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${uploading ? 'border-green-500 bg-green-900/20' : 'border-green-900/50 hover:border-green-500/50 hover:bg-green-900/10'}`}
        >
          <Upload size={32} className={`mb-2 ${uploading ? 'text-green-400 animate-bounce' : 'text-green-700'}`} />
          <span className="text-sm font-bold text-green-500">{uploading ? 'UPLOADING...' : 'UPLOAD_FILE'}</span>
          <span className="text-xs text-green-800 mt-1">Drag & drop or click</span>
        </div>

        <FileList files={files} />
      </div>
    </div>
  );
}
