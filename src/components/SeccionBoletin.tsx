"use client";
import FormularioBoletin from "./FormularioBoletin";
import { Mail } from "lucide-react";

export default function SeccionBoletin() {
  return (
    <section id="boletin" className="py-24 px-4">
      <div className="max-w-4xl mx-auto bg-secondary rounded-2xl border border-border p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Columna de Texto */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono mb-4">
              <Mail size={14} />
              BOLETÍN
            </div>
            <h2 className="text-3xl font-bold mb-2">Mantente Actualizado</h2>
            <p className="text-muted-foreground">
              Suscríbete para ser el primero en saber sobre nuevos proyectos, artículos y experimentos. Sin spam, prometido.
            </p>
          </div>
          
          {/* Columna del Formulario */}
          <div className="w-full">
            <FormularioBoletin />
          </div>
        </div>
      </div>
    </section>
  );
}
