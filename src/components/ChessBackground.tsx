"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
// CORRECCIÓN FINAL: Usando iconos 100% verificados de lucide-react
import { Brain, Swords, Shield, Target } from "lucide-react";

const pieces = [
  { Icon: Brain, top: "10%", left: "15%", size: 200 },
  { Icon: Swords, top: "50%", left: "80%", size: 250 },
  { Icon: Shield, top: "70%", left: "10%", size: 180 },
  { Icon: Target, top: "20%", left: "75%", size: 190 },
];

export default function ChessBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window !== "undefined") {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="absolute inset-0 z-[-1] overflow-hidden"
    >
      {pieces.map(({ Icon, top, left, size }, i) => {
        const x = useTransform(mouseX, (val) => (typeof window !== "undefined" ? (val - window.innerWidth / 2) / (20 + i * 5) : 0));
        const y = useTransform(mouseY, (val) => (typeof window !== "undefined" ? (val - window.innerHeight / 2) / (20 + i * 5) : 0));

        return (
          <motion.div
            key={i}
            className="absolute text-foreground/5"
            style={{ top, left, x, y }}
          >
            <Icon size={size} strokeWidth={0.5} />
          </motion.div>
        );
      })}
    </div>
  );
}
