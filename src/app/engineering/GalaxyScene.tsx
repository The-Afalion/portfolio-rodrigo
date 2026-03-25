"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Text, Float } from '@react-three/drei';
import { useRef, useState } from 'react';
import { PROYECTOS_CORE } from '@/datos/proyectos';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

function CentralCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshStandardMaterial 
          color="#fcd34d" 
          emissive="#f59e0b" 
          emissiveIntensity={2} 
          wireframe={true} 
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      <pointLight color="#f59e0b" intensity={2} distance={50} decay={2} />
    </group>
  );
}

function ProjectPlanet({ project, index, total }: { project: typeof PROYECTOS_CORE[0], index: number, total: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const router = useRouter();

  // Orbital parameters
  const orbitRadius = 4 + index * 1.5;
  const orbitSpeed = 0.5 + (total - index) * 0.1;
  const initialAngle = (index / total) * Math.PI * 2 * 3; // spread out

  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * (hovered ? 1.5 : 0.5);
      planetRef.current.rotation.x += delta * 0.2;
    }
    
    if (groupRef.current) {
      if (!hovered) {
        // Obita dinámica
        const time = state.clock.getElapsedTime();
        const currentAngle = initialAngle + time * orbitSpeed * 0.1;
        groupRef.current.position.x = Math.cos(currentAngle) * orbitRadius;
        groupRef.current.position.z = Math.sin(currentAngle) * orbitRadius;
        
        // Pequeña oscilación vertical
        groupRef.current.position.y = Math.sin(time * 0.5 + index) * 1.5;
      }
    }
  });

  const handleClick = () => {
    document.body.style.cursor = 'auto'; // Reset cursor
    router.push(project.link);
  };

  return (
    <>
      {/* Anillo orbital (trayectoria base) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} />
        <meshBasicMaterial color={project.color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      <group ref={groupRef} position={[Math.cos(initialAngle) * orbitRadius, 0, Math.sin(initialAngle) * orbitRadius]}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh
            ref={planetRef}
            onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
            onClick={handleClick}
            scale={hovered ? 1.4 : 1}
          >
            {/* Variedad de geometría dependiendo del índice */}
            {index % 2 === 0 ? <torusGeometry args={[0.8, 0.4, 16, 32]} /> : <icosahedronGeometry args={[1, 1]} />}
            <meshStandardMaterial 
              color={project.color} 
              wireframe={true}
              emissive={project.color}
              emissiveIntensity={hovered ? 2 : 0.8}
            />
          </mesh>

          {/* Núcleo interno */}
          <mesh scale={index % 2 === 0 ? 0.6 : 0.8} onClick={handleClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={project.color} transparent opacity={0.3} />
          </mesh>

          {/* Anillos extra visuales al hacer hover en algunos formatos */}
          {hovered && index % 3 === 0 && (
             <mesh rotation={[Math.PI / 2, 0, 0]}>
               <torusGeometry args={[1.5, 0.05, 16, 100]} />
               <meshBasicMaterial color={project.color} />
             </mesh>
          )}
        </Float>

        <Text
          position={[0, 1.8, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {project.title}
        </Text>
        
        {hovered && (
          <Text
            position={[0, -1.8, 0]}
            fontSize={0.25}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
            maxWidth={4}
            textAlign="center"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {project.description}
          </Text>
        )}
      </group>
    </>
  );
}

export default function GalaxyScene() {
  return (
    <Canvas camera={{ position: [0, 12, 30], fov: 60 }}>
      <color attach="background" args={['#020205']} />
      <ambientLight intensity={0.2} />
      
      {/* Polvo estelar abundante */}
      <Stars radius={150} depth={50} count={10000} factor={6} saturation={1} fade speed={1.5} />
      
      <CentralCore />

      {PROYECTOS_CORE.map((project, index) => (
        <ProjectPlanet key={project.id} project={project} index={index} total={PROYECTOS_CORE.length} />
      ))}
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        autoRotate={true} 
        autoRotateSpeed={0.3} 
        maxDistance={60}
        minDistance={5}
        maxPolarAngle={Math.PI / 2 + 0.1} // Evitar ir demasiado abajo del plano
      />
    </Canvas>
  );
}
