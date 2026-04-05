"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, OrbitControls, Text, Float } from "@react-three/drei";
import { useRef, useState, useEffect, useMemo } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PROYECTOS_CORE } from "@/datos/proyectos";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { Spaceship } from "@/components/3d/Spaceship";

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
    const mesh = meshRef.current;
    if (!mesh) return;
    asteroids.forEach((ast, i) => {
      ast.rotation.add(ast.rotSpeed.clone().multiplyScalar(delta));
      dummy.position.copy(ast.pos);
      dummy.rotation.setFromVector3(ast.rotation);
      dummy.scale.setScalar(ast.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, asteroids.length]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#334155" roughness={0.9} />
    </instancedMesh>
  );
}

function GalaxyCollisionManager({
  shipRef,
  onCollide,
  isActive,
  isWarping,
  asteroids,
}: {
  shipRef: React.RefObject<THREE.Group>;
  onCollide: (id: string, link: string, pos: THREE.Vector3) => void;
  isActive: boolean;
  isWarping: boolean;
  asteroids: Asteroid[];
}) {
  useFrame((state, delta) => {
    if (!isActive || isWarping || !shipRef.current) return;

    PROYECTOS_CORE.forEach((p) => {
      const planetPos = new THREE.Vector3(...p.position);
      if (shipRef.current!.position.distanceTo(planetPos) < 2.2) {
        onCollide(p.id, p.link, planetPos);
      }
    });

    asteroids.forEach((ast) => {
      if (shipRef.current!.position.distanceTo(ast.pos) < ast.scale + 0.4) {
        const pushDir = shipRef.current!.position.clone().sub(ast.pos).normalize();
        shipRef.current!.position.add(pushDir.multiplyScalar(0.5));
      }
    });
  });
  return null;
}

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
        <meshStandardMaterial color="#fcd34d" toneMapped={false} emissive="#fbbf24" emissiveIntensity={3} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <pointLight color="#fbbf24" intensity={3} distance={50} decay={2} />
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

export default function GalaxyScene() {
  const router = useRouter();
  const [isShipMode, setIsShipMode] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [warpTarget, setWarpTarget] = useState<THREE.Vector3 | null>(null);
  const [warpType, setWarpType] = useState<"hyperspace" | "wormhole">("hyperspace");
  const shipRef = useRef<THREE.Group>(null);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const asteroidData = useMemo(() => {
    return Array.from({ length: 250 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 28 + Math.random() * 25;
      const y = (Math.random() - 0.5) * 15;
      return {
        pos: new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
        rotation: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        rotSpeed: new THREE.Vector3(Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5),
        scale: 0.5 + Math.random() * 2,
      };
    });
  }, []);

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
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={async () => {
            if (!isWarping) {
              setIsShipMode(!isShipMode);
              if (!isShipMode && typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
                try {
                  await (DeviceOrientationEvent as any).requestPermission();
                } catch (err) {
                  console.error("Permiso dispositivo denegado", err);
                }
              }
            }
          }}
          className="px-6 py-2 bg-black/40 backdrop-blur-md border border-white/20 text-white font-mono text-sm uppercase tracking-wider rounded-md hover:bg-white hover:text-black hover:border-white transition-all duration-300"
        >
          {isShipMode ? "Desactivar Nave" : "Pilotar Nave (Gyro en Móvil)"}
        </button>
      </div>

      <Canvas style={{ touchAction: 'none' }} camera={{ fov: 60, position: [0, 15, 35] }}>
        <color attach="background" args={["#010103"]} />
        <ambientLight intensity={0.2} />

        <Stars radius={150} depth={50} count={10000} factor={6} saturation={1} fade speed={isWarping ? 5 : 1} />

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={1.5} mipmapBlur intensity={1.2} />
        </EffectComposer>

        <CentralCore />
        <Comets />

        {PROYECTOS_CORE.map((project, index) => (
          <ProjectPlanet key={project.id} project={project} index={index} />
        ))}

        {isShipMode && <AsteroidField asteroids={asteroidData} />}

        {isShipMode && !isWarping && <Spaceship ref={shipRef} isSandbox={false} />}

        <GalaxyCollisionManager
          shipRef={shipRef}
          onCollide={handleCollision}
          isActive={isShipMode}
          isWarping={isWarping}
          asteroids={asteroidData}
        />

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

      {isShipMode && !isWarping && (
        <div className="absolute bottom-20 right-6 z-40 text-white/40 font-mono text-[10px] text-right pointer-events-none animate-fade-in shadow-black drop-shadow-md">
          <p className="font-bold text-white/80 mb-1">INTERFAZ DE VUELO ACTIVA</p>
          <p>[W] ACELERAR   |   [S] FRENAR</p>
          <p>[A] Babor     |   [D] Estribor</p>
          <p className="mt-1 text-red-500 font-bold">ESTADO DE VUELO EXPERIMENTAL (6-DOF)</p>
          <p className="mt-2 text-white/50">INTERSECTAR CON EL PROYECTO PARA ENTRAR</p>
        </div>
      )}

      <div
        className={`absolute inset-0 pointer-events-none z-[100] transition-colors duration-1000 ease-in-out ${isWarping ? (warpType === "wormhole" ? "bg-[#0f0022]/95" : "bg-white") : "bg-transparent"}`}
        style={{ opacity: isWarping ? 1 : 0 }}
      />
    </>
  );
}
