"use client";

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three-stdlib';
import { FilmPass } from 'three-stdlib';

// Extend R3F to recognize these effects
extend({ UnrealBloomPass, FilmPass });

// --- Componente de la Ciudad (Optimizado con InstancedMesh) ---
function City() {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const citySize = 60;
  const buildingCount = citySize * citySize;

  const buildings = useMemo(() => {
    const temp = [];
    for (let i = 0; i < buildingCount; i++) {
      const x = (i % citySize) - citySize / 2;
      const z = Math.floor(i / citySize) - citySize / 2;
      const height = Math.random() * 8 + 1;
      temp.push({ position: new THREE.Vector3(x * 1.2, height / 2, z * 1.2), height });
    }
    return temp;
  }, [buildingCount, citySize]);

  useEffect(() => {
    const tempObject = new THREE.Object3D();
    for (let i = 0; i < buildingCount; i++) {
      tempObject.position.copy(buildings[i].position);
      tempObject.scale.set(1, buildings[i].height, 1);
      tempObject.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [buildings, buildingCount]);

  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, buildingCount]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1e1b4b" emissive="#312e81" emissiveIntensity={0.5} roughness={0.3} metalness={0.7} />
    </instancedMesh>
  );
}

// --- Componente del Tráfico ---
function Traffic() {
  const count = 100;
  const curves = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const start = new THREE.Vector3((Math.random() - 0.5) * 70, 0.1, (Math.random() - 0.5) * 70);
      const end = start.clone().add(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20));
      const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0, (Math.random() - 0.5) * 10));
      temp.push(new THREE.QuadraticBezierCurve3(start, mid, end));
    }
    return temp;
  }, []);

  return (
    <group>
      {curves.map((curve, i) => (
        <TrafficParticle key={i} curve={curve} />
      ))}
    </group>
  );
}

function TrafficParticle({ curve }: { curve: THREE.QuadraticBezierCurve3 }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => Math.random() * 0.1 + 0.02, []);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * speed) % 1;
    curve.getPoint(t, ref.current.position);
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.2, 0.1, 0.5]} />
      <meshBasicMaterial color="#ef4444" toneMapped={false} />
    </mesh>
  );
}

// --- Escena Principal ---
export default function UrbanScene() {
  return (
    <Canvas camera={{ position: [0, 30, 40], fov: 60 }}>
      <color attach="background" args={['#0a0a0a']} />
      <fog attach="fog" args={['#0a0a0a', 30, 100]} />
      
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 50, 0]} intensity={0.8} color="#8b5cf6" />
      <directionalLight position={[-10, 10, 5]} intensity={0.2} color="#ffffff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.4} />
      </mesh>

      <City />
      <Traffic />

      <OrbitControls 
        autoRotate 
        autoRotateSpeed={0.2} 
        enablePan={false} 
        minDistance={15} 
        maxDistance={60} 
        maxPolarAngle={Math.PI / 2.1}
      />
      
      <Effects>
        <unrealBloomPass args={[undefined, 0.5, 1, 0]} />
        <filmPass args={[0.1, 0.2, 1500, false]} />
      </Effects>
    </Canvas>
  );
}
