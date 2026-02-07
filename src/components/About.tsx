"use client";
import { motion } from "framer-motion";
import { BrainCircuit, Rowing, Languages, Database, Code } from "lucide-react";

const skills = [
  { name: "Next.js", icon: <Code /> },
  { name: "React", icon: <Code /> },
  { name: "TypeScript", icon: <Code /> },
  { name: "Tailwind CSS", icon: <Code /> },
  { name: "Framer Motion", icon: <Code /> },
  { name: "Three.js", icon: <Code /> },
  { name: "MongoDB", icon: <Database /> },
  { name: "SQL", icon: <Database /> },
];

const SkillBadge = ({ name, icon }: { name: string, icon: React.ReactNode }) => (
  <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-md border border-border">
    {icon}
    <span className="font-mono text-sm">{name}</span>
  </div>
);

export default function About() {
  return (
    <section id="about" className="py-24 px-4 bg-card">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Columna de Texto */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-6">Sobre Mí</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Soy un desarrollador de software con una doble vida: por un lado, un <span className="text-foreground font-semibold">ingeniero</span> apasionado por construir sistemas precisos y soluciones tecnológicas elegantes; por otro, un <span className="text-foreground font-semibold">deportista de alto rendimiento</span> que entiende el valor de la disciplina, la estrategia y el trabajo en equipo.
            </p>
            <p>
              Mi experiencia como <span className="text-foreground">entrenador y árbitro de piragüismo</span> me ha enseñado a liderar, comunicar con claridad y tomar decisiones bajo presión. Estas habilidades, combinadas con mi formación técnica, me permiten abordar los desafíos del desarrollo de software con una perspectiva única y un enfoque implacable en el resultado.
            </p>
          </div>
        </motion.div>

        {/* Columna de Habilidades */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BrainCircuit /> Stack Tecnológico</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => <SkillBadge key={skill.name} {...skill} />)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">* Incluye las tecnologías usadas para construir esta web.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Languages /> Idiomas</h3>
            <div className="flex flex-wrap gap-2">
              <SkillBadge name="Inglés (C1 Certificado)" icon={<></>} />
              <SkillBadge name="Alemán (A1)" icon={<></>} />
              <SkillBadge name="Francés (A1)" icon={<></>} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
