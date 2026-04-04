"use client";

import { motion } from 'framer-motion';

export default function EncabezadoBlog() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-2">Blog Técnico</h1>
      <p className="text-lg text-muted-foreground mb-12">
        Un espacio para compartir ideas, proyectos y aprendizajes sobre el mundo del software.
      </p>
    </motion.div>
  );
}
