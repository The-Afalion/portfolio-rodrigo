"use client";
import { motion } from "framer-motion";
import { School, Award, Code } from "lucide-react";

const hitos = [
  {
    fecha: "2025 - Presente",
    titulo: "Grado en Ingeniería Informática",
    institucion: "Universidad Autónoma de Madrid (UAM)",
    descripcion: "Profundizando en los fundamentos de la computación, algoritmos, estructuras de datos y arquitecturas de software.",
    icono: <School />,
  },
  {
    fecha: "2024 - 2025",
    titulo: "Atleta de Alto Rendimiento",
    institucion: "Centro de Alto Rendimiento (CARD), Madrid",
    descripcion: "Compitiendo a nivel nacional en piragüismo, desarrollando disciplina, gestión del tiempo y resiliencia.",
    icono: <Award />,
  },
  {
    fecha: "2020 - 2024",
    titulo: "Inicios en Programación",
    institucion: "Bachillerato en IES Isaac Albéniz",
    descripcion: "Primeros pasos en el desarrollo de software, explorando Python y tecnologías web de forma autodidacta.",
    icono: <Code />,
  },
];

export default function Trayectoria() {
  return (
    <section id="trayectoria" className="py-24 px-4">
      <h2 className="text-center text-4xl font-bold mb-16">Mi Trayectoria</h2>
      <div className="relative max-w-2xl mx-auto">
        {/* Línea vertical */}
        <div className="absolute left-5 top-5 h-full w-0.5 bg-border -translate-x-1/2" />
        
        {hitos.map((hito, indice) => (
          <motion.div
            key={indice}
            className="relative pl-16 mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: indice * 0.1 }}
          >
            {/* Círculo con el icono */}
            <div className="absolute left-5 -translate-x-1/2 top-1 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary z-10">
              {hito.icono}
            </div>

            {/* Contenido del hito */}
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-muted-foreground font-mono mb-1">{hito.fecha}</p>
              <h3 className="text-xl font-bold text-foreground">{hito.titulo}</h3>
              <p className="text-sm font-semibold text-primary mb-2">{hito.institucion}</p>
              <p className="text-muted-foreground">{hito.descripcion}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
