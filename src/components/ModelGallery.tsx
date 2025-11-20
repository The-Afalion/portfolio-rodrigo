"use client";
import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, TorusKnot, Icosahedron } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import KayakerModel from "./KayakerModel"; // Importamos el nuevo modelo

// --- Lista de modelos, incluyendo el nuevo piragüista ---
const placeholders = [
  { 
    name: "Piragüista de Slalom", 
    component: <KayakerModel />
  },
  { 
    name: "Nudo Toroidal", 
    component: <TorusKnot args={[1.5, 0.5, 128, 16]}><meshStandardMaterial color="#3b82f6" /></TorusKnot> 
  },
  { 
    name: "Icosaedro", 
    component: <Icosahedron args={[2, 0]}><meshStandardMaterial color="#8b5cf6" /></Icosahedron> 
  },
  { 
    name: "Nudo Detallado", 
    component: <TorusKnot args={[1.5, 0.2, 256, 32]}><meshStandardMaterial color="#10b981" /></TorusKnot> 
  },
  { 
    name: "Geosfera", 
    component: <Icosahedron args={[2, 1]}><meshStandardMaterial flatShading color="#f59e0b" /></Icosahedron> 
  },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export default function ModelGallery() {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const modelIndex = ((page % placeholders.length) + placeholders.length) % placeholders.length;
  const currentModel = placeholders[modelIndex];

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute w-full h-full"
        >
          <div className="w-full h-full bg-secondary rounded-lg border border-border flex flex-col overflow-hidden">
            <div className="flex-grow">
              <Canvas shadows camera={{ fov: 50, position: [0, 5, 10] }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                <Suspense fallback={null}>{currentModel.component}</Suspense>
                <OrbitControls autoRotate />
              </Canvas>
            </div>
            <h3 className="text-center font-mono p-4">{currentModel.name}</h3>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Botones de Navegación */}
      <button
        className="absolute top-1/2 -translate-y-1/2 left-4 bg-background/50 p-2 rounded-full hover:bg-accent z-10"
        onClick={() => paginate(-1)}
      >
        <ArrowLeft />
      </button>
      <button
        className="absolute top-1/2 -translate-y-1/2 right-4 bg-background/50 p-2 rounded-full hover:bg-accent z-10"
        onClick={() => paginate(1)}
      >
        <ArrowRight />
      </button>
    </div>
  );
}
