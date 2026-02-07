"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={() => router.back()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-secondary rounded-2xl border border-border shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Evita que el modal se cierre al hacer clic dentro
      >
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-muted z-10"
        >
          <X />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
