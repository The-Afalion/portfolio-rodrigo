"use client";

import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, TorusKnot, Icosahedron } from "@react-three/drei";
import { ArrowLeft, ArrowRight } from "lucide-react";
import KayakerModel from "./KayakerModel";

const placeholders = [
  {
    name: "Piragüista de Slalom",
    component: <KayakerModel />,
  },
  {
    name: "Nudo Toroidal",
    component: (
      <TorusKnot args={[1.5, 0.5, 128, 16]}>
        <meshStandardMaterial color="#3b82f6" />
      </TorusKnot>
    ),
  },
  {
    name: "Icosaedro",
    component: (
      <Icosahedron args={[2, 0]}>
        <meshStandardMaterial color="#8b5cf6" />
      </Icosahedron>
    ),
  },
  {
    name: "Nudo Detallado",
    component: (
      <TorusKnot args={[1.5, 0.2, 256, 32]}>
        <meshStandardMaterial color="#10b981" />
      </TorusKnot>
    ),
  },
  {
    name: "Geosfera",
    component: (
      <Icosahedron args={[2, 1]}>
        <meshStandardMaterial flatShading color="#f59e0b" />
      </Icosahedron>
    ),
  },
];

export default function ModelGallery() {
  const [page, setPage] = useState(0);

  const paginate = (direction: number) => {
    setPage((current) => current + direction);
  };

  const modelIndex = ((page % placeholders.length) + placeholders.length) % placeholders.length;
  const currentModel = placeholders[modelIndex];

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-secondary">
        <div className="h-[calc(100%-4rem)] w-full">
          <Canvas shadows camera={{ fov: 50, position: [0, 5, 10] }} dpr={[1, 1.5]}>
            <ambientLight intensity={0.28} />
            <pointLight position={[10, 10, 10]} intensity={0.45} />
            <pointLight position={[-10, -10, -10]} intensity={0.22} />
            <directionalLight position={[0, 10, 0]} intensity={0.65} castShadow />

            <Suspense fallback={null}>{currentModel.component}</Suspense>
            <OrbitControls autoRotate autoRotateSpeed={1.2} />
          </Canvas>
        </div>
        <h3 className="p-4 text-center font-mono">{currentModel.name}</h3>
      </div>

      <button
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/60 p-2 backdrop-blur transition-colors hover:bg-accent"
        onClick={() => paginate(-1)}
        aria-label="Modelo anterior"
      >
        <ArrowLeft />
      </button>
      <button
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/60 p-2 backdrop-blur transition-colors hover:bg-accent"
        onClick={() => paginate(1)}
        aria-label="Modelo siguiente"
      >
        <ArrowRight />
      </button>
    </div>
  );
}
