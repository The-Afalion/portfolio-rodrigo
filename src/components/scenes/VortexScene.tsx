"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Vortex from "../Vortex";

export default function VortexScene() {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Vortex />
      </Suspense>
    </Canvas>
  );
}
