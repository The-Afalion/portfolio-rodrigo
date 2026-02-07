"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { Vector2 } from "three";

// --- Shader Material para el Vórtice ---
const VortexMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new Vector2(0.5, 0.5),
    uResolution: new Vector2(1, 1),
  },
  // Vertex Shader
  `
    uniform float uTime;
    varying float vProgress;

    void main() {
      vProgress = sin(position.z * 0.1 + uTime * 0.5);
      vec3 p = position;
      p.z += sin(p.x * 2.0 + uTime) * 0.5;
      p.z += cos(p.y * 2.0 + uTime) * 0.5;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = 10.0 * (1.0 / -p.z);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    varying float vProgress;

    void main() {
      float alpha = sin(vProgress * 3.1415);
      gl_FragColor = vec4(vec3(0.5, 0.8, 1.0) * vProgress, alpha);
    }
  `
);

extend({ VortexMaterial });

// Definición de tipo para el material extendido
type VortexMaterialImpl = {
  uTime: number;
  uMouse: Vector2;
  uResolution: Vector2;
} & JSX.IntrinsicElements["shaderMaterial"];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      vortexMaterial: VortexMaterialImpl;
    }
  }
}

// --- Componente de la Escena 3D ---
function VortexScene() {
  const pointsRef = useRef<any>();
  const materialRef = useRef<VortexMaterialImpl>(null!);

  const sphere = random.inSphere(new Float32Array(5000), { radius: 1.5 });

  useFrame(({ clock, mouse }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
      materialRef.current.uMouse.x = (mouse.x + 1) / 2;
      materialRef.current.uMouse.y = (mouse.y + 1) / 2;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.x = -mouse.y * 0.1;
      pointsRef.current.rotation.y = -mouse.x * 0.1;
    }
  });

  return (
    <Points ref={pointsRef} positions={sphere} stride={3} frustumCulled={false}>
      <vortexMaterial ref={materialRef} attach="material" depthWrite={false} />
    </Points>
  );
}

// --- Componente Principal que envuelve el Canvas ---
export default function Vortex({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 2] }}>
        <VortexScene />
      </Canvas>
    </div>
  );
}
