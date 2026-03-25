"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Text, Float } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { PROYECTOS_CORE } from '@/datos/proyectos';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

// --- CONTROLADOR DE CÁMARA WARP ---
function WarpCamera({ target, isActive }: { target: THREE.Vector3 | null, isActive: boolean }) {
  const { camera } = useThree();
  
  useFrame((state, delta) => {
    if (isActive && target) {
      // Zoom cinemático extremo al centro del planeta
      camera.position.lerp(target, delta * 8);
      
      // Efecto de visión de túnel contrayendo el FOV
      const pCam = camera as THREE.PerspectiveCamera;
      if (pCam.fov > 10) {
         pCam.fov -= delta * 60;
         pCam.updateProjectionMatrix();
      }
    }
  });
  return null;
}

// --- COMPONENTE NAVE ESPACIAL ---
function Spaceship({ onCollide, isActive, isWarping }: { onCollide: (id: string, link: string, pos: THREE.Vector3) => void, isActive: boolean, isWarping: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const rotationVelocity = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive]);

  useFrame((state, delta) => {
    if (!meshRef.current || !isActive) return;

    if (!isWarping) {
      // Rotación (A / D)
      if (keys['a']) rotationVelocity.current += delta * 2;
      if (keys['d']) rotationVelocity.current -= delta * 2;
      rotationVelocity.current *= 0.95; 
      meshRef.current.rotation.y += rotationVelocity.current * delta;

      // Aceleración (W / S)
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(meshRef.current.quaternion);

      if (keys['w']) velocity.current.add(direction.multiplyScalar(delta * 20));
      if (keys['s']) velocity.current.add(direction.multiplyScalar(-delta * 10));
      
      velocity.current.multiplyScalar(0.98); 
      meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));

      // Seguimiento de cámara suave
      const idealOffset = new THREE.Vector3(0, 5, 12);
      idealOffset.applyQuaternion(meshRef.current.quaternion);
      idealOffset.add(meshRef.current.position);
      camera.position.lerp(idealOffset, 0.1);
      camera.lookAt(meshRef.current.position);

      // Colisiones
      PROYECTOS_CORE.forEach((p, idx) => {
        const orbitRadius = 4 + idx * 1.5;
        const initialAngle = (idx / PROYECTOS_CORE.length) * Math.PI * 2 * 3;
        const orbitSpeed = 0.5 + (PROYECTOS_CORE.length - idx) * 0.1;
        const time = state.clock.getElapsedTime();
        const currentAngle = initialAngle + time * orbitSpeed * 0.1;
        
        const planetPos = new THREE.Vector3(
          Math.cos(currentAngle) * orbitRadius,
          Math.sin(time * 0.5 + idx) * 1.5,
          Math.sin(currentAngle) * orbitRadius
        );

        if (meshRef.current!.position.distanceTo(planetPos) < 1.8) {
          onCollide(p.id, p.link, planetPos);
        }
      });
    } else {
      // Cuando estamos en warp, la cámara la controla WarpCamera, la nave deja de recibir focus o se esconde
      meshRef.current.visible = false;
    }
  });

  if (!isActive) return null;

  return (
    <group ref={meshRef} position={[0, 0, 20]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 1.2, 4]} />
        <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, -0.2, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
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
  const router = useRouter();

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

  const handleClick = () => {
    document.body.style.cursor = 'auto';
    router.push(project.link);
  };

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} />
        <meshBasicMaterial color={project.color} transparent opacity={0.1} />
      </mesh>

      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh 
            ref={planetRef} 
            scale={hovered ? 1.4 : 1}
            onClick={handleClick}
            onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
          >
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
  const [isShipMode, setIsShipMode] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [warpTarget, setWarpTarget] = useState<THREE.Vector3 | null>(null);

  const handleCollision = (id: string, link: string, pos: THREE.Vector3) => {
    if (isWarping) return;
    setIsWarping(true);
    setWarpTarget(pos);
    
    // El fade y zoom toman algo de tiempo, luego redirigimos
    setTimeout(() => {
      router.push(link);
    }, 1200); // 1.2s para disfrutar de la transición
  };

  return (
    <>
      {/* Botón superior derecho para alternar el modo Nave */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => {
            if (!isWarping) setIsShipMode(!isShipMode);
          }} 
          className="px-6 py-2 bg-transparent backdrop-blur-md border border-white/20 text-white font-mono text-sm uppercase tracking-wider rounded-md hover:bg-white hover:text-black hover:border-white transition-all duration-300"
        >
          {isShipMode ? 'Desactivar Nave' : 'Pilotar Nave'}
        </button>
      </div>

      <Canvas camera={{ fov: 60, position: [0, 12, 30] }}>
        <color attach="background" args={['#010103']} />
        <ambientLight intensity={0.2} />
        
        {/* Las estrellas parecerán estirarse cuando la cámara avance super rápido */}
        <Stars radius={150} depth={50} count={10000} factor={6} saturation={1} fade speed={isWarping ? 5 : 1.5} />
        
        <CentralCore />

        {PROYECTOS_CORE.map((project, index) => (
          <ProjectPlanet key={project.id} project={project} index={index} total={PROYECTOS_CORE.length} />
        ))}

        <Spaceship onCollide={handleCollision} isActive={isShipMode} isWarping={isWarping} />

        {/* Cámara de transición para colisiones */}
        <WarpCamera isActive={isWarping} target={warpTarget} />

        {/* Si no estamos en modo nave, permitimos control total del usuario */}
        {!isShipMode && !isWarping && (
          <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            autoRotate={true} 
            autoRotateSpeed={0.3} 
            maxDistance={60}
            minDistance={5}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
        )}
      </Canvas>

      {/* Instrucciones HUD - solo visibles en modo nave */}
      {isShipMode && !isWarping && (
        <div className="absolute bottom-20 right-6 z-40 text-white/40 font-mono text-[10px] text-right pointer-events-none animate-fade-in">
          <p className="font-bold text-white/70 mb-1">INTERFAZ DE VUELO ACTIVA</p>
          <p>[W] ACELERAR   |   [S] FRENAR</p>
          <p>[A] Babor     |   [D] Estribor</p>
          <p className="mt-2 text-white/60">INTERSECTAR CON OBJETIVO PARA ENTRAR</p>
        </div>
      )}

      {/* Fade Cinematográfico a Blanco Elegante */}
      <div 
        className="absolute inset-0 pointer-events-none z-[100] bg-white transition-opacity duration-1000 ease-in-out"
        style={{ opacity: isWarping ? 1 : 0 }}
      />
    </>
  );
}
