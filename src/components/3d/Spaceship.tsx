"use client";

import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type SpaceshipProps = {
  isSandbox?: boolean;
  hasFuel?: boolean;
  controlsEnabled?: boolean;
  onFlightUpdate?: (isBoosting: boolean, isAccelerating: boolean, delta: number) => void;
  onShoot?: (pos: THREE.Vector3, quat: THREE.Quaternion) => void;
};

export const Spaceship = forwardRef<THREE.Group, SpaceshipProps>(
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

    const hullGlowRef = useRef<THREE.MeshStandardMaterial>(null);
    const engineGlowLeftRef = useRef<THREE.MeshStandardMaterial>(null);
    const engineGlowRightRef = useRef<THREE.MeshStandardMaterial>(null);
    const wingGlowRef = useRef<THREE.MeshStandardMaterial>(null);

    const velocity = useRef(0);
    const lastShotTime = useRef(0);

    const [keys, setKeys] = useState<Record<string, boolean>>({});
    const { camera } = useThree();
    const isMobileRef = useRef(false);
    const gyro = useRef({ beta: 45, gamma: 0 });

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        setKeys((prev) => ({ ...prev, [event.code]: true }));
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        setKeys((prev) => ({ ...prev, [event.code]: false }));
      };
      
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
        if (window.DeviceOrientationEvent) {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      }

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        
        if (isMobileRef.current) {
          window.removeEventListener('pointerdown', handlePointerDown);
          window.removeEventListener('pointerup', handlePointerUp);
          if (window.DeviceOrientationEvent) {
            window.removeEventListener('deviceorientation', handleOrientation);
          }
        }
      };
    }, []);

    useEffect(() => {
      if (!controlsEnabled) {
        setKeys({});
      }
    }, [controlsEnabled]);

    useFrame((state, delta) => {
      if (!meshRef.current) return;

      const rotSpeed = 1.55 * delta;

      if (controlsEnabled) {
        if (keys.ArrowUp) meshRef.current.rotateX(-rotSpeed);
        if (keys.ArrowDown) meshRef.current.rotateX(rotSpeed);
        if (keys.ArrowLeft) meshRef.current.rotateY(rotSpeed);
        if (keys.ArrowRight) meshRef.current.rotateY(-rotSpeed);
        if (keys.KeyA) meshRef.current.rotateZ(rotSpeed);
        if (keys.KeyD) meshRef.current.rotateZ(-rotSpeed);
        
        if (isMobileRef.current) {
          const { beta, gamma } = gyro.current;
          // Beta is pitch [-180, 180]. Natural holding ~ 45 deg.
          if (beta < 30) meshRef.current.rotateX(-rotSpeed * 0.8);
          if (beta > 60) meshRef.current.rotateX(rotSpeed * 0.8);
          // Gamma is roll [-90, 90]
          if (gamma < -15) meshRef.current.rotateY(rotSpeed * 0.8);
          if (gamma > 15) meshRef.current.rotateY(-rotSpeed * 0.8);
        }
      }

      const isBoosting = controlsEnabled && (keys.ShiftLeft || keys.ShiftRight);
      const isAccelerating = controlsEnabled && keys.KeyW === true;
      let acceleration = 0;

      if (isAccelerating) {
        if (!isSandbox || (isSandbox && hasFuel)) {
          acceleration = isBoosting ? 48 : 22;
        }
      }

      if (controlsEnabled && keys.KeyS) {
        acceleration = -16;
      }

      if (
        controlsEnabled &&
        keys.Space &&
        isSandbox &&
        state.clock.elapsedTime - lastShotTime.current > 0.15
      ) {
        onShoot?.(meshRef.current.position, meshRef.current.quaternion);
        lastShotTime.current = state.clock.elapsedTime;
      }

      if (isSandbox && onFlightUpdate) {
        onFlightUpdate(isBoosting, isAccelerating, delta);
      }

      velocity.current += acceleration * delta;
      velocity.current *= controlsEnabled ? 0.983 : 0.94;
      meshRef.current.translateZ(-velocity.current * delta);

      const glowIntensity = isAccelerating && (!isSandbox || hasFuel) ? (isBoosting ? 14 : 6) : 0.4;
      const glowColor = isBoosting ? '#5eead4' : '#f97316';
      const hullColor = isBoosting ? '#67e8f9' : '#38bdf8';

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

      if (hullGlowRef.current) {
        hullGlowRef.current.emissiveIntensity = controlsEnabled ? 1.4 : 0.5;
        hullGlowRef.current.emissive.set(hullColor);
      }

      if (wingGlowRef.current) {
        wingGlowRef.current.emissiveIntensity = isBoosting ? 3 : 1.1;
        wingGlowRef.current.emissive.set(hullColor);
        wingGlowRef.current.color.set(hullColor);
      }

      const idealOffset = new THREE.Vector3(0, 1.45, 4.4);
      idealOffset.applyQuaternion(meshRef.current.quaternion);
      idealOffset.add(meshRef.current.position);

      camera.position.lerp(idealOffset, 0.14);
      camera.quaternion.slerp(meshRef.current.quaternion, 0.12);
    });

    return (
      <group ref={meshRef}>
        <group rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0.02, -0.25]} rotation={[Math.PI / 2, 0, 0]} scale={[1.05, 1, 2.7]}>
            <cylinderGeometry args={[0.18, 0.34, 1.8, 12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.18} />
          </mesh>

          <mesh position={[0, 0.05, -1.18]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.22, 0.95, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.16} />
          </mesh>

          <mesh position={[0, 0.24, -0.55]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 2.2]}>
            <sphereGeometry args={[0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#7dd3fc"
              transparent
              opacity={0.8}
              roughness={0}
              toneMapped={false}
              emissive="#38bdf8"
              emissiveIntensity={1.2}
            />
          </mesh>

          <mesh position={[0, -0.02, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.16, 0.9, 10]} />
            <meshStandardMaterial ref={hullGlowRef} color="#38bdf8" toneMapped={false} emissive="#38bdf8" />
          </mesh>

          <group position={[0, 0, -0.05]}>
            <mesh position={[-0.92, 0, 0]} rotation={[0.02, -0.28, 0.08]}>
              <boxGeometry args={[1.75, 0.05, 0.72]} />
              <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.24} />
            </mesh>
            <mesh position={[0.92, 0, 0]} rotation={[0.02, 0.28, -0.08]}>
              <boxGeometry args={[1.75, 0.05, 0.72]} />
              <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.24} />
            </mesh>

            <mesh position={[-1.25, 0.02, -0.18]} rotation={[0, -0.25, 0]}>
              <boxGeometry args={[0.72, 0.06, 0.16]} />
              <meshStandardMaterial ref={wingGlowRef} color="#38bdf8" toneMapped={false} emissive="#38bdf8" />
            </mesh>
            <mesh position={[1.25, 0.02, -0.18]} rotation={[0, 0.25, 0]}>
              <boxGeometry args={[0.72, 0.06, 0.16]} />
              <meshStandardMaterial color="#38bdf8" toneMapped={false} emissive="#38bdf8" emissiveIntensity={1.1} />
            </mesh>

            <mesh position={[-1.5, -0.04, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.95, 10]} />
              <meshStandardMaterial color="#334155" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[1.5, -0.04, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.95, 10]} />
              <meshStandardMaterial color="#334155" metalness={1} roughness={0.2} />
            </mesh>
          </group>

          <mesh position={[-0.24, 0.46, 0.56]} rotation={[0.18, 0, 0.38]}>
            <boxGeometry args={[0.07, 0.92, 0.44]} />
            <meshStandardMaterial color="#0f172a" metalness={0.75} roughness={0.2} />
          </mesh>
          <mesh position={[0.24, 0.46, 0.56]} rotation={[0.18, 0, -0.38]}>
            <boxGeometry args={[0.07, 0.92, 0.44]} />
            <meshStandardMaterial color="#0f172a" metalness={0.75} roughness={0.2} />
          </mesh>

          <group position={[-0.36, -0.02, 0.98]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.16, 0.22, 0.48, 18]} />
              <meshStandardMaterial color="#334155" metalness={0.92} roughness={0.34} />
            </mesh>
            <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.14, 18]} />
              <meshStandardMaterial
                ref={engineGlowLeftRef}
                color="#f97316"
                toneMapped={false}
                emissive="#f97316"
                emissiveIntensity={0}
              />
            </mesh>
          </group>

          <group position={[0.36, -0.02, 0.98]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.16, 0.22, 0.48, 18]} />
              <meshStandardMaterial color="#334155" metalness={0.92} roughness={0.34} />
            </mesh>
            <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.14, 18]} />
              <meshStandardMaterial
                ref={engineGlowRightRef}
                color="#f97316"
                toneMapped={false}
                emissive="#f97316"
                emissiveIntensity={0}
              />
            </mesh>
          </group>

          <mesh position={[0, -0.22, 0.42]}>
            <boxGeometry args={[0.34, 0.09, 0.95]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.34} />
          </mesh>

          <pointLight position={[0, 0, 1.75]} color="#f97316" intensity={2.4} distance={3.8} />
          <pointLight position={[0, 0.18, -0.35]} color="#38bdf8" intensity={1.1} distance={2.4} />
        </group>
      </group>
    );
  },
);

Spaceship.displayName = 'Spaceship';
