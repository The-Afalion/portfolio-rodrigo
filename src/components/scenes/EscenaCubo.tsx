"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Loader } from "@react-three/drei";
import RejillaDeCubos from "../RejillaDeCubos";

export default function EscenaCubo() {
  return (
    <>
      <Canvas>
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <directionalLight position={[5, 5, 5]} />
          <RejillaDeCubos />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}
