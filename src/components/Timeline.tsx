"use client";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Code } from "lucide-react";

const timelineData = [
  {
    icon: <GraduationCap />,
    date: "2020 - Presente",
    title: "Grado en Ingeniería Informática",
    subtitle: "Universidad Autónoma de Madrid",
    description: "Especialización en sistemas críticos y desarrollo de software avanzado.",
  },
  {
    icon: <Code />,
    date: "2022",
    title: "Primer Proyecto Full-Stack",
    subtitle: "Aplicación de Ajedrez con IA",
    description: "Desarrollo de una aplicación web completa con un motor de ajedrez y una IA básica.",
  },
  {
    icon: <Briefcase />,
    date: "2023",
    title: "Exploración de Rust y Sistemas de Bajo Nivel",
    subtitle: "Proyectos personales",
    description: "Investigación y desarrollo en Rust para entender la gestión de memoria y la concurrencia.",
  },
];

const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Timeline() {
  return (
    <section id="timeline" className="py-24 px-4 md:px-10 bg-background">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Mi Trayectoria</h2>
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

          {timelineData.map((item, index) => (
            <motion.div
              key={index}
              className="relative flex items-start mb-12"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              {/* Icono */}
              <div className="absolute left-0 flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-blue-500">
                {item.icon}
              </div>

              {/* Contenido */}
              <div className="ml-16">
                <p className="text-sm font-mono text-muted-foreground mb-1">{item.date}</p>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <h4 className="text-md text-muted-foreground mb-2">{item.subtitle}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
