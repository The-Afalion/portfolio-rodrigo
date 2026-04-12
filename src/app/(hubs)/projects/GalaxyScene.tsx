"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, OrbitControls, Text, Float } from "@react-three/drei";
import { useRef, useState, useEffect, useMemo } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PROYECTOS_CORE } from "@/datos/proyectos";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { Spaceship } from "@/components/3d/Spaceship";
import { SailingShip } from "@/components/3d/SailingShip";

function WarpCamera({
  target,
  isActive,
  type,
}: {
  target: THREE.Vector3 | null;
  isActive: boolean;
  type: "hyperspace" | "wormhole";
}) {
  const { camera } = useThree();

  useFrame((state, delta) => {
    if (isActive && target) {
      if (type === "hyperspace") {
        camera.position.lerp(target, delta * 8);
        const pCam = camera as THREE.PerspectiveCamera;
        if (pCam.fov > 10) {
          pCam.fov -= delta * 60;
          pCam.updateProjectionMatrix();
        }
      } else {
        camera.position.lerp(target, delta * 5);
        camera.rotation.z += delta * 12;
        const pCam = camera as THREE.PerspectiveCamera;
        if (pCam.fov < 140) {
          pCam.fov += delta * 100;
          pCam.updateProjectionMatrix();
        }
      }
    }
  });
  return null;
}

function Comets() {
  const count = 10;
  const dummy = new THREE.Object3D();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200),
      vel: new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40),
      scale: Math.random() * 0.5 + 0.5,
    }));
  }, []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    data.forEach((comet, i) => {
      comet.pos.add(comet.vel.clone().multiplyScalar(delta));
      if (comet.pos.length() > 150) {
        comet.pos.set((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200);
      }
      dummy.position.copy(comet.pos);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), comet.vel.clone().normalize());
      dummy.scale.set(comet.scale * 0.1, comet.scale * 4, comet.scale * 0.1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#38bdf8" toneMapped={false} />
    </instancedMesh>
  );
}

type Obstacle = {
  pos: THREE.Vector3;
  rotation: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  scale: number;
};

function ObstacleField({ obstacles, isOcean }: { obstacles: Obstacle[], isOcean: boolean }) {
  const dummy = new THREE.Object3D();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    obstacles.forEach((ast, i) => {
      // Si es océano, flotan suavemente. Si es espacio, rotan caóticamente.
      if (isOcean) {
         ast.rotation.x = Math.sin(state.clock.elapsedTime + i) * 0.1;
         ast.rotation.z = Math.cos(state.clock.elapsedTime + i) * 0.1;
      } else {
         ast.rotation.add(ast.rotSpeed.clone().multiplyScalar(delta));
      }
      dummy.position.copy(ast.pos);
      if (isOcean) { dummy.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2; }
      dummy.rotation.setFromVector3(ast.rotation);
      dummy.scale.setScalar(ast.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, obstacles.length]}>
      <dodecahedronGeometry args={[1, isOcean ? 1 : 0]} />
      <meshStandardMaterial 
        color={isOcean ? "#0e1726" : "#334155"} 
        roughness={isOcean ? 1 : 0.9} 
      />
    </instancedMesh>
  );
}

function GalaxyCollisionManager({
  shipRef,
  onCollide,
  isActive,
  isWarping,
  obstacles,
}: {
  shipRef: React.RefObject<THREE.Group>;
  onCollide: (id: string, link: string, pos: THREE.Vector3) => void;
  isActive: boolean;
  isWarping: boolean;
  obstacles: Obstacle[];
}) {
  useFrame((state, delta) => {
    if (!isActive || isWarping || !shipRef.current) return;

    PROYECTOS_CORE.forEach((p) => {
      const planetPos = new THREE.Vector3(...p.position);
      if (shipRef.current!.position.distanceTo(planetPos) < 2.8) {
        onCollide(p.id, p.link, planetPos);
      }
    });

    obstacles.forEach((ast) => {
      if (shipRef.current!.position.distanceTo(ast.pos) < ast.scale + 0.8) {
        const pushDir = shipRef.current!.position.clone().sub(ast.pos).normalize();
        shipRef.current!.position.add(pushDir.multiplyScalar(0.8));
      }
    });
  });
  return null;
}

function CentralCore({ isOcean }: { isOcean: boolean }) {
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
        <meshStandardMaterial 
          color={isOcean ? "#fde047" : "#fcd34d"} 
          toneMapped={false} 
          emissive={isOcean ? "#fbbf24" : "#fbbf24"} 
          emissiveIntensity={isOcean ? 2 : 3} 
          wireframe={!isOcean} 
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color={isOcean ? "#fef08a" : "#ffffff"} transparent opacity={isOcean ? 1 : 0.6} />
      </mesh>
      <pointLight 
        color={isOcean ? "#fef08a" : "#fbbf24"} 
        intensity={isOcean ? 4 : 3} 
        distance={50} decay={2} 
      />
    </group>
  );
}

function ProjectPlanet({
  project,
  index,
}: {
  project: (typeof PROYECTOS_CORE)[0];
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const router = useRouter();
  const projectPosition = useMemo(() => new THREE.Vector3(...project.position), [project.position]);

  useFrame((state, delta) => {
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.5;
    if (groupRef.current) {
      groupRef.current.position.copy(projectPosition);
    }
  });

  const handleClick = () => {
    document.body.style.cursor = "auto";
    router.push(project.link);
  };

  return (
    <group ref={groupRef}>
      <Float speed={0} rotationIntensity={0} floatIntensity={0}>
        <mesh
          ref={planetRef}
          scale={hovered ? 1.25 : 1}
          onClick={handleClick}
          onPointerOver={() => {
            setHover(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHover(false);
            document.body.style.cursor = "auto";
          }}
        >
          {index % 2 === 0 ? <torusGeometry args={[0.8, 0.4, 16, 32]} /> : <icosahedronGeometry args={[1, 1]} />}
          <meshStandardMaterial
            color={project.color}
            wireframe
            toneMapped={false}
            emissive={project.color}
            emissiveIntensity={hovered ? 4 : 1.5}
          />
        </mesh>
        <mesh scale={index % 2 === 0 ? 0.6 : 0.8}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={project.color} transparent opacity={0.3} />
        </mesh>
      </Float>
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.42}
        color="white"
        anchorX="center"
        outlineWidth={0.035}
        outlineColor="#020617"
      >
        {project.title}
      </Text>
    </group>
  );
}

function ProjectIsland({
  project,
  index,
}: {
  project: (typeof PROYECTOS_CORE)[0];
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const portalRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const router = useRouter();
  
  // Aplanar las coordenadas Y y alejar las islas muchísimo más (x5.5)
  const projectPosition = useMemo(() => new THREE.Vector3(project.position[0] * 5.5, 0, project.position[2] * 5.5), [project.position]);

  useFrame((state, delta) => {
    if (portalRef.current) {
        portalRef.current.rotation.y += delta * 1.5;
        portalRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.2;
    }
    if (groupRef.current) {
      groupRef.current.position.copy(projectPosition);
    }
  });

  const handleClick = () => {
    document.body.style.cursor = "auto";
    router.push(project.link);
  };

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.02} floatIntensity={0.1}>
        {/* Base de la isla submarina */}
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[5, 6, 2, 12]} />
          <meshStandardMaterial color="#b45309" roughness={1} />
        </mesh>
        
        {/* Playa de arena cartoon */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[4, 5, 0.8, 11]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.8} />
        </mesh>

        {/* Palmera Pirata */}
        <group position={[2.5, 0, 1.5]} rotation={[0, 0, -0.2]}>
           <mesh position={[0, 1, 0]}>
             <cylinderGeometry args={[0.2, 0.3, 2, 5]} />
             <meshStandardMaterial color="#78350f" roughness={1} />
           </mesh>
           <mesh position={[0, 2, 0]}>
             <sphereGeometry args={[1, 6, 6]} />
             <meshStandardMaterial color="#65a30d" roughness={0.6} />
           </mesh>
        </group>

        {/* Cristal de portal / Faro mágico */}
        <mesh
          ref={portalRef}
          scale={hovered ? 1.4 : 1}
          onClick={handleClick}
          onPointerOver={() => {
            setHover(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHover(false);
            document.body.style.cursor = "auto";
          }}
        >
          <octahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color={project.color}
            wireframe
            toneMapped={false}
            emissive={project.color}
            emissiveIntensity={hovered ? 4 : 2}
          />
        </mesh>
        
        {/* Halo de luz sutil */}
        <pointLight position={[0, 1, 0]} color={project.color} intensity={hovered ? 2 : 1} distance={8} />

      </Float>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.42}
        color="white"
        anchorX="center"
        outlineWidth={0.05}
        outlineColor="#020617"
      >
        {project.title}
      </Text>
    </group>
  );
}

function OceanWater() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const positionAttribute = meshRef.current.geometry.attributes.position;
      const vertex = new THREE.Vector3();
      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        // vertex.x and vertex.y are plane coords.
        const wave1 = Math.sin(vertex.x * 0.15 + time) * 0.8;
        const wave2 = Math.cos(vertex.y * 0.15 + time * 0.8) * 0.8;
        vertex.z = wave1 + wave2; // Z in local is Y in world
        positionAttribute.setZ(i, vertex.z);
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
       <planeGeometry args={[300, 300, 80, 80]} />
       <meshStandardMaterial 
          color="#0ea5e9" 
          transparent 
          opacity={0.9} 
          roughness={0.1} 
          metalness={0.2} 
       />
    </mesh>
  );
}

function HomePort() {
  return (
    <group position={[0, -0.6, 5]}>
      <Float speed={1.5} rotationIntensity={0.02} floatIntensity={0.1}>
        {/* Base de arena hundida */}
        <mesh position={[0, -1.8, 0]}>
           <cylinderGeometry args={[5, 6, 2, 10]} />
           <meshStandardMaterial color="#d97706" roughness={1} />
        </mesh>
        {/* Muelle de madera */}
        <mesh position={[0, 0, 0]}>
           <boxGeometry args={[6, 0.4, 6]} />
           <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        {/* Postes del muelle */}
        <mesh position={[-2.8, 0, 2.8]}>
           <cylinderGeometry args={[0.2, 0.2, 1.5, 5]} />
           <meshStandardMaterial color="#451a03" roughness={1} />
        </mesh>
        <mesh position={[2.8, 0, 2.8]}>
           <cylinderGeometry args={[0.2, 0.2, 1.5, 5]} />
           <meshStandardMaterial color="#451a03" roughness={1} />
        </mesh>
        <Text
          position={[0, 2, 0]}
          fontSize={0.6}
          color="#a68659"
          anchorX="center"
          outlineWidth={0.05}
          outlineColor="#020617"
        >
          PUERTO DE SALIDA
        </Text>
      </Float>
    </group>
  );
}

export default function GalaxyScene() {
  const router = useRouter();
  const [themeMode, setThemeMode] = useState<'space' | 'ocean'>('space');
  const [isDriving, setIsDriving] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [warpTarget, setWarpTarget] = useState<THREE.Vector3 | null>(null);
  const [warpType, setWarpType] = useState<"hyperspace" | "wormhole">("hyperspace");
  const shipRef = useRef<THREE.Group>(null);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const obstacleData = useMemo(() => {
    return Array.from({ length: 250 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 28 + Math.random() * 25;
      const y = themeMode === 'ocean' ? 0 : (Math.random() - 0.5) * 15;
      return {
        pos: new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
        rotation: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        rotSpeed: new THREE.Vector3(Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5),
        scale: 0.5 + Math.random() * 2,
      };
    });
  }, [themeMode]);

  const handleCollision = (id: string, link: string, pos: THREE.Vector3) => {
    if (isWarping) return;
    setIsWarping(true);
    setWarpTarget(pos);
    setWarpType(id === "space-sandbox" || id === "aetheria" ? "wormhole" : "hyperspace");
    setTimeout(() => {
      router.push(link);
    }, 1200);
  };

  if (!isReady) return null;

  return (
    <>
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
        {/* Toggle Theme / Vehicle */}
        <div className="flex items-center bg-[#1a120e]/80 p-1 rounded-sm border border-[#8c673d]/40 backdrop-blur-md">
           <button 
             onClick={() => { if (!isDriving && !isWarping) setThemeMode('space') }} 
             disabled={isDriving || isWarping}
             className={`text-xs px-4 py-2 font-bold uppercase transition-all rounded-sm ${themeMode === 'space' ? 'bg-[#8c673d] text-white' : 'text-[#a68659] hover:bg-[#8c673d]/20'} disabled:opacity-50`}
           >
             Espacio
           </button>
           <button 
             onClick={() => { if (!isDriving && !isWarping) setThemeMode('ocean') }} 
             disabled={isDriving || isWarping}
             className={`text-xs px-4 py-2 font-bold uppercase transition-all rounded-sm ${themeMode === 'ocean' ? 'bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-[#a68659] hover:bg-[#8c673d]/20'} disabled:opacity-50`}
           >
             Océano
           </button>
        </div>

        <button
          onClick={async () => {
            if (!isWarping) {
              setIsDriving(!isDriving);
              if (!isDriving && typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
                try {
                  await (DeviceOrientationEvent as any).requestPermission();
                } catch (err) {
                  console.error("Permiso dispositivo denegado", err);
                }
              }
            }
          }}
          className="px-6 py-2 bg-[#1a120e]/70 backdrop-blur-md border border-[#8c673d]/40 text-[#e8dcc4] font-serif font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-[#8c673d] hover:text-[#fdfbf7] shadow-sm transition-all duration-300"
        >
          {isDriving 
             ? (themeMode === 'space' ? "Desmontar Nave" : "Anclar Barco") 
             : (themeMode === 'space' ? "Tomar el Timón" : "Izar Velas")}
        </button>
      </div>

      <Canvas style={{ touchAction: 'none' }} camera={{ fov: 60, position: [0, 15, 35] }}>
        <color attach="background" args={[themeMode === 'space' ? "#010103" : "#38bdf8"]} />
        <ambientLight intensity={themeMode === 'space' ? 0.5 : 1.2} />
        <directionalLight intensity={themeMode === 'ocean' ? 1.5 : 0} position={[10, 20, 10]} color="#fffbeb" />

        <Stars radius={150} depth={50} count={themeMode === 'space' ? 10000 : 0} factor={6} saturation={1} fade speed={isWarping ? 5 : 1} />

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={1.5} mipmapBlur intensity={1.2} />
        </EffectComposer>

        {themeMode === 'ocean' && (
          <>
            <OceanWater />
            <HomePort />
          </>
        )}

        <CentralCore isOcean={themeMode === 'ocean'} />
        {themeMode === 'space' && <Comets />}

        {PROYECTOS_CORE.map((project, index) => (
           themeMode === 'space' 
             ? <ProjectPlanet key={`planet-${project.id}`} project={project} index={index} />
             : <ProjectIsland key={`island-${project.id}`} project={project} index={index} />
        ))}

        {isDriving && themeMode === 'space' && <ObstacleField obstacles={obstacleData} isOcean={false} />}

        {isDriving && !isWarping && (
          themeMode === 'space' 
            ? <Spaceship ref={shipRef} isSandbox={false} />
            : <SailingShip ref={shipRef} isSandbox={false} />
        )}

        <GalaxyCollisionManager
          shipRef={shipRef}
          onCollide={handleCollision}
          isActive={isDriving}
          isWarping={isWarping}
          obstacles={obstacleData}
        />

        <WarpCamera isActive={isWarping} target={warpTarget} type={warpType} />

        {!isDriving && !isWarping && (
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
            maxDistance={80}
            minDistance={8}
            maxPolarAngle={Math.PI / 2 + (themeMode === 'ocean' ? -0.1 : 0.1)} 
          />
        )}
      </Canvas>

      {isDriving && !isWarping && (
        <div className="absolute bottom-20 right-6 z-40 text-[#a68659] font-mono text-[10px] text-right pointer-events-none animate-fade-in drop-shadow-md bg-[#1a120e]/50 p-4 border border-[#8c673d]/30">
          <p className="font-bold text-[#e8dcc4] mb-1">INTERFAZ DE NAVEGACIÓN ACTIVA</p>
          <p>[W] AVANTE   |   [S] ATRÁS</p>
          <p>[A] Babor     |   [D] Estribor</p>
          <p className="mt-1 text-[#cc6640] font-bold">ZONA SEGURA</p>
          <p className="mt-2 text-[#b8a991]">COLISIONE CON EL PUERTO PARA DESEMBARCAR</p>
        </div>
      )}

      <div
        className={`absolute inset-0 pointer-events-none z-[100] transition-colors duration-1000 ease-in-out ${isWarping ? (warpType === "wormhole" ? "bg-[#1e293b]/95" : "bg-[#fcfaf4]") : "bg-transparent"}`}
        style={{ opacity: isWarping ? 1 : 0 }}
      />
    </>
  );
}
