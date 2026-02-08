"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// --- TIPOS Y ESTADO GLOBAL (SIMPLIFICADO) ---
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
interface Resource {
  id: string;
  position: THREE.Vector3;
}

// --- COMPONENTES DEL JUEGO ---

function MotherShip() {
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={1}>
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" wireframe />
      </mesh>
    </Float>
  );
}

function Drone({ ship, onUpdate }: { ship: Ship, onUpdate: (id: string, updates: Partial<Ship>) => void }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Lógica de IA simple
    if (ship.target) {
      const direction = ship.target.clone().sub(ref.current.position).normalize();
      ref.current.position.add(direction.multiplyScalar(delta * 5));
      
      // Si llega al objetivo
      if (ref.current.position.distanceTo(ship.target) < 1) {
        onUpdate(ship.id, { target: null }); // Volver a estado IDLE
      }
    } else {
      // Volver a la nave nodriza si no hay objetivo
      const direction = new THREE.Vector3(0,0,0).sub(ref.current.position).normalize();
      ref.current.position.add(direction.multiplyScalar(delta * 3));
    }
  });

  return (
    <group ref={ref} position={ship.position}>
      <mesh>
        <coneGeometry args={[0.2, 0.5, 3]} />
        <meshStandardMaterial color={ship.type === 'assault' ? '#f472b6' : '#a78bfa'} wireframe />
      </mesh>
    </group>
  );
}

// --- ESCENA PRINCIPAL Y LÓGICA DE GESTIÓN ---
export default function GameScene() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [resources, setResources] = useState(100);

  // Generar asteroides
  useFrame(() => {
    if (Math.random() > 0.98 && asteroids.length < 15) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 20;
      const z = -50;
      setAsteroids(prev => [...prev, { id: `a-${Date.now()}`, position: new THREE.Vector3(x, y, z), size: Math.random() * 1 + 0.5 }]);
    }
  });

  // Lógica de IA principal
  useEffect(() => {
    const interval = setInterval(() => {
      setShips(currentShips => 
        currentShips.map(ship => {
          if (ship.target) return ship; // Ya tiene una tarea

          if (ship.type === 'assault') {
            const closestAsteroid = [...asteroids].sort((a, b) => a.position.z - b.position.z)[0];
            if (closestAsteroid) {
              return { ...ship, target: closestAsteroid.position };
            }
          }
          return ship;
        })
      );
    }, 1000); // Cada segundo, las naves buscan nuevas tareas

    return () => clearInterval(interval);
  }, [asteroids]);

  const updateShip = (id: string, updates: Partial<Ship>) => {
    setShips(s => s.map(ship => ship.id === id ? { ...ship, ...updates } : ship));
  };

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

  return (
    <>
      <div className="absolute top-20 left-6 z-20 p-4 bg-black/50 backdrop-blur-sm border border-pink-900/50 rounded-lg text-sm space-y-4">
        <h3 className="font-bold text-white">PANEL DE CONTROL</h3>
        <div className="flex justify-between"><span>RECURSOS:</span><span>{resources}</span></div>
        <button onClick={() => addShip('assault')} className="w-full text-left p-2 bg-pink-900/20 hover:bg-pink-900/40 rounded">CONSTRUIR ASALTO (50)</button>
        <button disabled className="w-full text-left p-2 bg-purple-900/20 rounded opacity-50">CONSTRUIR SCAVENGER (75)</button>
      </div>

      <Canvas camera={{ position: [0, 5, 25], fov: 60 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 10]} color="#ec4899" intensity={2} />
        <Stars radius={100} count={2000} factor={5} fade speed={2} />
        
        <MotherShip />
        {ships.map(ship => <Drone key={ship.id} ship={ship} onUpdate={updateShip} />)}
        {asteroids.map(a => (
          <mesh key={a.id} position={a.position}>
            <icosahedronGeometry args={[a.size, 0]} />
            <meshStandardMaterial color="#a855f7" wireframe />
          </mesh>
        ))}
      </Canvas>
    </>
  );
}
