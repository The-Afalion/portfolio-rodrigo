"use client";
import * as THREE from "three";
import { useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

// El tipo de las props de nuestro material, para usarlo en la referencia
type VortexMaterialImpl = THREE.ShaderMaterial & {
  uTime: number;
  uMouse: THREE.Vector2;
};

const VortexMaterial = shaderMaterial(
  {
    uTime: 0,
    uFrequency: 5.0,
    uAmplitude: 0.2,
    uColor: new THREE.Color("#3B82F6"),
    uMouse: new THREE.Vector2(0, 0),
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uFrequency;
    uniform float uAmplitude;
    uniform vec2 uMouse;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 newPosition = position;
      float dist = distance(uv, vec2(0.5));
      float mouseEffect = smoothstep(0.1, 0.5, distance(uv, uMouse));
      newPosition.z += sin(dist * uFrequency - uTime) * uAmplitude * mouseEffect;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      float dist = distance(vUv, vec2(0.5));
      float strength = smoothstep(0.5, 0.0, dist);
      vec3 color = mix(vec3(0.0), uColor, strength);
      gl_FragColor = vec4(color, strength);
    }
  `
);

extend({ VortexMaterial });

export default function Vortex() {
  const materialRef = useRef<VortexMaterialImpl>(null!);

  useFrame(({ clock, mouse }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
      materialRef.current.uMouse.x = (mouse.x + 1) / 2;
      materialRef.current.uMouse.y = (mouse.y + 1) / 2;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20, 128, 128]} />
      <vortexMaterial ref={materialRef} transparent={true} />
    </mesh>
  );
}
