"use client";

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- Componente para los Edificios ---
function Buildings() {
  const citySize = 50;
  const buildingCount = citySize * citySize;

  const buildings = useMemo(() => {
    const temp = [];
    for (let i = 0; i < buildingCount; i++) {
      const x = (i % citySize) - citySize / 2;
      const z = Math.floor(i / citySize) - citySize / 2;
      const height = Math.random() * 5 + 0.1;
      temp.push({ x, z, height });
    }
    return temp;
  }, [buildingCount, citySize]);

  return (
    <group>
      {buildings.map((building, i) => (
        <mesh key={i} position={[building.x * 1.2, building.height / 2, building.z * 1.2]}>
          <boxGeometry args={[1, building.height, 1]} />
          <meshStandardMaterial color="#1e1b4b" emissive="#312e81" emissiveIntensity={0.5} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// --- Componente de Tráfico (CORREGIDO Y ROBUSTO) ---
function TrafficParticle({ initialPosition, direction }: { initialPosition: THREE.Vector3, direction: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => Math.random() * 0.1 + 0.05, []);
  const pathLength = 10;

  useFrame(({ clock }) => {
    if (ref.current) {
      // Mover la partícula a lo largo de la dirección y resetear
      const progress = (clock.getElapsedTime() * speed) % pathLength;
      ref.current.position.copy(initialPosition).addScaledVector(direction, progress);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={Math.random() > 0.1 ? "#ef4444" : "#f59e0b"} toneMapped={false} />
    </mesh>
  );
}

function Traffic() {
  const count = 200;
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const pos = new THREE.Vector3((Math.random() - 0.5) * 60, 0.1, (Math.random() - 0.5) * 60);
      const dir = Math.random() > 0.5 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
      temp.push({ id: i, position: pos, direction: dir });
    }
    return temp;
  }, []);

  return (
    <group>
      {particles.map((particle) => (
        <TrafficParticle key={particle.id} initialPosition={particle.position} direction={particle.direction} />
      ))}
    </group>
  );
}

// --- Escena Principal ---
export default function UrbanScene() {
  return (
    <Canvas camera={{ position: [20, 20, 20], fov: 50 }}>
      <color attach="background" args={['#0c0a09']} />
      <fog attach="fog" args={['#0c0a09', 20, 80]} />
      
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 30, 0]} intensity={0.5} color="#8b5cf6" />

      <Buildings />
      <Traffic />

      <OrbitControls 
        autoRotate 
        autoRotateSpeed={0.3} 
        enablePan={false} 
        minDistance={10} 
        maxDistance={50} 
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
