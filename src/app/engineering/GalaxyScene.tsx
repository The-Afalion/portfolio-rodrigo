"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Text, Float, PerspectiveCamera, ScreenSpace } from '@react-three/drei';
import { useRef, useState, useEffect, useMemo } from 'react';
import { PROYECTOS_CORE } from '@/datos/proyectos';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

// --- COMPONENTE NAVE ESPACIAL ---
function Spaceship({ onCollide }: { onCollide: (projectId: string, link: string) => void }) {
  const meshRef = useRef<THREE.Group>(null);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const rotationVelocity = useRef(0);
  const { camera } = useThree();

  // Control de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Rotación (A / D)
    if (keys['a']) rotationVelocity.current += delta * 2;
    if (keys['d']) rotationVelocity.current -= delta * 2;
    rotationVelocity.current *= 0.95; // Fricción rotación
    meshRef.current.rotation.y += rotationVelocity.current * delta;

    // Aceleración (W / S)
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(meshRef.current.quaternion);

    if (keys['w']) {
      velocity.current.add(direction.multiplyScalar(delta * 20));
    }
    if (keys['s']) {
      velocity.current.add(direction.multiplyScalar(-delta * 10));
    }
    
    velocity.current.multiplyScalar(0.98); // Rozamiento espacial
    meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));

    // Cámara sigue a la nave
    const idealOffset = new THREE.Vector3(0, 5, 12);
    idealOffset.applyQuaternion(meshRef.current.quaternion);
    idealOffset.add(meshRef.current.position);
    camera.position.lerp(idealOffset, 0.1);
    camera.lookAt(meshRef.current.position);

    // Detección de colisiones simple
    PROYECTOS_CORE.forEach((p) => {
      // Necesitamos obtener la posición actual del planeta que está orbitando
      // Como no tenemos acceso directo al ref del planeta aquí, 
      // calculamos su posición teórica basada en el tiempo (igual que en ProjectPlanet)
      const orbitRadius = 4 + PROYECTOS_CORE.indexOf(p) * 1.5;
      const initialAngle = (PROYECTOS_CORE.indexOf(p) / PROYECTOS_CORE.length) * Math.PI * 2 * 3;
      const orbitSpeed = 0.5 + (PROYECTOS_CORE.length - PROYECTOS_CORE.indexOf(p)) * 0.1;
      const time = state.clock.getElapsedTime();
      const currentAngle = initialAngle + time * orbitSpeed * 0.1;
      
      const planetPos = new THREE.Vector3(
        Math.cos(currentAngle) * orbitRadius,
        Math.sin(time * 0.5 + PROYECTOS_CORE.indexOf(p)) * 1.5,
        Math.sin(currentAngle) * orbitRadius
      );

      const dist = meshRef.current!.position.distanceTo(planetPos);
      if (dist < 1.8) {
        onCollide(p.id, p.link);
      }
    });
  });

  return (
    <group ref={meshRef} position={[0, 0, 20]}>
      {/* Cuerpo de la nave */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 1.2, 4]} />
        <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={2} />
      </mesh>
      {/* Alas / Motores */}
      <mesh position={[0, -0.2, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
      {/* Propulsor estético */}
      <pointLight position={[0, 0, 0.8]} color="#0ea5e9" intensity={1} distance={3} />
    </group>
  );
}

// --- NÚCLEO CENTRAL ---
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
        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2} wireframe={true} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <pointLight color="#f59e0b" intensity={2} distance={50} decay={2} />
    </group>
  );
}

// --- PLANETAS ---
function ProjectPlanet({ project, index, total }: { project: typeof PROYECTOS_CORE[0], index: number, total: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  const orbitRadius = 4 + index * 1.5;
  const orbitSpeed = 0.5 + (total - index) * 0.1;
  const initialAngle = (index / total) * Math.PI * 2 * 3;

  useFrame((state, delta) => {
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.5;
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const currentAngle = initialAngle + time * orbitSpeed * 0.1;
      groupRef.current.position.x = Math.cos(currentAngle) * orbitRadius;
      groupRef.current.position.z = Math.sin(currentAngle) * orbitRadius;
      groupRef.current.position.y = Math.sin(time * 0.5 + index) * 1.5;
    }
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} />
        <meshBasicMaterial color={project.color} transparent opacity={0.1} />
      </mesh>

      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh ref={planetRef} scale={hovered ? 1.4 : 1}>
            {index % 2 === 0 ? <torusGeometry args={[0.8, 0.4, 16, 32]} /> : <icosahedronGeometry args={[1, 1]} />}
            <meshStandardMaterial color={project.color} wireframe emissive={project.color} emissiveIntensity={0.8} />
          </mesh>
          <mesh scale={index % 2 === 0 ? 0.6 : 0.8}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={project.color} transparent opacity={0.3} />
          </mesh>
        </Float>
        <Text position={[0, 1.8, 0]} fontSize={0.35} color="white">{project.title}</Text>
      </group>
    </>
  );
}

// --- ESCENA PRINCIPAL ---
export default function GalaxyScene() {
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);

  const handleCollision = (id: string, link: string) => {
    if (isWarping) return;
    setIsWarping(true);
    // Animación de impacto / carga
    setTimeout(() => {
      router.push(link);
    }, 800);
  };

  return (
    <>
      <Canvas>
        <color attach="background" args={['#010103']} />
        <ambientLight intensity={0.2} />
        <Stars radius={150} depth={50} count={10000} factor={6} saturation={1} fade speed={1.5} />
        
        <CentralCore />

        {PROYECTOS_CORE.map((project, index) => (
          <ProjectPlanet key={project.id} project={project} index={index} total={PROYECTOS_CORE.length} />
        ))}

        <Spaceship onCollide={handleCollision} />

        {/* Post-procesado manual: Efecto de Warp */}
        {isWarping && (
           <Float speed={10} rotationIntensity={2} floatIntensity={5}>
              <mesh position={[0,0,-5]}>
                <ringGeometry args={[0, 20, 32]} />
                <meshBasicMaterial color="white" transparent opacity={0.5} />
              </mesh>
           </Float>
        )}
      </Canvas>

      {/* Instrucciones HUD */}
      <div className="absolute bottom-20 right-6 z-50 text-white/40 font-mono text-[10px] text-right pointer-events-none">
        <p>CONTROLES DE NAVE:</p>
        <p>[W] ACELERAR | [S] FRENAR</p>
        <p>[A] IZQUIERDA | [D] DERECHA</p>
        <p>CHOCHA CON UN PLANETA PARA ENTRAR</p>
      </div>

      {isWarping && (
         <div className="absolute inset-0 z-[100] bg-white flex items-center justify-center animate-pulse">
            <h2 className="text-black font-black text-6xl tracking-tighter">WARP DRIVE ACTIVE</h2>
         </div>
      )}
    </>
  );
}
