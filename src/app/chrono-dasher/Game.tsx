"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Text } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type GameState = "idle" | "playing" | "gameOver";
type Obstacle = {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  rotation: THREE.Vector3;
  spin: THREE.Vector3;
  color: string;
};

const LANES = [-9, -4.5, 0, 4.5, 9];
const PLAYER_Z = 3.2;
const PLAYER_RADIUS = 0.95;
const OBSTACLE_COUNT = 18;

function createObstacle(id: number, index: number): Obstacle {
  const lane = id === 1 ? 0 : LANES[Math.floor(Math.random() * LANES.length)];
  return {
    id,
    x: lane + (Math.random() - 0.5) * 0.5,
    y: (Math.random() - 0.5) * 1.2,
    z: -34 - index * 15 - Math.random() * 22,
    size: 0.9 + Math.random() * 1.25,
    rotation: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
    spin: new THREE.Vector3(0.45 + Math.random() * 1.1, 0.35 + Math.random() * 1.2, 0.2 + Math.random() * 0.8),
    color: Math.random() > 0.5 ? "#f97316" : "#38bdf8",
  };
}

function recycleObstacle(obstacle: Obstacle, farthestZ: number, elapsed: number) {
  const lane = LANES[Math.floor(Math.random() * LANES.length)];
  obstacle.x = lane + (Math.random() - 0.5) * 0.5;
  obstacle.y = (Math.random() - 0.5) * 1.4;
  obstacle.z = Math.min(farthestZ - 14 - Math.random() * 18, -36 - Math.random() * 20);
  obstacle.size = 0.9 + Math.random() * Math.min(1.75, 1.05 + elapsed * 0.012);
  obstacle.color = Math.random() > 0.45 ? "#f97316" : "#38bdf8";
}

function PlayerShip({ input, playerX }: { input: React.MutableRefObject<{ left: boolean; right: boolean }>; playerX: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  const velocity = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const direction = (input.current.right ? 1 : 0) - (input.current.left ? 1 : 0);
    velocity.current = THREE.MathUtils.lerp(velocity.current, direction * 22, 1 - Math.pow(0.001, delta));
    ref.current.position.x = THREE.MathUtils.clamp(ref.current.position.x + velocity.current * delta, -10.5, 10.5);
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, -direction * 0.42, 1 - Math.pow(0.02, delta));
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, direction * 0.18, 1 - Math.pow(0.02, delta));
    playerX.current = ref.current.position.x;
  });

  return (
    <group ref={ref} position={[0, 0, PLAYER_Z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.92, 1, 1.75]}>
        <coneGeometry args={[0.66, 2.4, 5]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.6} roughness={0.22} emissive="#f97316" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.22, -0.35]} scale={[0.68, 0.22, 0.9]}>
        <sphereGeometry args={[0.58, 24, 12]} />
        <meshStandardMaterial color="#67e8f9" emissive="#0891b2" emissiveIntensity={0.9} roughness={0.12} metalness={0.2} transparent opacity={0.82} />
      </mesh>
      <mesh position={[-0.82, -0.02, 0.1]} rotation={[0.08, 0.08, -0.24]}>
        <boxGeometry args={[1.25, 0.11, 0.52]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.65} />
      </mesh>
      <mesh position={[0.82, -0.02, 0.1]} rotation={[0.08, -0.08, 0.24]}>
        <boxGeometry args={[1.25, 0.11, 0.52]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.65} />
      </mesh>
      <pointLight position={[0, 0, 1.4]} color="#f97316" intensity={2.2} distance={8} />
    </group>
  );
}

function Tunnel({ speedRef }: { speedRef: React.MutableRefObject<number> }) {
  const count = 54;
  const rings = useMemo(() => Array.from({ length: count }, (_, i) => i), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.z += delta * speedRef.current;
    if (groupRef.current.position.z > 18) groupRef.current.position.z = 0;
  });

  return (
    <group ref={groupRef}>
      {rings.map((i) => (
        <group key={i} position={[0, 0, -i * 18]}>
          <mesh>
            <ringGeometry args={[14.8, 15.02, 48]} />
            <meshBasicMaterial color={i % 3 === 0 ? "#38bdf8" : "#f97316"} side={THREE.DoubleSide} transparent opacity={i % 3 === 0 ? 0.42 : 0.55} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <ringGeometry args={[10.4, 10.46, 4]} />
            <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} transparent opacity={0.18} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ObstacleField({
  obstacles,
  playerX,
  speedRef,
  onCrash,
  onScore,
}: {
  obstacles: React.MutableRefObject<Obstacle[]>;
  playerX: React.MutableRefObject<number>;
  speedRef: React.MutableRefObject<number>;
  onCrash: () => void;
  onScore: (delta: number) => void;
}) {
  const meshRefs = useRef<Array<THREE.Group | null>>([]);
  const crashed = useRef(false);
  const scoredDistance = useRef(0);

  useFrame((state, delta) => {
    if (crashed.current) return;
    const elapsed = state.clock.elapsedTime;
    speedRef.current = Math.min(62, 24 + elapsed * 1.25);
    scoredDistance.current += speedRef.current * delta;
    if (scoredDistance.current > 8) {
      scoredDistance.current = 0;
      onScore(1);
    }

    let farthestZ = Math.min(...obstacles.current.map((obstacle) => obstacle.z));
    obstacles.current.forEach((obstacle, index) => {
      obstacle.z += speedRef.current * delta;
      obstacle.rotation.x += obstacle.spin.x * delta;
      obstacle.rotation.y += obstacle.spin.y * delta;
      obstacle.rotation.z += obstacle.spin.z * delta;

      if (obstacle.z > 13) {
        recycleObstacle(obstacle, farthestZ, elapsed);
        farthestZ = Math.min(farthestZ, obstacle.z);
      }

      const mesh = meshRefs.current[index];
      if (mesh) {
        mesh.position.set(obstacle.x, obstacle.y, obstacle.z);
        mesh.rotation.set(obstacle.rotation.x, obstacle.rotation.y, obstacle.rotation.z);
      }

      const dz = Math.abs(obstacle.z - PLAYER_Z);
      const dx = Math.abs(obstacle.x - playerX.current);
      if (dz < obstacle.size + 0.65 && dx < obstacle.size + PLAYER_RADIUS) {
        crashed.current = true;
        onCrash();
      }
    });
  });

  return (
    <>
      {obstacles.current.map((obstacle, index) => (
        <group key={obstacle.id} ref={(mesh) => { meshRefs.current[index] = mesh; }} position={[obstacle.x, obstacle.y, obstacle.z]} rotation={[obstacle.rotation.x, obstacle.rotation.y, obstacle.rotation.z]}>
          <mesh scale={obstacle.size}>
            <octahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color={obstacle.color} emissive={obstacle.color} emissiveIntensity={0.55} metalness={0.35} roughness={0.32} wireframe={index % 4 === 0} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={obstacle.size * 1.25}>
            <torusGeometry args={[0.92, 0.045, 8, 32]} />
            <meshBasicMaterial color="#f8fafc" transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Scene({
  input,
  gameState,
  resetKey,
  onCrash,
  onScore,
}: {
  input: React.MutableRefObject<{ left: boolean; right: boolean }>;
  gameState: GameState;
  resetKey: number;
  onCrash: () => void;
  onScore: (delta: number) => void;
}) {
  const { camera } = useThree();
  const playerX = useRef(0);
  const speedRef = useRef(24);
  const obstacles = useRef<Obstacle[]>([]);

  useEffect(() => {
    speedRef.current = 24;
    playerX.current = 0;
    obstacles.current = Array.from({ length: OBSTACLE_COUNT }, (_, index) => createObstacle(index, index));
  }, [resetKey]);

  useFrame(() => {
    camera.position.lerp(new THREE.Vector3(0, 3.2, 13), 0.08);
    camera.lookAt(0, 0, -18);
  });

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.42} />
      <pointLight position={[0, 0, 4]} color="#f97316" intensity={4.4} distance={24} />
      <pointLight position={[0, 3, -30]} color="#38bdf8" intensity={2.8} distance={70} />
      <Stars radius={180} depth={60} count={2200} factor={5.4} saturation={0} fade speed={1.5} />
      <Tunnel speedRef={speedRef} />
      {gameState === "playing" ? (
        <>
          <PlayerShip input={input} playerX={playerX} />
          <ObstacleField obstacles={obstacles} playerX={playerX} speedRef={speedRef} onCrash={onCrash} onScore={onScore} />
        </>
      ) : null}
      {gameState === "idle" ? (
        <Text position={[0, 0, -12]} fontSize={1.15} color="#fed7aa" anchorX="center">
          Pulsa espacio para entrar
        </Text>
      ) : null}
    </>
  );
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [scoreStatus, setScoreStatus] = useState("Récord local");
  const [resetKey, setResetKey] = useState(0);
  const input = useRef({ left: false, right: false });

  const saveScore = useCallback(async (finalScore: number) => {
    if (finalScore <= 0) return;

    setBestScore((value) => Math.max(value, finalScore));
    try {
      const response = await fetch("/api/arcade/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameKey: "chrono-dasher", score: finalScore }),
      });
      if (!response.ok) {
        setScoreStatus("Inicia sesión para guardar");
        return;
      }
      const data = await response.json();
      setBestScore(data.personalBest ?? finalScore);
      setScoreStatus(data.improved ? "Nuevo récord guardado" : "Récord sincronizado");
    } catch {
      setScoreStatus("Récord local");
    }
  }, []);

  const startRun = () => {
    setScore(0);
    setResetKey((value) => value + 1);
    setGameState("playing");
  };

  const handleCrash = () => {
    setGameState("gameOver");
    void saveScore(score);
    input.current.left = false;
    input.current.right = false;
  };

  useEffect(() => {
    let cancelled = false;
    const loadBestScore = async () => {
      try {
        const response = await fetch("/api/arcade/scores?gameKey=chrono-dasher", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;
        setBestScore(data.personalBest ?? 0);
        setScoreStatus(data.personalBest ? "Récord personal" : "Sin récord guardado");
      } catch {
        if (!cancelled) setScoreStatus("Récord local");
      }
    };

    void loadBestScore();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        event.preventDefault();
        input.current.left = true;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        event.preventDefault();
        input.current.right = true;
      }
      if (event.code === "Space") {
        event.preventDefault();
        setGameState((current) => {
          if (current === "playing") return current;
          setScore(0);
          setResetKey((value) => value + 1);
          return "playing";
        });
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft" || event.code === "KeyA") input.current.left = false;
      if (event.code === "ArrowRight" || event.code === "KeyD") input.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return (
    <div className="relative h-[min(78vh,760px)] min-h-[640px] w-full overflow-hidden rounded-[2rem] bg-black">
      <Canvas className="!absolute inset-0 !h-full !w-full" camera={{ position: [0, 3.2, 13], fov: 72, near: 0.1, far: 260 }} dpr={[1, 1.5]}>
        <Scene input={input} gameState={gameState} resetKey={resetKey} onCrash={handleCrash} onScore={(delta) => setScore((value) => value + delta)} />
      </Canvas>

      <div className="pointer-events-none absolute left-5 top-5 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-200/80">Chrono Dasher</p>
        <div className="mt-2 flex items-end gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Score</p>
            <p className="font-mono text-3xl font-bold text-white">{score}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Mejor</p>
            <p className="font-mono text-lg text-cyan-100">{bestScore}</p>
          </div>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-cyan-100/55">{scoreStatus}</p>
      </div>

      {gameState !== "playing" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-6 text-center text-white backdrop-blur-[2px]">
          <div className="max-w-md rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200/80">{gameState === "gameOver" ? "Impacto crítico" : "Listo para correr"}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{gameState === "gameOver" ? "Ruta perdida" : "Evita los fragmentos temporales"}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {gameState === "gameOver" ? `Puntuación final: ${score}.` : "Muévete entre carriles y esquiva obstáculos cada vez más rápidos."}
            </p>
            <button
              type="button"
              onClick={startRun}
              className="pointer-events-auto mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              {gameState === "gameOver" ? "Reintentar" : "Empezar"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
