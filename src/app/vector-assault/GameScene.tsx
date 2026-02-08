"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// --- Componente de la Nave ---
function PlayerShip() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      // La nave sigue al ratón
      ref.current.position.lerp(new THREE.Vector3(state.mouse.x * 10, state.mouse.y * 5, 0), 0.1);
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <coneGeometry args={[0.5, 2, 3]} />
      <meshStandardMaterial color="#ec4899" emissive="#ec4899" wireframe />
    </mesh>
  );
}

// --- Componente de los Asteroides ---
function Asteroid({ position, size, onExplode }: { position: THREE.Vector3, size: number, onExplode: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.z += delta * 10; // Se mueven hacia el jugador
      ref.current.rotation.x += delta * 0.5;
      ref.current.rotation.y += delta * 0.5;
      if (ref.current.position.z > 10) {
        onExplode(); // Desaparece si pasa de largo
      }
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color="#a855f7" wireframe />
    </mesh>
  );
}

// --- Componente de los Disparos ---
function Laser({ position }: { position: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.z -= delta * 50; // Se mueven hacia adelante
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.1, 0.1, 2]} />
      <meshBasicMaterial color="#f472b6" />
    </mesh>
  );
}

// --- Lógica Principal del Juego ---
export default function GameScene() {
  const [lasers, setLasers] = useState<any[]>([]);
  const [asteroids, setAsteroids] = useState<any[]>([]);
  const playerShipRef = useRef<THREE.Group>(null);

  // Generar asteroides periódicamente
  useFrame((state) => {
    if (Math.random() > 0.98 && asteroids.length < 20) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 10;
      const z = -50;
      setAsteroids(prev => [...prev, { id: Date.now(), position: new THREE.Vector3(x, y, z), size: Math.random() * 1 + 0.5 }]);
    }
  });

  // Detección de colisiones
  useFrame(() => {
    const scoreEl = document.getElementById('score');
    lasers.forEach(laser => {
      asteroids.forEach(asteroid => {
        if (laser.position.distanceTo(asteroid.position) < asteroid.size) {
          // Colisión!
          setLasers(l => l.filter(l_ => l_.id !== laser.id));
          setAsteroids(a => a.filter(a_ => a_.id !== asteroid.id));
          if (scoreEl) {
            scoreEl.innerText = (parseInt(scoreEl.innerText) + 100).toString();
          }
        }
      });
    });
  });

  const shoot = (e: MouseEvent) => {
    const playerPosition = new THREE.Vector3();
    // Simulación simple de la posición del jugador (no es precisa pero funciona para la demo)
    playerPosition.set(e.clientX / window.innerWidth * 20 - 10, -(e.clientY / window.innerHeight * 10 - 5), 0);
    setLasers(prev => [...prev, { id: Date.now(), position: playerPosition }]);
  };

  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 75 }} onClick={shoot}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 10]} color="#ec4899" intensity={2} />
      <Stars radius={100} count={2000} factor={5} fade speed={2} />
      
      <group ref={playerShipRef}>
        <PlayerShip />
      </group>

      {lasers.map(l => <Laser key={l.id} position={l.position} />)}
      {asteroids.map(a => (
        <Asteroid 
          key={a.id} 
          position={a.position} 
          size={a.size} 
          onExplode={() => setAsteroids(as => as.filter(as_ => as_.id !== a.id))}
        />
      ))}
    </Canvas>
  );
}
