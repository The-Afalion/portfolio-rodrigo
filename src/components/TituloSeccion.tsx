"use client";
import { motion } from "framer-motion";

export default function TituloSeccion({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 100 }}
      className="text-4xl md:text-5xl font-bold mb-16 text-center"
    >
      {children}
    </motion.h2>
  );
}
