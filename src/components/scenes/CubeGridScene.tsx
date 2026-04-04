"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import CubeGrid from "../CubeGrid";

export default function CubeGridScene() {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 5, 5]} />
        <CubeGrid />
      </Suspense>
    </Canvas>
  );
}
