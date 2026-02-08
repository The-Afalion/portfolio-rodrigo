"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Text, Float } from '@react-three/drei';
import { useRef, useState } from 'react';
import { PROYECTOS_CORE } from '@/datos/proyectos';
import * as THREE from 'three';

function ProjectPlanet({ project }: { project: typeof PROYECTOS_CORE[0] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2; // Rotación constante
    }
  });

  return (
    <group position={project.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* El Planeta */}
        <mesh
          ref={meshRef}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
          scale={hovered ? 1.2 : 1}
        >
          <icosahedronGeometry args={[1, 1]} /> {/* Forma geométrica "low-poly" */}
          <meshStandardMaterial 
            color={project.color} 
            wireframe={true} // Estilo "wireframe" técnico
            emissive={project.color}
            emissiveIntensity={hovered ? 2 : 0.5}
          />
        </mesh>

        {/* Núcleo brillante interno */}
        <mesh scale={0.8}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={project.color} transparent opacity={0.2} />
        </mesh>
      </Float>

      {/* Texto Flotante */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/GeistMono-Regular.ttf" // Asegúrate de tener una fuente o usa la default
      >
        {project.title}
      </Text>
      
      {hovered && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.15}
          color="#aaaaaa"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
          textAlign="center"
        >
          {project.description}
        </Text>
      )}
    </group>
  );
}

export default function GalaxyScene() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      <color attach="background" args={['#050505']} />
      
      {/* Iluminación */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Fondo Estelar */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Proyectos */}
      {PROYECTOS_CORE.map((project) => (
        <ProjectPlanet key={project.id} project={project} />
      ))}

      {/* Controles */}
      <OrbitControls enableZoom={true} enablePan={true} autoRotate={true} autoRotateSpeed={0.5} />
    </Canvas>
  );
}
