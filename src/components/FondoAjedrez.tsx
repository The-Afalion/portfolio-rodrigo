"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Brain, Swords, Shield, Target } from "lucide-react";

const piezas = [
  { Icono: Brain, top: "10%", left: "15%", tamano: 200 },
  { Icono: Swords, top: "50%", left: "80%", tamano: 250 },
  { Icono: Shield, top: "70%", left: "10%", tamano: 180 },
  { Icono: Target, top: "20%", left: "75%", tamano: 190 },
];

export default function FondoAjedrez() {
  const ratonX = useMotionValue(0);
  const ratonY = useMotionValue(0);

  function gestionarMovimientoRaton(evento: React.MouseEvent) {
    if (typeof window !== "undefined") {
      ratonX.set(evento.clientX);
      ratonY.set(evento.clientY);
    }
  };

  return (
    <div
      onMouseMove={gestionarMovimientoRaton}
      className="absolute inset-0 z-[-1] overflow-hidden"
    >
      {piezas.map(({ Icono, top, left, tamano }, i) => {
        const x = useTransform(ratonX, (valor) => (typeof window !== "undefined" ? (valor - window.innerWidth / 2) / (20 + i * 5) : 0));
        const y = useTransform(ratonY, (valor) => (typeof window !== "undefined" ? (valor - window.innerHeight / 2) / (20 + i * 5) : 0));

        return (
          <motion.div
            key={i}
            className="absolute text-foreground/5"
            style={{ top, left, x, y }}
          >
            <Icono size={tamano} strokeWidth={0.5} />
          </motion.div>
        );
      })}
    </div>
  );
}
