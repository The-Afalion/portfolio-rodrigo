"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage } from "@react-three/drei";

// Componente interno que carga el modelo
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// Componente principal del visor
export default function GLTFModel({ modelUrl }: { modelUrl: string }) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.6}>
          <Model url={modelUrl} />
        </Stage>
      </Suspense>
      <OrbitControls autoRotate />
    </Canvas>
  );
}
