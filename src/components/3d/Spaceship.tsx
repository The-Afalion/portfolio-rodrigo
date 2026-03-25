"use client";

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';

export type SpaceshipProps = {
  isSandbox?: boolean;
  hasFuel?: boolean;
  onFlightUpdate?: (isBoosting: boolean, isAccelerating: boolean, delta: number) => void;
  onShoot?: (pos: THREE.Vector3, quat: THREE.Quaternion) => void;
};

export const Spaceship = forwardRef<THREE.Group, SpaceshipProps>(({ isSandbox = false, hasFuel = true, onFlightUpdate, onShoot }, ref) => {
  const internalRef = useRef<THREE.Group>(null);
  const meshRef = (ref as React.MutableRefObject<THREE.Group>) || internalRef;
  
  const engineGlowLeftRef = useRef<THREE.MeshStandardMaterial>(null);
  const engineGlowRightRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const velocity = useRef(0);
  const lastShotTime = useRef(0);
  
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.code]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.code]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const rotSpeed = 1.5 * delta;
    
    // Controles principales 6DOF
    if (keys['ArrowUp']) meshRef.current.rotateX(-rotSpeed);
    if (keys['ArrowDown']) meshRef.current.rotateX(rotSpeed);
    if (keys['ArrowLeft']) meshRef.current.rotateY(rotSpeed);
    if (keys['ArrowRight']) meshRef.current.rotateY(-rotSpeed);
    if (keys['KeyA']) meshRef.current.rotateZ(rotSpeed);
    if (keys['KeyD']) meshRef.current.rotateZ(-rotSpeed);

    const isBoosting = keys['ShiftLeft'] || keys['ShiftRight'];
    const isAccelerating = keys['KeyW'] === true;
    let acceleration = 0;
    
    if (isAccelerating) {
       // Solo acelera si es Sandbox (y tiene fuel) O si NO es Sandbox (ilimitado)
       if (!isSandbox || (isSandbox && hasFuel)) {
         acceleration = isBoosting ? 45 : 20;
       }
    }
    if (keys['KeyS']) {
      acceleration = -15;
    }

    // Call weapon
    if (keys['Space'] && isSandbox && state.clock.elapsedTime - lastShotTime.current > 0.15) {
      if (onShoot) onShoot(meshRef.current.position, meshRef.current.quaternion);
      lastShotTime.current = state.clock.elapsedTime;
    }

    // Aplicar Callback de consumo
    if (isSandbox && onFlightUpdate) {
      onFlightUpdate(isBoosting, isAccelerating, delta);
    }

    // Físicas (Inercia)
    velocity.current += acceleration * delta;
    velocity.current *= 0.98; // Fricción suave
    meshRef.current.translateZ(-velocity.current * delta);

    // Efectos de Reactor Visual
    const glowIntensity = (isAccelerating && (!isSandbox || hasFuel)) ? (isBoosting ? 15 : 5) : 0;
    const glowColor = isBoosting ? "#06b6d4" : "#ef4444"; // Cyan para tubo, Rojo para normal

    if (engineGlowLeftRef.current) {
       engineGlowLeftRef.current.emissiveIntensity = glowIntensity;
       engineGlowLeftRef.current.emissive.set(glowColor);
       engineGlowLeftRef.current.color.set(glowColor);
    }
    if (engineGlowRightRef.current) {
       engineGlowRightRef.current.emissiveIntensity = glowIntensity;
       engineGlowRightRef.current.emissive.set(glowColor);
       engineGlowRightRef.current.color.set(glowColor);
    }

    // Cámara en 3ra Persona
    const idealOffset = new THREE.Vector3(0, 1.2, 3.5);
    idealOffset.applyQuaternion(meshRef.current.quaternion);
    idealOffset.add(meshRef.current.position);
    
    camera.position.lerp(idealOffset, 0.15);
    camera.quaternion.slerp(meshRef.current.quaternion, 0.1);
  });

  return (
    <group ref={meshRef}>
      {/* CUERPO CENTRAL: Diseño Caza Estelar Afilado */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
        <coneGeometry args={[0.3, 2, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* CABINA DE CRISTAL (COCKPIT) */}
      <mesh position={[0, 0.2, 0.1]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 3]}>
        <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.7} toneMapped={false} emissive="#0284c7" emissiveIntensity={1} roughness={0} />
      </mesh>

      {/* ALAS PRINCIPALES (Flecha Invertida para agresividad) */}
      <group position={[0, 0, 0.5]}>
        {/* Ala Izquierda */}
        <mesh position={[-0.8, -0.05, 0]} rotation={[0, -0.4, 0.1]}>
          <boxGeometry args={[1.5, 0.05, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
        {/* Cañón Izquierdo */}
        <mesh position={[-1.4, -0.05, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 1, 8]} />
          <meshStandardMaterial color="#334155" metalness={1} />
        </mesh>
        
        {/* Ala Derecha */}
        <mesh position={[0.8, -0.05, 0]} rotation={[0, 0.4, -0.1]}>
          <boxGeometry args={[1.5, 0.05, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
        {/* Cañón Derecho */}
        <mesh position={[1.4, -0.05, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 1, 8]} />
          <meshStandardMaterial color="#334155" metalness={1} />
        </mesh>
      </group>

      {/* ALERONES TRASEROS (Estabilizadores Verticales Gemelos) */}
      <mesh position={[-0.2, 0.4, 0.8]} rotation={[0.2, 0, 0.3]}>
        <boxGeometry args={[0.05, 0.8, 0.4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.2, 0.4, 0.8]} rotation={[0.2, 0, -0.3]}>
        <boxGeometry args={[0.05, 0.8, 0.4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* MOTORES DUALES (Reactores gemelos de Plasma) */}
      {/* Reactor Izquierdo */}
      <group position={[-0.3, 0, 1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.4, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
          <meshStandardMaterial ref={engineGlowLeftRef} color="#ef4444" toneMapped={false} emissive="#ef4444" emissiveIntensity={0} />
        </mesh>
      </group>

      {/* Reactor Derecho */}
      <group position={[0.3, 0, 1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.4, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
          <meshStandardMaterial ref={engineGlowRightRef} color="#ef4444" toneMapped={false} emissive="#ef4444" emissiveIntensity={0} />
        </mesh>
      </group>
      
      {/* Luz ambiental interactiva de los motores para bañar el casco */}
      <pointLight position={[0, 0, 1.5]} color="#ef4444" intensity={2} distance={3} />
    </group>
  );
});

Spaceship.displayName = "Spaceship";
