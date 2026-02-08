"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// --- TIPOS Y ESTADO GLOBAL ---
type ShipType = 'assault' | 'scavenger';
interface Ship {
  id: string;
  type: ShipType;
  position: THREE.Vector3;
  target: THREE.Vector3 | null;
  energy: number;
}
interface Asteroid {
  id: string;
  position: THREE.Vector3;
  size: number;
}

// --- COMPONENTES VISUALES (SIN LÓGICA DE JUEGO) ---
const MotherShip = () => (
  <Float speed={1} rotationIntensity={0.2} floatIntensity={1}>
    <mesh rotation={[0, Math.PI / 4, 0]}>
      <octahedronGeometry args={[2, 0]} />
      <meshStandardMaterial color="#ec4899" emissive="#ec4899" wireframe />
    </mesh>
  </Float>
);

const DroneMesh = ({ type }: { type: ShipType }) => (
  <mesh>
    <coneGeometry args={[0.2, 0.5, 3]} />
    <meshStandardMaterial color={type === 'assault' ? '#f472b6' : '#a78bfa'} wireframe />
  </mesh>
);

const AsteroidMesh = ({ size }: { size: number }) => (
  <mesh>
    <icosahedronGeometry args={[size, 0]} />
    <meshStandardMaterial color="#a855f7" wireframe />
  </mesh>
);

// --- COMPONENTE DE LÓGICA PRINCIPAL (DENTRO DEL CANVAS) ---
function GameLogic() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [resources, setResources] = useState(100);

  // Exponer la función para añadir naves al componente padre
  useEffect(() => {
    const addShip = (type: ShipType) => {
      const cost = 50;
      if (resources >= cost) {
        setResources(r => r - cost);
        const newShip: Ship = {
          id: `s-${Date.now()}`,
          type,
          position: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0),
          target: null,
          energy: 100,
        };
        setShips(s => [...s, newShip]);
      }
    };
    // @ts-ignore
    window.addShip = addShip;
    // @ts-ignore
    window.getResources = () => resources;
  }, [resources]);

  // Generar asteroides
  useFrame(() => {
    if (Math.random() > 0.98 && asteroids.length < 15) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 20;
      const z = -50;
      setAsteroids(prev => [...prev, { id: `a-${Date.now()}`, position: new THREE.Vector3(x, y, z), size: Math.random() * 1 + 0.5 }]);
    }
  });

  // Lógica de IA y movimiento
  useFrame((_, delta) => {
    setShips(currentShips =>
      currentShips.map(ship => {
        let newPosition = ship.position.clone();
        let newTarget = ship.target;

        if (ship.target) {
          const direction = ship.target.clone().sub(ship.position).normalize();
          newPosition.add(direction.multiplyScalar(delta * 5));
          if (ship.position.distanceTo(ship.target) < 1) {
            newTarget = null; // Volver a IDLE
          }
        } else {
          // Volver a la nodriza
          const direction = new THREE.Vector3(0,0,0).sub(ship.position).normalize();
          newPosition.add(direction.multiplyScalar(delta * 3));
          
          // Buscar nuevo objetivo si está en modo asalto
          if (ship.type === 'assault') {
            const closestAsteroid = [...asteroids].sort((a, b) => a.position.z - b.position.z)[0];
            if (closestAsteroid) {
              newTarget = closestAsteroid.position;
            }
          }
        }
        return { ...ship, position: newPosition, target: newTarget };
      })
    );
  });

  return (
    <>
      {ships.map(ship => (
        <group key={ship.id} position={ship.position}>
          <DroneMesh type={ship.type} />
        </group>
      ))}
      {asteroids.map(a => (
        <group key={a.id} position={a.position}>
          <AsteroidMesh size={a.size} />
        </group>
      ))}
    </>
  );
}

// --- ESCENA PRINCIPAL ---
export default function GameScene() {
  return (
    <>
      <div className="absolute top-20 left-6 z-20 p-4 bg-black/50 backdrop-blur-sm border border-pink-900/50 rounded-lg text-sm space-y-4">
        <h3 className="font-bold text-white">PANEL DE CONTROL</h3>
        <div className="flex justify-between"><span>RECURSOS:</span><span>{/* Se actualizará desde el componente de lógica */}</span></div>
        <button onClick={() => (window as any).addShip('assault')} className="w-full text-left p-2 bg-pink-900/20 hover:bg-pink-900/40 rounded">CONSTRUIR ASALTO (50)</button>
        <button disabled className="w-full text-left p-2 bg-purple-900/20 rounded opacity-50">CONSTRUIR SCAVENGER (75)</button>
      </div>

      <Canvas camera={{ position: [0, 5, 25], fov: 60 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 10]} color="#ec4899" intensity={2} />
        <Stars radius={100} count={2000} factor={5} fade speed={2} />
        
        <MotherShip />
        <GameLogic />
      </Canvas>
    </>
  );
}
