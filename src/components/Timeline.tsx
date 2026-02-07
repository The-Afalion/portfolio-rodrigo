"use client";
import { motion } from "framer-motion";
import { School, Activity, Award, Code } from "lucide-react";

const timelineEvents = [
  {
    date: "2025 - Presente",
    title: "Grado en Ingeniería Informática",
    institution: "Universidad Autónoma de Madrid (UAM)",
    description: "Profundizando en los fundamentos de la computación, algoritmos, estructuras de datos y arquitecturas de software.",
    icon: <School />,
    color: "blue",
  },
  {
    date: "2024 - 2025",
    title: "Atleta de Alto Rendimiento",
    institution: "Centro de Alto Rendimiento (CARD), Madrid",
    description: "Compitiendo a nivel nacional en piragüismo, desarrollando una disciplina férrea, gestión del tiempo y resiliencia bajo presión.",
    icon: <Award />,
    color: "green",
  },
  {
    date: "2020 - 2024",
    title: "Bachillerato y Despertar Tecnológico",
    institution: "IES Isaac Albéniz",
    description: "Donde nació la curiosidad por la programación. Desarrollo de los primeros proyectos personales y experimentación con Python y desarrollo web básico.",
    icon: <Code />,
    color: "purple",
  },
];

export default function Timeline() {
  return (
    <section id="timeline" className="py-24 px-4">
      <h2 className="text-center text-4xl font-bold mb-12">Mi Trayectoria</h2>
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border" />
        {timelineEvents.map((event, index) => (
          <motion.div
            key={index}
            className="relative flex items-center mb-12"
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-${event.color}-500/20 border-2 border-${event.color}-500 flex items-center justify-center text-${event.color}-500`}>
              {event.icon}
            </div>
            <div className={`w-[calc(50%-2.5rem)] ${index % 2 === 0 ? 'text-right' : 'ml-auto'}`}>
              <p className="text-sm text-muted-foreground">{event.date}</p>
              <h3 className="text-xl font-bold mt-1">{event.title}</h3>
              <p className="text-sm font-mono">{event.institution}</p>
              <p className="text-muted-foreground mt-2">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
