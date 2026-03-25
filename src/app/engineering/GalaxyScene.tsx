"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Text, Float } from '@react-three/drei';
import { useRef, useState, useEffect, useMemo } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { PROYECTOS_CORE } from '@/datos/proyectos';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

// --- CONTROLADOR DE CÁMARA WARP ---
function WarpCamera({ target, isActive, type }: { target: THREE.Vector3 | null, isActive: boolean, type: 'hyperspace' | 'wormhole' }) {
  const { camera } = useThree();
  
  useFrame((state, delta) => {
    if (isActive && target) {
      if (type === 'hyperspace') {
        camera.position.lerp(target, delta * 8);
        const pCam = camera as THREE.PerspectiveCamera;
        if (pCam.fov > 10) {
           pCam.fov -= delta * 60;
           pCam.updateProjectionMatrix();
        }
      } else {
        // Agujero de gusano: zoom mientras gira frenéticamente y aumenta el FOV
        camera.position.lerp(target, delta * 5);
        camera.rotation.z += delta * 12; // Giro dramático
        const pCam = camera as THREE.PerspectiveCamera;
        if (pCam.fov < 140) {
           pCam.fov += delta * 100; // Efecto de estiramiento visual extremo
           pCam.updateProjectionMatrix();
        }
      }
    }
  });
  return null;
}

// --- COMETAS AMBIENTALES ---
function Comets() {
  const count = 10;
  const dummy = new THREE.Object3D();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const data = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200),
      vel: new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40),
      scale: Math.random() * 0.5 + 0.5
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    data.forEach((comet, i) => {
      comet.pos.add(comet.vel.clone().multiplyScalar(delta));
      if (comet.pos.length() > 150) {
        // Reset comet
        comet.pos.set((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200);
      }
      dummy.position.copy(comet.pos);
      
      // Orientación en la dirección de la velocidad y estirarlo para que parezca una estela
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), comet.vel.clone().normalize());
      dummy.scale.set(comet.scale * 0.1, comet.scale * 4, comet.scale * 0.1); 
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#38bdf8" toneMapped={false} />
    </instancedMesh>
  );
}

// --- CAMPO DE ASTEROIDES ---
type Asteroid = {
  pos: THREE.Vector3;
  rotation: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  scale: number;
};

function AsteroidField({ asteroids }: { asteroids: Asteroid[] }) {
  const dummy = new THREE.Object3D();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    asteroids.forEach((ast, i) => {
      ast.rotation.add(ast.rotSpeed.clone().multiplyScalar(delta));
      dummy.position.copy(ast.pos);
      dummy.rotation.setFromVector3(ast.rotation);
      dummy.scale.setScalar(ast.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, asteroids.length]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#334155" roughness={0.9} />
    </instancedMesh>
  );
}

// --- COMPONENTE NAVE ESPACIAL ---
function Spaceship({ onCollide, isActive, isWarping, asteroids }: { onCollide: (id: string, link: string, pos: THREE.Vector3) => void, isActive: boolean, isWarping: boolean, asteroids: Asteroid[] }) {
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

      if (keys['w']) velocity.current.add(direction.multiplyScalar(delta * 25));
      if (keys['s']) velocity.current.add(direction.multiplyScalar(-delta * 10));
      
      velocity.current.multiplyScalar(0.98); 
      meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));

      // Seguimiento de cámara suave (Casi 1ra persona, por encima del hombro)
      const idealOffset = new THREE.Vector3(0, 1.2, 3.5);
      idealOffset.applyQuaternion(meshRef.current.quaternion);
      idealOffset.add(meshRef.current.position);
      camera.position.lerp(idealOffset, 0.1);
      camera.lookAt(meshRef.current.position);

      // Colisiones con Proyectos
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

      // Colisiones con Asteroides (Rebote manual)
      asteroids.forEach(ast => {
        if (meshRef.current!.position.distanceTo(ast.pos) < ast.scale + 0.4) {
          // Rebote contundente
          velocity.current.multiplyScalar(-0.6); 
          const pushDir = meshRef.current!.position.clone().sub(ast.pos).normalize();
          meshRef.current!.position.add(pushDir.multiplyScalar(0.5));
        }
      });

    } else {
      meshRef.current.visible = false;
    }
  });

  if (!isActive) return null;

  return (
    <group ref={meshRef} position={[0, 0, 25]}>
      {/* Fuselaje */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.3, 1.5, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Cockpit */}
      <mesh position={[0, 0.1, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} toneMapped={false} emissive="#38bdf8" emissiveIntensity={2} />
      </mesh>

      {/* Ala Izquierda */}
      <group position={[-0.4, 0, 0.2]} rotation={[0, 0.2, -0.2]}>
        <mesh>
          <boxGeometry args={[0.8, 0.05, 0.6]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[-0.2, -0.05, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Ala Derecha */}
      <group position={[0.4, 0, 0.2]} rotation={[0, -0.2, 0.2]}>
        <mesh>
          <boxGeometry args={[0.8, 0.05, 0.6]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0.2, -0.05, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Alerón Posterior */}
      <mesh position={[0, 0.3, 0.4]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.3]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      
      {/* Reactor con Bloom inmenso (toneMapped={false} + emissiveIntensity>2) */}
      <mesh position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#ef4444" toneMapped={false} emissive="#ef4444" emissiveIntensity={5} />
      </mesh>
      
      {/* Luz Ambiental de los propulsores */}
      <pointLight position={[0, 0, 1]} color="#ef4444" intensity={2} distance={5} />
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
        {/* Glow Extremo con Bloom */}
        <meshStandardMaterial color="#fcd34d" toneMapped={false} emissive="#fbbf24" emissiveIntensity={3} wireframe={true} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <pointLight color="#fbbf24" intensity={3} distance={50} decay={2} />
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
        <meshBasicMaterial color={project.color} transparent opacity={hovered ? 0.3 : 0.1} />
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
            {/* ToneMapped = false para que el Bloom haga efecto estelar */}
            <meshStandardMaterial color={project.color} wireframe toneMapped={false} emissive={project.color} emissiveIntensity={hovered ? 4 : 1.5} />
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
  const [warpType, setWarpType] = useState<'hyperspace' | 'wormhole'>('hyperspace');

  // Memorizar la posición de los asteroides para consistencia
  const asteroidData = useMemo(() => {
    return Array.from({ length: 250 }, () => {
      // Radio exterior para formar un cinturón o nube
      const angle = Math.random() * Math.PI * 2;
      const radius = 28 + Math.random() * 25; 
      const y = (Math.random() - 0.5) * 15;
      return {
        pos: new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
        rotation: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        rotSpeed: new THREE.Vector3(Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5),
        scale: 0.5 + Math.random() * 2
      };
    });
  }, []);

  const handleCollision = (id: string, link: string, pos: THREE.Vector3) => {
    if (isWarping) return;
    setIsWarping(true);
    setWarpTarget(pos);
    setWarpType(id === 'space-sandbox' ? 'wormhole' : 'hyperspace');
    setTimeout(() => {
      router.push(link);
    }, 1200);
  };

  return (
    <>
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => {
            if (!isWarping) setIsShipMode(!isShipMode);
          }} 
          className="px-6 py-2 bg-black/40 backdrop-blur-md border border-white/20 text-white font-mono text-sm uppercase tracking-wider rounded-md hover:bg-white hover:text-black hover:border-white transition-all duration-300"
        >
          {isShipMode ? 'Desactivar Nave' : 'Pilotar Nave'}
        </button>
      </div>

      <Canvas camera={{ fov: 60, position: [0, 15, 35] }}>
        <color attach="background" args={['#010103']} />
        <ambientLight intensity={0.2} />
        
        {/* Entorno base */}
        <Stars radius={150} depth={50} count={10000} factor={6} saturation={1} fade speed={isWarping ? 5 : 1} />
        
        {/* Post-procesado (Bloom muy elegante para neones) */}
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={1.5} mipmapBlur intensity={1.2} />
        </EffectComposer>

        <CentralCore />
        <Comets />

        {PROYECTOS_CORE.map((project, index) => (
          <ProjectPlanet key={project.id} project={project} index={index} total={PROYECTOS_CORE.length} />
        ))}

        {isShipMode && <AsteroidField asteroids={asteroidData} />}

        <Spaceship onCollide={handleCollision} isActive={isShipMode} isWarping={isWarping} asteroids={asteroidData} />

        <WarpCamera isActive={isWarping} target={warpTarget} type={warpType} />

        {!isShipMode && !isWarping && (
          <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            autoRotate={true} 
            autoRotateSpeed={0.5} 
            maxDistance={80}
            minDistance={8}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
        )}
      </Canvas>

      {/* HUD de Nave */}
      {isShipMode && !isWarping && (
        <div className="absolute bottom-20 right-6 z-40 text-white/40 font-mono text-[10px] text-right pointer-events-none animate-fade-in shadow-black drop-shadow-md">
          <p className="font-bold text-white/80 mb-1">INTERFAZ DE VUELO ACTIVA</p>
          <p>[W] ACELERAR   |   [S] FRENAR</p>
          <p>[A] Babor     |   [D] Estribor</p>
          <p className="mt-1 text-red-400">¡CUIDADO CON EL CINTURÓN DE ASTEROIDES!</p>
          <p className="mt-2 text-white/70">INTERSECTAR CON OBJETIVO PARA ENTRAR</p>
        </div>
      )}

      {/* Fade Cinematográfico */}
      <div 
        className={`absolute inset-0 pointer-events-none z-[100] transition-colors duration-1000 ease-in-out ${isWarping ? (warpType === 'wormhole' ? 'bg-[#0f0022]/95' : 'bg-white') : 'bg-transparent'}`}
        style={{ opacity: isWarping ? 1 : 0 }}
      />
    </>
  );
}
