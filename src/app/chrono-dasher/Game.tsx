"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Effects } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// --- Componente de la Nave ---
function PlayerShip() {
  const ref = useRef<THREE.Group>(null);
  const [targetX, setTargetX] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setTargetX(x => Math.max(x - 5, -10));
      if (e.key === 'ArrowRight') setTargetX(x => Math.min(x + 5, 10));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      // Movimiento lateral suave (lerp)
      ref.current.position.x += (targetX - ref.current.position.x) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[0.5, 2, 4]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" wireframe />
      </mesh>
    </group>
  );
}

// --- Componente del Túnel ---
function Tunnel() {
  const count = 50;
  const rings = useMemo(() => Array.from({ length: count }, (_, i) => i), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Mover el túnel hacia el jugador para simular avance
      groupRef.current.position.z += delta * 20;
      if (groupRef.current.position.z > 20) {
        groupRef.current.position.z = 0;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {rings.map(i => (
        <mesh key={i} position={[0, 0, -i * 20]}>
          <ringGeometry args={[15, 15.1, 32]} />
          <meshBasicMaterial color="#f97316" side={THREE.DoubleSide} wireframe />
        </mesh>
      ))}
    </group>
  );
}

// --- Lógica Principal del Juego ---
export default function Game() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');

  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setGameState(current => (current === 'idle' || current === 'gameOver' ? 'playing' : current));
        const statusEl = document.getElementById('game-status');
        if (statusEl) statusEl.style.display = 'none';
      }
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} color="#f97316" intensity={5} />
      
      <Stars radius={200} depth={50} count={5000} factor={10} saturation={0} fade speed={2} />

      {gameState === 'playing' && (
        <>
          <PlayerShip />
          <Tunnel />
        </>
      )}

      <Effects>
        <unrealBloomPass args={[undefined, 1.5, 1, 0]} />
      </Effects>
    </Canvas>
  );
}
