"use client";

import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

export default function SobreMi() {
  return (
    <section id="sobre-mi" className="relative py-32 px-6 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.2 }}
          className="w-full"
        >
          <motion.div variants={itemVariants} className="mb-8 flex justify-center">
            <span className="px-4 py-1 font-mono text-xs tracking-widest uppercase border border-border text-muted-foreground rounded-full">
              Filosofía
            </span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight mb-10 text-foreground leading-tight">
            De la Idea a la <br className="hidden sm:block" />
            <span className="italic font-light text-muted-foreground">Realidad Digital</span>
          </motion.h2>

          <motion.div variants={itemVariants} className="space-y-6 text-muted-foreground leading-relaxed font-sans text-lg md:text-xl font-light max-w-3xl mx-auto">
            <p>
              Como Ingeniero de Software, mi objetivo es transformar ideas complejas en productos digitales eficientes y escalables. Me especializo en el desarrollo full-stack, con un fuerte enfoque en la arquitectura rigurosa y la optimización del rendimiento.
            </p>
            <p>
              Mi experiencia abarca desde la creación de APIs robustas hasta el diseño de interfaces de usuario minimalistas e interactivas. Disfruto trabajando en proyectos que requieren un alto nivel de detalle técnico, donde la forma sigue estrictamente a la función.
            </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
