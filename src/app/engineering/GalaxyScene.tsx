"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Text, Float, Billboard } from '@react-three/drei';
import { useRef, useState, useEffect, useMemo } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { PROYECTOS_CORE } from '@/datos/proyectos';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { Spaceship } from '@/components/3d/Spaceship';

type ProjectVisualMeta = {
  title: string;
  category: string;
  shape: 'planet' | 'ring' | 'crystal' | 'station';
  accent: THREE.Color;
  glow: THREE.Color;
};

function getProjectVisualMeta(project: typeof PROYECTOS_CORE[number]): ProjectVisualMeta {
  const accent = new THREE.Color(project.color);
  const glow = accent.clone().lerp(new THREE.Color("#ffffff"), 0.35);

  if (project.id === "chess-engine") {
    return { title: "Chess AI", category: "Ajedrez e IA", shape: "ring", accent, glow };
  }
  if (project.id === "slalom") {
    return { title: "Slalom Architect", category: "Diseño CAD", shape: "station", accent, glow };
  }
  if (project.id === "space-sandbox" || project.id === "chrono-dasher") {
    return { title: project.title, category: "Vuelo y simulación", shape: "ring", accent, glow };
  }
  if (project.id === "aetheria" || project.id === "algo-vis") {
    return { title: project.title, category: "Lógica y estrategia", shape: "crystal", accent, glow };
  }
  if (project.id === "urban" || project.id === "nexus") {
    return { title: project.title, category: "Sistemas complejos", shape: "station", accent, glow };
  }

  return { title: project.title, category: project.tech[0] ?? "Experiencia interactiva", shape: "planet", accent, glow };
}

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

// --- CONTROLADOR DE COLISIONES DE LA GALAXIA ---
function GalaxyCollisionManager({ shipRef, onCollide, isActive, isWarping, asteroids }: { shipRef: React.RefObject<THREE.Group>, onCollide: (id: string, link: string, pos: THREE.Vector3) => void, isActive: boolean, isWarping: boolean, asteroids: Asteroid[] }) {
  useFrame((state, delta) => {
    if (!isActive || isWarping || !shipRef.current) return;
    
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

      if (shipRef.current!.position.distanceTo(planetPos) < 2.1) {
        onCollide(p.id, p.link, planetPos);
      }
    });

    // Colisiones con Asteroides (Rebote manual pasivo)
    asteroids.forEach(ast => {
      if (shipRef.current!.position.distanceTo(ast.pos) < ast.scale + 0.4) {
        const pushDir = shipRef.current!.position.clone().sub(ast.pos).normalize();
        shipRef.current!.position.add(pushDir.multiplyScalar(0.5));
      }
    });
  });
  return null;
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
  const meta = useMemo(() => getProjectVisualMeta(project), [project]);
  const labelWidth = Math.max(3.4, meta.title.length * 0.16);

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
        <meshBasicMaterial color={meta.glow} transparent opacity={hovered ? 0.34 : 0.12} />
      </mesh>

      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh 
            ref={planetRef} 
            scale={hovered ? 1.18 : 1}
            onClick={handleClick}
            onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
          >
            {meta.shape === 'ring' ? (
              <torusGeometry args={[0.9, 0.28, 18, 48]} />
            ) : meta.shape === 'crystal' ? (
              <icosahedronGeometry args={[0.94, 1]} />
            ) : meta.shape === 'station' ? (
              <octahedronGeometry args={[1.02, 0]} />
            ) : (
              <sphereGeometry args={[0.92, 32, 32]} />
            )}
            <meshStandardMaterial
              color={meta.accent}
              toneMapped={false}
              emissive={meta.glow}
              emissiveIntensity={hovered ? 2.8 : 1.15}
              roughness={0.3}
              metalness={0.15}
            />
          </mesh>

          <mesh scale={meta.shape === 'ring' ? 1.18 : 1.08}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshBasicMaterial color={meta.glow} transparent opacity={hovered ? 0.2 : 0.1} />
          </mesh>

          {(meta.shape === 'planet' || meta.shape === 'station') && (
            <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
              <torusGeometry args={[1.28, 0.045, 8, 48]} />
              <meshBasicMaterial color={meta.glow} transparent opacity={0.42} />
            </mesh>
          )}
        </Float>

        <Billboard position={[0, 2.45, 0]} follow>
          <group>
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[labelWidth, 0.96]} />
              <meshBasicMaterial color="#020617" transparent opacity={hovered ? 0.78 : 0.58} />
            </mesh>
            <mesh position={[0, -0.4, -0.015]}>
              <planeGeometry args={[labelWidth, 0.14]} />
              <meshBasicMaterial color={meta.accent} transparent opacity={0.85} />
            </mesh>
            <Text
              position={[0, 0.1, 0]}
              fontSize={hovered ? 0.34 : 0.3}
              maxWidth={labelWidth - 0.4}
              lineHeight={1}
              anchorX="center"
              anchorY="middle"
              color="white"
              outlineWidth={0.03}
              outlineColor="#020617"
            >
              {meta.title}
            </Text>
            <Text
              position={[0, -0.28, 0]}
              fontSize={0.14}
              maxWidth={labelWidth - 0.5}
              anchorX="center"
              anchorY="middle"
              color="#dbe7f5"
              outlineWidth={0.018}
              outlineColor="#020617"
            >
              {meta.category}
            </Text>
          </group>
        </Billboard>
      </group>
    </>
  );
}

// --- ESCENA PRINCIPAL ---
export default function GalaxyScene() {
  const router = useRouter();
  const [isShipMode, setIsShipMode] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [warpTarget, setWarpTarget] = useState<THREE.Vector3 | null>(null);
  const [warpType, setWarpType] = useState<'hyperspace' | 'wormhole'>('hyperspace');
  const shipRef = useRef<THREE.Group>(null);

  useEffect(() => {
    setIsReady(true);
  }, []);

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
    setWarpType((id === 'space-sandbox' || id === 'aetheria') ? 'wormhole' : 'hyperspace');
    setTimeout(() => {
      router.push(link);
    }, 1200);
  };

  if (!isReady) return null;

  return (
    <>
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => {
            if (!isWarping) setIsShipMode(!isShipMode);
          }} 
          className="rounded-md border border-white/20 bg-slate-950/55 px-6 py-2 font-mono text-sm uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-white hover:text-black"
        >
          {isShipMode ? 'Desactivar Nave' : 'Pilotar Nave'}
        </button>
      </div>

      <Canvas camera={{ fov: 60, position: [0, 15, 35] }}>
        <color attach="background" args={['#010103']} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[14, 18, 8]} intensity={0.65} color="#dbeafe" />
        <pointLight position={[-18, 12, -14]} intensity={0.4} color="#fde68a" />
        
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

        {isShipMode && !isWarping && (
          <Spaceship 
            ref={shipRef} 
             isSandbox={false} 
          />
        )}
        
        <GalaxyCollisionManager shipRef={shipRef} onCollide={handleCollision} isActive={isShipMode} isWarping={isWarping} asteroids={asteroidData} />

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
        <div className="absolute bottom-20 right-6 z-40 rounded-xl border border-white/12 bg-slate-950/45 px-4 py-3 text-right font-mono text-[10px] text-white/55 pointer-events-none shadow-black/40 backdrop-blur-md drop-shadow-md">
          <p className="mb-1 font-bold text-white/85">INTERFAZ DE VUELO ACTIVA</p>
          <p>[W] ACELERAR   |   [S] FRENAR</p>
          <p>[A] Babor     |   [D] Estribor</p>
          <p className="mt-1 font-bold text-sky-300">ESTADO DE VUELO EXPERIMENTAL (6-DOF)</p>
          <p className="mt-2 text-white/65">TOCA UN PLANETA O SU ÓRBITA PARA ENTRAR</p>
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
