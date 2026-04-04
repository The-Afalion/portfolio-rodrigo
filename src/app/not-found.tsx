"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="h-screen w-full bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-mono">
      {/* Fondo de ruido estático */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
      
      {/* Efecto Glitch */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-4 relative">
            404
            <span className="absolute top-0 left-1 text-red-500 opacity-50 animate-pulse" style={{ clipPath: 'inset(10% 0 80% 0)' }}>404</span>
            <span className="absolute top-0 -left-1 text-blue-500 opacity-50 animate-pulse" style={{ clipPath: 'inset(80% 0 10% 0)' }}>404</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2 text-red-500 mb-6">
            <AlertTriangle size={24} />
            <span className="text-xl font-bold uppercase tracking-widest">Error de Sistema</span>
          </div>
          
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            La ruta solicitada no existe en este sector de la memoria. Los datos pueden haber sido purgados o corrompidos.
          </p>

          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors rounded-sm uppercase tracking-wider"
          >
            <Home size={18} />
            Reiniciar Sistema
          </Link>
        </motion.div>
      </div>

      {/* Decoración Tech */}
      <div className="absolute bottom-10 left-10 text-xs text-gray-600 font-mono">
        ERR_CODE: PAGE_NOT_FOUND
        <br />
        MEM_ADDR: 0x00000000
      </div>
    </main>
  );
}
