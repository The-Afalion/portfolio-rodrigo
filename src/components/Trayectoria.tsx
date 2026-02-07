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
    color: "blue",
  },
  {
    fecha: "2024 - 2025",
    titulo: "Atleta de Alto Rendimiento",
    institucion: "Centro de Alto Rendimiento (CARD), Madrid",
    descripcion: "Compitiendo a nivel nacional en piragüismo, desarrollando disciplina, gestión del tiempo y resiliencia.",
    icono: <Award />,
    color: "green",
  },
  {
    fecha: "2020 - 2024",
    titulo: "Bachillerato y Despertar Tecnológico",
    institucion: "IES Isaac Albéniz",
    descripcion: "Donde nació mi curiosidad por la programación. Desarrollo de los primeros proyectos y experimentación con Python y web.",
    icono: <Code />,
    color: "purple",
  },
];

export default function Trayectoria() {
  return (
    <section id="trayectoria" className="py-24 px-4">
      <h2 className="text-center text-4xl font-bold mb-12">Mi Trayectoria</h2>
      <div className="relative max-w-3xl mx-auto">
        {/* Línea vertical central */}
        <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border" />
        
        {hitos.map((hito, indice) => (
          <motion.div
            key={indice}
            className="relative flex items-center mb-12"
            initial={{ opacity: 0, x: indice % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            {/* Círculo con el icono */}
            <div className={`absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-${hito.color}-500/20 border-2 border-${hito.color}-500 flex items-center justify-center text-${hito.color}-500`}>
              {hito.icono}
            </div>

            {/* Contenido del hito */}
            <div className={`w-[calc(50%-2.5rem)] ${indice % 2 === 0 ? 'text-right' : 'ml-auto'}`}>
              <p className="text-sm text-muted-foreground">{hito.fecha}</p>
              <h3 className="text-xl font-bold mt-1">{hito.titulo}</h3>
              <p className="text-sm font-mono">{hito.institucion}</p>
              <p className="text-muted-foreground mt-2">{hito.descripcion}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
