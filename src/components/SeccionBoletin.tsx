"use client";
import FormularioBoletin from "./FormularioBoletin";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function SeccionBoletin() {
  return (
    <section id="boletin" className="py-24 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto bg-secondary rounded-2xl border border-border p-8 md:p-12"
      >
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Columna de Texto */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono mb-4">
              <Mail size={14} />
              BOLETÍN TÉCNICO
            </div>
            <h2 className="text-3xl font-bold mb-2 text-foreground">Accede a Contenido Exclusivo</h2>
            <p className="text-muted-foreground">
              Recibe análisis de proyectos, artículos de ingeniería y noticias sobre mis últimos experimentos directamente en tu correo.
            </p>
          </div>
          
          {/* Columna del Formulario */}
          <div className="w-full">
            <FormularioBoletin />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
