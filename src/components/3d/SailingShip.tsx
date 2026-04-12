"use client";

import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SpaceshipProps } from './Spaceship'; // Reutilizamos los props

export const SailingShip = forwardRef<THREE.Group, SpaceshipProps>(
  (
    {
      isSandbox = false,
      hasFuel = true,
      controlsEnabled = true,
      onFlightUpdate,
      onShoot,
    },
    ref,
  ) => {
    const internalRef = useRef<THREE.Group>(null);
    const meshRef = (ref as React.MutableRefObject<THREE.Group | null>) || internalRef;
    
    // Nuevo inner grupo para manejar el "balanceo" separado de la "dirección" (meshRef)
    const hullRef = useRef<THREE.Group>(null);

    const sailMainRef = useRef<THREE.Mesh>(null);
    const sailForeRef = useRef<THREE.Mesh>(null);
    const sailMizzenRef = useRef<THREE.Mesh>(null);
    const wakeRef = useRef<THREE.MeshStandardMaterial>(null);

    const velocity = useRef(0);
    const lastShotTime = useRef(0);

    const [keys, setKeys] = useState<Record<string, boolean>>({});
    const { camera } = useThree();
    const isMobileRef = useRef(false);
    const gyro = useRef({ beta: 45, gamma: 0 });

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => setKeys((prev) => ({ ...prev, [event.code]: true }));
      const handleKeyUp = (event: KeyboardEvent) => setKeys((prev) => ({ ...prev, [event.code]: false }));
      const handlePointerDown = () => setKeys((prev) => ({ ...prev, KeyW: true }));
      const handlePointerUp = () => setKeys((prev) => ({ ...prev, KeyW: false }));

      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.beta !== null) gyro.current.beta = event.beta;
        if (event.gamma !== null) gyro.current.gamma = event.gamma;
      };

      isMobileRef.current = /Mobi|Android/i.test(navigator.userAgent);

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      if (isMobileRef.current) {
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        if (window.DeviceOrientationEvent) window.addEventListener('deviceorientation', handleOrientation);
      }

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        
        if (isMobileRef.current) {
          window.removeEventListener('pointerdown', handlePointerDown);
          window.removeEventListener('pointerup', handlePointerUp);
          if (window.DeviceOrientationEvent) window.removeEventListener('deviceorientation', handleOrientation);
        }
      };
    }, []);

    useEffect(() => {
      // Spawn en el Puerto
      if (meshRef.current) {
         meshRef.current.position.set(0, 0.2, 7);
         meshRef.current.rotation.set(0, 0, 0); // Direction vector
      }
    }, [meshRef]);

    useEffect(() => {
      if (!controlsEnabled) setKeys({});
    }, [controlsEnabled]);

    useFrame((state, delta) => {
      if (!meshRef.current || !hullRef.current) return;

      const rotSpeed = 1.2 * delta; 

      if (controlsEnabled) {
        // Giro de 360 grados PERFECTO: se aplica SOLO a meshRef en el eje Y.
        // No aplicamos rotaciones en X y Z aquí para prevenir el gimbal lock.
        if (keys.ArrowLeft || keys.KeyA) meshRef.current.rotateY(rotSpeed);
        if (keys.ArrowRight || keys.KeyD) meshRef.current.rotateY(-rotSpeed);
        
        if (isMobileRef.current) {
          const { gamma } = gyro.current;
          if (gamma < -15) meshRef.current.rotateY(rotSpeed * 0.8);
          if (gamma > 15) meshRef.current.rotateY(-rotSpeed * 0.8);
        }
      }

      // Animación oscilante natural atada puramente al HULL (grupo interno)
      // Así mantenemos el eje Y perfecto en el parent para no perder la trayectoria 2D.
      hullRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      hullRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 1.5) * 0.05;

      const isBoosting = controlsEnabled && (keys.ShiftLeft || keys.ShiftRight);
      const isAccelerating = controlsEnabled && keys.KeyW === true;
      let acceleration = 0;

      if (isAccelerating) {
        if (!isSandbox || (isSandbox && hasFuel)) acceleration = isBoosting ? 38 : 22; 
      }

      if (controlsEnabled && keys.KeyS) acceleration = -10;

      if (isSandbox && onFlightUpdate) onFlightUpdate(isBoosting, isAccelerating, delta);

      velocity.current += acceleration * delta;
      velocity.current *= controlsEnabled ? 0.98 : 0.92;
      meshRef.current.translateZ(-velocity.current * delta); // Traslada en base a la rotación Y pura del parent

      // Movimiento dinámico de velas
      const windForce = 1 + velocity.current * 0.03 + Math.sin(state.clock.elapsedTime * 5) * 0.03;
      if (sailMainRef.current) sailMainRef.current.scale.z = windForce;
      if (sailForeRef.current) sailForeRef.current.scale.z = windForce;
      if (sailMizzenRef.current) sailMizzenRef.current.scale.z = windForce;

      if (wakeRef.current) wakeRef.current.opacity = (velocity.current / 25) * 0.7;

      const idealOffset = new THREE.Vector3(0, 3.5, 8.0); // Cámara más alta atrás para apreciar la nave
      idealOffset.applyQuaternion(meshRef.current.quaternion);
      idealOffset.add(meshRef.current.position);

      camera.position.lerp(idealOffset, 0.08); // Interpolación suave de cámara externa
      camera.quaternion.slerp(meshRef.current.quaternion, 0.06);
    });

    return (
      <group ref={meshRef}>
         <group ref={hullRef} rotation={[0, Math.PI, 0]}>
          
          {/* GALLEON HULL LAYER 1 - Base inferior gruesa */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[1.5, 0.4, 3.6]} />
            <meshStandardMaterial color="#2d1303" roughness={0.9} />
          </mesh>

          {/* GALLEON HULL LAYER 2 - Medio ensanchado */}
          <mesh position={[0, -0.1, 0.2]}>
            <boxGeometry args={[1.8, 0.4, 4]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>

          {/* GALLEON HULL LAYER 3 - Barandillaje Lateral */}
          <mesh position={[-0.85, 0.2, 0.2]}>
             <boxGeometry args={[0.1, 0.3, 4.2]} />
             <meshStandardMaterial color="#1f0a01" roughness={0.9} />
          </mesh>
          <mesh position={[0.85, 0.2, 0.2]}>
             <boxGeometry args={[0.1, 0.3, 4.2]} />
             <meshStandardMaterial color="#1f0a01" roughness={0.9} />
          </mesh>
          {/* Barandilla popa plana */}
          <mesh position={[0, 0.2, -1.85]}>
             <boxGeometry args={[1.6, 0.3, 0.1]} />
             <meshStandardMaterial color="#1f0a01" roughness={0.9} />
          </mesh>

          {/* Cubierta de madera transitable */}
          <mesh position={[0, 0.05, 0.2]}>
             <boxGeometry args={[1.6, 0.1, 4]} />
             <meshStandardMaterial color="#78350f" roughness={1} />
          </mesh>

          {/* Castillo de popa (Atrás, cabina del capitán) */}
          <mesh position={[0, 0.4, -1.2]}>
             <boxGeometry args={[1.6, 0.6, 1.4]} />
             <meshStandardMaterial color="#381402" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.8, -1.2]}>
             <boxGeometry args={[1.6, 0.2, 1.4]} />
             <meshStandardMaterial color="#1f0a01" roughness={0.9} />
          </mesh>

          {/* Proa puntiaguda */}
          <mesh position={[0, -0.1, 2.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0, 0.8, 0.8, 4]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.1, 1.9]} rotation={[Math.PI / 2, Math.PI, 0]}>
             <cylinderGeometry args={[0, 0.8, 0.8, 3]} />
             <meshStandardMaterial color="#381402" roughness={0.9} />
          </mesh>

          {/* Bauprés (Palo extendido al frente de la proa) */}
          <mesh position={[0, 0.4, 3.2]} rotation={[Math.PI / 2 - 0.2, 0, 0]}>
             <cylinderGeometry args={[0.06, 0.08, 1.8]} />
             <meshStandardMaterial color="#1f0a01" roughness={0.9} />
          </mesh>

          {/* MASTILES PUNTAL */}
          {/* Mainmast (Centro) */}
          <mesh position={[0, 1.8, 0.5]}>
            <cylinderGeometry args={[0.08, 0.1, 4]} />
            <meshStandardMaterial color="#291002" roughness={1} />
          </mesh>
          
          {/* Foremast (Frente) */}
          <mesh position={[0, 1.5, 1.8]}>
            <cylinderGeometry args={[0.06, 0.08, 3]} />
            <meshStandardMaterial color="#291002" roughness={1} />
          </mesh>

          {/* Mizzenmast (Atrás sobre popa) */}
          <mesh position={[0, 1.6, -1.2]}>
            <cylinderGeometry args={[0.05, 0.06, 2.5]} />
            <meshStandardMaterial color="#291002" roughness={1} />
          </mesh>

          {/* COFAS (Nidos de cuervos) */}
          <mesh position={[0, 2.8, 0.5]}>
             <cylinderGeometry args={[0.3, 0.2, 0.3, 8]} />
             <meshStandardMaterial color="#1f0a01" roughness={0.9} />
          </mesh>

          {/* BANDERA JOLLY ROGER (Pirata Negra Superior) */}
          <mesh position={[0, 3.6, 1.0]} rotation={[0, Math.PI / 2, 0]}>
             <planeGeometry args={[1.2, 0.6]} />
             <meshStandardMaterial color="#111827" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>

          {/* VELAS DE TELA */}
          <mesh ref={sailMainRef} position={[0, 1.6, 0.6]} rotation={[0, Math.PI, 0]}>
            <coneGeometry args={[1.6, 2.4, 3, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#fcfaf4" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={sailForeRef} position={[0, 1.4, 1.9]} rotation={[0, Math.PI, 0]}>
            <coneGeometry args={[1.2, 1.8, 3, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#e8dcc4" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={sailMizzenRef} position={[0, 1.8, -1.1]} rotation={[0, Math.PI, 0]}>
            <coneGeometry args={[0.8, 1.4, 3, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#fcfaf4" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>

          {/* Cañones laterales estribor y babor */}
          <mesh position={[-0.95, 0, 0.5]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.08, 0.08, 0.5]} />
             <meshStandardMaterial color="#000000" metalness={0.8} />
          </mesh>
          <mesh position={[-0.95, 0, 1.2]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.08, 0.08, 0.5]} />
             <meshStandardMaterial color="#000000" metalness={0.8} />
          </mesh>
          <mesh position={[0.95, 0, 0.5]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.08, 0.08, 0.5]} />
             <meshStandardMaterial color="#000000" metalness={0.8} />
          </mesh>
          <mesh position={[0.95, 0, 1.2]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.08, 0.08, 0.5]} />
             <meshStandardMaterial color="#000000" metalness={0.8} />
          </mesh>

          {/* Estela de agua espumosa detrás del barco */}
          <mesh position={[0, -0.4, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
             <planeGeometry args={[1.8, 5]} />
             <meshBasicMaterial ref={wakeRef} color="#ffffff" transparent opacity={0} depthWrite={false} />
          </mesh>

          <pointLight position={[0, 1, 0]} color="#fcd34d" intensity={1} distance={8} />
         </group>
      </group>
    );
  },
);

SailingShip.displayName = 'SailingShip';
