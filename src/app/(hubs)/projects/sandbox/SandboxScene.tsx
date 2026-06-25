"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, Text } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type ShipId = "raptor" | "atlas" | "wraith";
type GamePhase = "select" | "sector" | "station" | "duel" | "spectator" | "destroyed";
type WeaponMode = "pulse" | "laser" | "dual" | "triple";

type ShipConfig = {
  id: ShipId;
  name: string;
  className: string;
  description: string;
  speed: number;
  handling: number;
  armor: number;
  shield: number;
  fuel: number;
  damage: number;
  rewardBonus: number;
  color: string;
  accent: string;
  glass: string;
};

type Keys = Record<string, boolean>;

type Projectile = {
  active: boolean;
  enemy: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  damage: number;
};

type HudState = {
  hull: number;
  shield: number;
  fuel: number;
  maxFuel: number;
  heat: number;
  weapon: string;
  credits: number;
  enemyHull: number;
  objective: string;
  prompt: string;
  message: string;
  distanceToDuel: number;
};

type RuntimeState = {
  hull: number;
  shield: number;
  fuel: number;
  maxFuel: number;
  damageBonus: number;
  engineBonus: number;
  heat: number;
  weapon: WeaponMode;
  duelWingmen: number;
};

type AsteroidVisual = {
  key: number;
  position: THREE.Vector3;
  rotation: [number, number, number];
  scale: number;
  color: string;
};

const SHIPS: ShipConfig[] = [
  {
    id: "raptor",
    name: "Astra Raptor",
    className: "Interceptor",
    description: "Ligera, agresiva y precisa. Ideal para duelos rápidos.",
    speed: 34,
    handling: 2.7,
    armor: 82,
    shield: 92,
    fuel: 100,
    damage: 18,
    rewardBonus: 1.15,
    color: "#d8dedf",
    accent: "#6bd0d2",
    glass: "#9be7ee",
  },
  {
    id: "atlas",
    name: "Atlas Meridian",
    className: "Fragata",
    description: "Más pesada, con blindaje alto y cañones estables.",
    speed: 25,
    handling: 1.85,
    armor: 135,
    shield: 120,
    fuel: 130,
    damage: 24,
    rewardBonus: 1,
    color: "#c4b295",
    accent: "#e2a95e",
    glass: "#f0cf9a",
  },
  {
    id: "wraith",
    name: "Nocturne Wraith",
    className: "Caza furtivo",
    description: "Muy maniobrable, frágil, con disparos de plasma intensos.",
    speed: 39,
    handling: 3.2,
    armor: 70,
    shield: 78,
    fuel: 86,
    damage: 21,
    rewardBonus: 1.35,
    color: "#857994",
    accent: "#d498ff",
    glass: "#cab6ff",
  },
];

const DUEL_GATE = new THREE.Vector3(68, 6, -74);
const BASE_POSITION = new THREE.Vector3(40, 0, -58);
const SECTOR_START = new THREE.Vector3(0, 4, 36);
const DUEL_START = new THREE.Vector3(0, 3, 42);
const DUEL_ENEMY_START = new THREE.Vector3(0, 5, -42);
const PROJECTILE_POOL = 44;
const GAMEPLAY_KEYS = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE", "KeyF", "KeyI", "KeyK", "ShiftLeft", "ShiftRight"]);
const WEAPON_NAMES: Record<WeaponMode, string> = {
  pulse: "Pulso",
  laser: "Láser continuo",
  dual: "Dual",
  triple: "Triple",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function makeProjectiles() {
  return Array.from({ length: PROJECTILE_POOL }, () => ({
    active: false,
    enemy: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    life: 0,
    damage: 0,
  }));
}

function makePlanetTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 384;
  const ctx = canvas.getContext("2d")!;

  const sky = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  sky.addColorStop(0, "#27485a");
  sky.addColorStop(0.45, "#315341");
  sky.addColorStop(1, "#9a7142");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 120; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = 35 + Math.random() * 130;
    const h = 12 + Math.random() * 48;
    ctx.fillStyle = i % 3 === 0 ? "rgba(238,226,203,0.34)" : "rgba(52,72,59,0.32)";
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 75; i += 1) {
    ctx.strokeStyle = "rgba(255,245,220,0.16)";
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    const y = Math.random() * canvas.height;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(canvas.width * 0.25, y + Math.random() * 40 - 20, canvas.width * 0.7, y + Math.random() * 60 - 30, canvas.width, y + Math.random() * 40 - 20);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function makeNebulaTexture(seedColor: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(256, 256, 8, 256, 256, 256);
  gradient.addColorStop(0, seedColor);
  gradient.addColorStop(0.38, "rgba(255,255,255,0.12)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 280; i += 1) {
    ctx.fillStyle = `rgba(255,245,220,${Math.random() * 0.06})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 10, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function useKeyboard() {
  const keys = useRef<Keys>({});

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (GAMEPLAY_KEYS.has(event.code)) event.preventDefault();
      keys.current[event.code] = true;
    };
    const up = (event: KeyboardEvent) => {
      if (GAMEPLAY_KEYS.has(event.code)) event.preventDefault();
      keys.current[event.code] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return keys;
}

function DetailedShip({
  config,
  engine = 0,
  enemy = false,
  scale = 1,
}: {
  config: ShipConfig;
  engine?: number;
  enemy?: boolean;
  scale?: number;
}) {
  const wingShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(2.3, -0.38);
    shape.lineTo(0.68, 0.74);
    shape.lineTo(-0.18, 0.28);
    shape.lineTo(0, 0);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 2 });
  }, []);

  const enemyColor = enemy ? "#8f3f38" : config.color;
  const enemyAccent = enemy ? "#ffad86" : config.accent;

  return (
    <group scale={scale}>
      <group rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.03, -0.22]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, config.id === "atlas" ? 3.35 : 2.75]}>
          <cylinderGeometry args={[0.24, config.id === "atlas" ? 0.48 : 0.35, 1.8, 18]} />
          <meshStandardMaterial color={enemyColor} metalness={0.82} roughness={0.28} />
        </mesh>

        <mesh position={[0, 0.05, -1.42]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, config.id === "atlas" ? 1.1 : 0.9]}>
          <coneGeometry args={[config.id === "atlas" ? 0.32 : 0.24, 1.1, 18]} />
          <meshStandardMaterial color="#f2eadc" metalness={0.68} roughness={0.2} />
        </mesh>

        <mesh position={[0, 0.3, -0.62]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.72, 1.72]}>
          <sphereGeometry args={[0.26, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={enemy ? "#ffc3a4" : config.glass} roughness={0.06} metalness={0.1} transparent opacity={0.82} emissive={enemy ? "#a84532" : config.accent} emissiveIntensity={0.65} />
        </mesh>

        <mesh position={[-0.24, 0.05, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.21, 0.92, 16]} />
          <meshStandardMaterial color="#342e2b" metalness={0.86} roughness={0.32} />
        </mesh>
        <mesh position={[0.24, 0.05, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.21, 0.92, 16]} />
          <meshStandardMaterial color="#342e2b" metalness={0.86} roughness={0.32} />
        </mesh>

        <group position={[-0.28, 0.05, 1.07]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.1, 18]} />
            <meshStandardMaterial color={enemyAccent} emissive={enemyAccent} emissiveIntensity={1.6 + engine * 5} toneMapped={false} />
          </mesh>
          <pointLight color={enemyAccent} intensity={0.8 + engine * 3.8} distance={5} />
        </group>
        <group position={[0.28, 0.05, 1.07]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.1, 18]} />
            <meshStandardMaterial color={enemyAccent} emissive={enemyAccent} emissiveIntensity={1.6 + engine * 5} toneMapped={false} />
          </mesh>
          <pointLight color={enemyAccent} intensity={0.8 + engine * 3.8} distance={5} />
        </group>

        <group position={[0, -0.02, -0.12]}>
          <mesh geometry={wingShape} position={[0.2, -0.04, -0.05]} rotation={[0.04, 0.08, -0.08]}>
            <meshStandardMaterial color={enemy ? "#4c2522" : "#2b3334"} metalness={0.74} roughness={0.26} />
          </mesh>
          <mesh geometry={wingShape} position={[-0.2, -0.04, -0.05]} rotation={[0.04, Math.PI - 0.08, 0.08]}>
            <meshStandardMaterial color={enemy ? "#4c2522" : "#2b3334"} metalness={0.74} roughness={0.26} />
          </mesh>
          <mesh position={[-1.62, 0.02, -0.18]} rotation={[0, -0.22, 0]}>
            <boxGeometry args={[0.72, 0.08, 0.18]} />
            <meshStandardMaterial color={enemyAccent} emissive={enemyAccent} emissiveIntensity={0.7} toneMapped={false} />
          </mesh>
          <mesh position={[1.62, 0.02, -0.18]} rotation={[0, 0.22, 0]}>
            <boxGeometry args={[0.72, 0.08, 0.18]} />
            <meshStandardMaterial color={enemyAccent} emissive={enemyAccent} emissiveIntensity={0.7} toneMapped={false} />
          </mesh>
        </group>

        <mesh position={[-0.72, -0.05, -0.72]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.06, 1.05, 12]} />
          <meshStandardMaterial color="#0e0f12" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0.72, -0.05, -0.72]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.06, 1.05, 12]} />
          <meshStandardMaterial color="#0e0f12" metalness={0.92} roughness={0.18} />
        </mesh>

        {config.id === "atlas" ? (
          <>
            <mesh position={[0, -0.25, 0.15]}>
              <boxGeometry args={[0.62, 0.18, 1.45]} />
              <meshStandardMaterial color="#4a3a2a" metalness={0.72} roughness={0.38} />
            </mesh>
            <mesh position={[0, 0.52, 0.15]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.12, 0.88, 0.58]} />
              <meshStandardMaterial color="#6b5133" metalness={0.64} roughness={0.36} />
            </mesh>
          </>
        ) : null}

        {config.id === "wraith" ? (
          <>
            <mesh position={[-0.46, 0.24, 0.02]} rotation={[0.2, 0, 0.44]}>
              <boxGeometry args={[0.08, 1.24, 0.36]} />
              <meshStandardMaterial color="#31213c" metalness={0.78} roughness={0.28} />
            </mesh>
            <mesh position={[0.46, 0.24, 0.02]} rotation={[0.2, 0, -0.44]}>
              <boxGeometry args={[0.08, 1.24, 0.36]} />
              <meshStandardMaterial color="#31213c" metalness={0.78} roughness={0.28} />
            </mesh>
          </>
        ) : null}
      </group>
    </group>
  );
}

function Planet() {
  const texture = useMemo(() => makePlanetTexture(), []);
  return (
    <group position={[-170, -42, -220]}>
      <mesh rotation={[0.15, -0.45, 0.08]}>
        <sphereGeometry args={[52, 96, 48]} />
        <meshStandardMaterial map={texture} roughness={0.74} metalness={0.04} />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[52, 64, 32]} />
        <meshBasicMaterial color="#d7ecff" transparent opacity={0.09} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2.15, 0.14, 0.32]}>
        <torusGeometry args={[66, 1.2, 8, 128]} />
        <meshBasicMaterial color="#f0d3a5" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

function Nebulae() {
  const teal = useMemo(() => makeNebulaTexture("rgba(86,178,180,0.36)"), []);
  const amber = useMemo(() => makeNebulaTexture("rgba(222,153,72,0.28)"), []);

  return (
    <>
      <mesh position={[110, 35, -280]} rotation={[0, -0.36, 0]}>
        <planeGeometry args={[230, 150]} />
        <meshBasicMaterial map={teal} transparent depthWrite={false} opacity={0.72} />
      </mesh>
      <mesh position={[-95, 55, -230]} rotation={[0.05, 0.42, 0.15]}>
        <planeGeometry args={[180, 120]} />
        <meshBasicMaterial map={amber} transparent depthWrite={false} opacity={0.52} />
      </mesh>
    </>
  );
}

function createAsteroidVisuals(duel: boolean): AsteroidVisual[] {
  return Array.from({ length: duel ? 46 : 90 }, (_, index) => ({
    key: index,
    position: new THREE.Vector3(
      (Math.random() - 0.5) * (duel ? 150 : 260),
      (Math.random() - 0.5) * 55,
      -35 - Math.random() * (duel ? 145 : 260),
    ),
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
    scale: 0.8 + Math.random() * (duel ? 3.2 : 5.8),
    color: Math.random() > 0.45 ? "#5b5146" : "#76634e",
  }));
}

function AsteroidField({ asteroids }: { asteroids: AsteroidVisual[] }) {
  return (
    <group>
      {asteroids.map((asteroid) => (
        <Float key={asteroid.key} speed={0.55} rotationIntensity={0.7} floatIntensity={0.4}>
          <mesh position={asteroid.position} rotation={asteroid.rotation} scale={asteroid.scale}>
            <icosahedronGeometry args={[1, 2]} />
            <meshStandardMaterial color={asteroid.color} roughness={0.96} metalness={0.08} flatShading />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function OrbitalBase() {
  return (
    <group position={BASE_POSITION}>
      <Float speed={0.35} rotationIntensity={0.1} floatIntensity={0.25}>
        <group rotation={[0.08, -0.55, 0]}>
          <mesh>
            <cylinderGeometry args={[7.2, 8.8, 18, 32]} />
            <meshStandardMaterial color="#3b352d" metalness={0.72} roughness={0.34} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[17, 0.55, 12, 96]} />
            <meshStandardMaterial color="#9e7b4b" metalness={0.85} roughness={0.22} emissive="#3a2410" emissiveIntensity={0.25} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.78]}>
            <torusGeometry args={[24, 0.32, 8, 128]} />
            <meshStandardMaterial color="#6aa8a8" metalness={0.58} roughness={0.26} emissive="#1b5758" emissiveIntensity={0.4} />
          </mesh>
          {Array.from({ length: 8 }, (_, index) => {
            const angle = (index / 8) * Math.PI * 2;
            return (
              <group key={index} rotation={[0, angle, 0]}>
                <mesh position={[0, 0, 15]}>
                  <boxGeometry args={[2.2, 0.22, 10]} />
                  <meshStandardMaterial color="#4d4438" metalness={0.72} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.15, 21]}>
                  <boxGeometry args={[3.6, 0.1, 4.5]} />
                  <meshStandardMaterial color="#1b2e2f" metalness={0.48} roughness={0.42} emissive="#315d5f" emissiveIntensity={0.18} />
                </mesh>
              </group>
            );
          })}
          <mesh position={[0, -6.5, 0]}>
            <boxGeometry args={[10, 2.2, 7]} />
            <meshStandardMaterial color="#211a14" metalness={0.64} roughness={0.36} />
          </mesh>
          <pointLight position={[0, 2, 0]} color="#d6a65c" intensity={2.8} distance={55} />
          <pointLight position={[0, -4, 18]} color="#6aa8a8" intensity={2.1} distance={42} />
        </group>
      </Float>
      <Text position={[0, 16, 0]} fontSize={3.1} color="#f7ead7" anchorX="center">
        Bastion Aurelia
      </Text>
    </group>
  );
}

function DuelGate() {
  return (
    <group position={DUEL_GATE}>
      <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.65}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[9, 0.24, 12, 96]} />
          <meshStandardMaterial color="#d6a65c" emissive="#a45f25" emissiveIntensity={1.2} metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[13, 0.12, 8, 96]} />
          <meshBasicMaterial color="#6aa8a8" transparent opacity={0.55} />
        </mesh>
        <pointLight color="#d6a65c" intensity={2.6} distance={35} />
      </Float>
      <Text position={[0, 12, 0]} fontSize={2.5} color="#f8dfb6" anchorX="center">
        Zona de duelo
      </Text>
    </group>
  );
}

function DuelArena() {
  return (
    <group>
      <mesh position={[0, -8, -40]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[72, 0.35, 8, 160]} />
        <meshBasicMaterial color="#d6a65c" transparent opacity={0.58} />
      </mesh>
      <mesh position={[0, -8, -40]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[38, 0.16, 8, 128]} />
        <meshBasicMaterial color="#6aa8a8" transparent opacity={0.42} />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 72, -7, -40 + Math.sin(angle) * 72]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[1.4, 9, 1.4]} />
            <meshStandardMaterial color="#5e4a34" metalness={0.72} roughness={0.3} emissive="#5e3317" emissiveIntensity={0.35} />
          </mesh>
        );
      })}
      <Text position={[0, 18, -78]} fontSize={4} color="#f7ead7" anchorX="center">
        Arena Meridian
      </Text>
    </group>
  );
}

const STATION_POINTS = [
  {
    id: "ownShip",
    label: "Tu nave",
    detail: "Subir a la nave y despegar",
    position: new THREE.Vector3(-10, 1.2, 8),
  },
  {
    id: "fuelHose",
    label: "Manguera",
    detail: "Coger manguera de combustible",
    position: new THREE.Vector3(-17, 1.2, 5.8),
  },
  {
    id: "fuelPort",
    label: "Puerto",
    detail: "Conectar manguera al puerto de la nave",
    position: new THREE.Vector3(-11.6, 1.2, 4.5),
  },
  {
    id: "fuelPay",
    label: "Pago",
    detail: "Pagar 120 cr para repostar 45 unidades",
    position: new THREE.Vector3(-18.2, 1.2, 9.2),
  },
  {
    id: "mechanic",
    label: "Mecánico",
    detail: "Mejora de motor, blindaje y depósito: 420 cr",
    position: new THREE.Vector3(17, 1.2, -3),
  },
  {
    id: "armorerLaser",
    label: "Láser",
    detail: "Instalar láser continuo: 520 cr",
    position: new THREE.Vector3(-16, 5.8, -27),
  },
  {
    id: "armorerDual",
    label: "Dual",
    detail: "Instalar arma dual: 360 cr",
    position: new THREE.Vector3(-9.5, 5.8, -27),
  },
  {
    id: "armorerTriple",
    label: "Triple",
    detail: "Instalar triple disparo: 480 cr",
    position: new THREE.Vector3(-3, 5.8, -27),
  },
  {
    id: "cards",
    label: "Cartas",
    detail: "Jugar una mano rápida en el restaurante",
    position: new THREE.Vector3(11.5, 5.8, -27),
  },
  {
    id: "quarters",
    label: "Camarote",
    detail: "Abrir panel web y ver amigos conectados",
    position: new THREE.Vector3(0, 5.8, -38),
  },
  {
    id: "combat1v1",
    label: "Kael Voss",
    detail: "Duelo 1 vs 1 por créditos",
    position: new THREE.Vector3(14, 5.8, -39),
  },
  {
    id: "combat3v3",
    label: "Escuadrón",
    detail: "Duelo 3 vs 3 con aliados",
    position: new THREE.Vector3(20, 5.8, -39),
  },
  {
    id: "betting",
    label: "Apuestas",
    detail: "Vista aérea de combate 2 vs 2",
    position: new THREE.Vector3(24, 5.8, -32),
  },
] as const;

function StationInterior({ ship }: { ship: ShipConfig }) {
  const parkedShips = useMemo(
    () => [
      { config: ship, position: [-10, 0.68, 8] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number], own: true },
      { config: SHIPS[0], position: [1.5, 0.62, 8.5] as [number, number, number], rotation: [0, Math.PI * 0.92, 0] as [number, number, number], own: false },
      { config: SHIPS[1], position: [12.5, 0.68, 8] as [number, number, number], rotation: [0, Math.PI * 1.06, 0] as [number, number, number], own: false },
    ],
    [ship],
  );

  return (
    <group>
      <color attach="background" args={["#070708"]} />
      <fog attach="fog" args={["#070708", 48, 128]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[18, 24, 10]} intensity={1.8} color="#ffe6c0" />
      <pointLight position={[0, 8, 1]} color="#d6a65c" intensity={5.8} distance={55} />
      <pointLight position={[-18, 6, 7]} color="#6aa8a8" intensity={2.2} distance={28} />
      <pointLight position={[18, 6, -22]} color="#d6a65c" intensity={2.6} distance={36} />

      <mesh position={[0, -0.08, -10]} receiveShadow>
        <boxGeometry args={[60, 0.18, 72]} />
        <meshStandardMaterial color="#211b16" metalness={0.5} roughness={0.48} />
      </mesh>
      <mesh position={[0, 11, -10]}>
        <boxGeometry args={[60, 0.35, 72]} />
        <meshStandardMaterial color="#15120f" metalness={0.42} roughness={0.62} />
      </mesh>
      <mesh position={[-30, 5.5, -10]}>
        <boxGeometry args={[0.5, 11, 72]} />
        <meshStandardMaterial color="#17130f" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[30, 5.5, -10]}>
        <boxGeometry args={[0.5, 11, 72]} />
        <meshStandardMaterial color="#17130f" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 5.5, -46]}>
        <boxGeometry args={[60, 11, 0.55]} />
        <meshStandardMaterial color="#17130f" metalness={0.5} roughness={0.5} />
      </mesh>

      {Array.from({ length: 8 }, (_, index) => (
        <group key={index} position={[-24 + index * 7, 0.05, 8]}>
          <mesh>
            <boxGeometry args={[3.8, 0.08, 13.4]} />
            <meshStandardMaterial color={index % 2 ? "#2b241d" : "#342b21"} metalness={0.35} roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.18, 0.05, 13.8]} />
            <meshStandardMaterial color="#d6a65c" emissive="#5c3315" emissiveIntensity={0.55} />
          </mesh>
        </group>
      ))}

      {parkedShips.map((parked, index) => (
        <group key={`${parked.config.id}-${index}`} position={parked.position} rotation={parked.rotation}>
          <mesh position={[0, -0.48, 0]}>
            <boxGeometry args={[7.8, 0.16, 10.5]} />
            <meshStandardMaterial color={parked.own ? "#342b21" : "#25211d"} metalness={0.5} roughness={0.42} />
          </mesh>
          <DetailedShip config={parked.config} engine={parked.own ? 0.18 : 0} scale={1.85} />
          <mesh position={[0, 0.06, -4.8]}>
            <boxGeometry args={[6.2, 0.12, 0.4]} />
            <meshStandardMaterial color={parked.own ? parked.config.accent : "#6f6558"} emissive={parked.own ? parked.config.accent : "#2b241d"} emissiveIntensity={parked.own ? 0.75 : 0.28} />
          </mesh>
        </group>
      ))}

      {[-10, 1.5, 12.5].map((x, index) => (
        <group key={x} position={[x - 7, 0, 5.8]}>
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[1.35, 2.3, 1]} />
            <meshStandardMaterial color="#273b3b" metalness={0.6} roughness={0.34} emissive="#163536" emissiveIntensity={0.28} />
          </mesh>
          <mesh position={[0, 2.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.07, 8, 32]} />
            <meshStandardMaterial color="#6aa8a8" emissive="#315d5f" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[1.95, 0.62, 0.08]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055, 0.055, 4.1, 10]} />
            <meshStandardMaterial color={index === 0 ? "#111010" : "#2d2925"} roughness={0.72} />
          </mesh>
        </group>
      ))}

      <group position={[-11.6, 0.55, 4.5]}>
        <mesh>
          <boxGeometry args={[1.4, 0.65, 0.16]} />
          <meshStandardMaterial color="#101417" metalness={0.4} roughness={0.34} emissive="#6aa8a8" emissiveIntensity={0.45} />
        </mesh>
      </group>

      <group position={[17, 0, -3]}>
        <mesh position={[0, 1.45, 0]}>
          <boxGeometry args={[8.5, 2.9, 5.2]} />
          <meshStandardMaterial color="#403123" metalness={0.62} roughness={0.32} emissive="#4c2b12" emissiveIntensity={0.34} />
        </mesh>
        <mesh position={[-2.3, 3.15, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.35, 0.08, 8, 48]} />
          <meshStandardMaterial color="#d6a65c" emissive="#9e5f24" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[2.35, 2.55, 0.85]} rotation={[0.18, 0, 0.2]}>
          <boxGeometry args={[2.6, 0.18, 1.6]} />
          <meshStandardMaterial color="#7d6a4f" metalness={0.68} roughness={0.28} />
        </mesh>
        <Text position={[0, 4.65, 0]} fontSize={1.05} color="#d6a65c" anchorX="center">
          TALLER Y MECÁNICO
        </Text>
      </group>

      <group position={[0, 0.05, -15]} rotation={[-0.18, 0, 0]}>
        <mesh position={[-18, 2.55, 0]}>
          <boxGeometry args={[6, 0.24, 18]} />
          <meshStandardMaterial color="#3a3026" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[18, 2.55, 0]}>
          <boxGeometry args={[6, 0.24, 18]} />
          <meshStandardMaterial color="#3a3026" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      <group position={[0, 5.15, -31]}>
        <mesh position={[-10, 0, 0]}>
          <boxGeometry args={[19, 0.22, 11]} />
          <meshStandardMaterial color="#2b241d" metalness={0.48} roughness={0.42} />
        </mesh>
        <mesh position={[12, 0, 0]}>
          <boxGeometry args={[22, 0.22, 11]} />
          <meshStandardMaterial color="#2a211b" metalness={0.48} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0, -8.7]}>
          <boxGeometry args={[58, 0.22, 11]} />
          <meshStandardMaterial color="#2c251e" metalness={0.48} roughness={0.42} />
        </mesh>

        <Text position={[-10, 2.4, -4.8]} fontSize={0.9} color="#f8dfb6" anchorX="center">
          ARMERÍA
        </Text>
        <Text position={[12, 2.4, -4.8]} fontSize={0.9} color="#f8dfb6" anchorX="center">
          RESTAURANTE
        </Text>
        <Text position={[0, 2.4, -13.4]} fontSize={0.9} color="#f8dfb6" anchorX="center">
          CAMAROTES Y COMBATE
        </Text>

        {[
          [-16, -1.6, "#6aa8a8"],
          [-9.5, -1.6, "#d6a65c"],
          [-3, -1.6, "#b86854"],
        ].map(([x, z, color], index) => (
          <group key={index} position={[x as number, 0.18, z as number]}>
            <mesh position={[0, 0.75, 0]}>
              <boxGeometry args={[4.3, 1.5, 2.2]} />
              <meshStandardMaterial color="#17130f" metalness={0.55} roughness={0.36} emissive={color as string} emissiveIntensity={0.18} />
            </mesh>
            <mesh position={[0, 1.7, -0.75]}>
              <boxGeometry args={[3.4, 0.12, 0.16]} />
              <meshStandardMaterial color={color as string} emissive={color as string} emissiveIntensity={0.75} />
            </mesh>
          </group>
        ))}

        <group position={[11.5, 0.18, -1.5]}>
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[2.2, 2.2, 0.22, 6]} />
            <meshStandardMaterial color="#463525" metalness={0.4} roughness={0.46} />
          </mesh>
          {Array.from({ length: 6 }, (_, index) => (
            <mesh key={index} position={[Math.cos(index) * 2.9, 0.54, Math.sin(index) * 2.1]} rotation={[0, index, 0]}>
              <boxGeometry args={[0.55, 1, 0.55]} />
              <meshStandardMaterial color="#2a211b" metalness={0.35} roughness={0.5} />
            </mesh>
          ))}
        </group>

        <group position={[0, 0.2, -9.4]}>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[7.5, 1.9, 3.6]} />
            <meshStandardMaterial color="#1c2525" metalness={0.42} roughness={0.38} emissive="#315d5f" emissiveIntensity={0.22} />
          </mesh>
          <mesh position={[0, 2.15, -1.2]}>
            <boxGeometry args={[5.5, 0.12, 0.18]} />
            <meshStandardMaterial color="#6aa8a8" emissive="#6aa8a8" emissiveIntensity={0.85} />
          </mesh>
        </group>

        <group position={[19, 0.2, -8.8]}>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[13, 2.1, 4]} />
            <meshStandardMaterial color="#241914" metalness={0.45} roughness={0.4} emissive="#8f3f38" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, 2.35, -1.65]}>
            <boxGeometry args={[11.5, 0.18, 0.2]} />
            <meshStandardMaterial color="#d6a65c" emissive="#a45f25" emissiveIntensity={0.85} />
          </mesh>
        </group>
      </group>

      <mesh position={[0, 4.2, 19.5]}>
        <boxGeometry args={[18, 8, 0.4]} />
        <meshStandardMaterial color="#0a0d11" metalness={0.35} roughness={0.42} emissive="#2a1a0b" emissiveIntensity={0.35} />
      </mesh>
      <Text position={[0, 5.2, 19.15]} fontSize={1.3} color="#f8dfb6" anchorX="center">
        SALIDA AL MUELLE
      </Text>
      <Text position={[0, 7.6, 12.5]} fontSize={1.25} color="#f7ead7" anchorX="center">
        Garaje Bastion Aurelia
      </Text>
    </group>
  );
}

function ProjectileMeshes({ projectiles }: { projectiles: React.MutableRefObject<Projectile[]> }) {
  const refs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame(() => {
    projectiles.current.forEach((projectile, index) => {
      const mesh = refs.current[index];
      if (!mesh) return;
      mesh.visible = projectile.active;
      if (projectile.active) {
        mesh.position.copy(projectile.position);
        mesh.lookAt(projectile.position.clone().add(projectile.velocity));
      }
    });
  });

  return (
    <>
      {projectiles.current.map((projectile, index) => (
        <mesh key={index} ref={(mesh) => { refs.current[index] = mesh; }} visible={false}>
          <capsuleGeometry args={[0.08, 1.4, 4, 8]} />
          <meshBasicMaterial color={projectile.enemy ? "#ff9b73" : "#7de4e1"} />
          <pointLight color={projectile.enemy ? "#ff815f" : "#6bd0d2"} intensity={0.8} distance={5} />
        </mesh>
      ))}
    </>
  );
}

function StationController({
  ship,
  runtime,
  credits,
  setCredits,
  setPhase,
  setHud,
}: {
  ship: ShipConfig;
  runtime: React.MutableRefObject<RuntimeState>;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  setPhase: (phase: GamePhase) => void;
  setHud: React.Dispatch<React.SetStateAction<HudState>>;
}) {
  const keys = useKeyboard();
  const { camera } = useThree();
  const position = useRef(new THREE.Vector3(0, 2.2, 3));
  const yaw = useRef(Math.PI);
  const interactLatch = useRef(false);
  const nearby = useRef<(typeof STATION_POINTS)[number] | null>(null);
  const lastHudAt = useRef(0);
  const hasFuelHose = useRef(false);
  const fuelConnected = useRef(false);
  const stationMessage = useRef("Recorre la estación, compra suministros o busca pilotos para retar.");

  useFrame((state, delta) => {
    const forward = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const speed = (keys.current.ShiftLeft || keys.current.ShiftRight ? 10.5 : 6.2) * delta;

    if (keys.current.KeyQ || keys.current.ArrowLeft) yaw.current += 0.045;
    if (keys.current.KeyE || keys.current.ArrowRight) yaw.current -= 0.045;
    if (keys.current.KeyW || keys.current.ArrowUp) position.current.addScaledVector(forward, speed);
    if (keys.current.KeyS || keys.current.ArrowDown) position.current.addScaledVector(forward, -speed);
    if (keys.current.KeyA) position.current.addScaledVector(right, -speed);
    if (keys.current.KeyD) position.current.addScaledVector(right, speed);

    position.current.x = clamp(position.current.x, -26.5, 26.5);
    position.current.z = clamp(position.current.z, -42, 16);
    position.current.y = position.current.z < -20 ? 6.35 : 2.2;

    camera.position.lerp(position.current, 0.42);
    camera.lookAt(position.current.clone().addScaledVector(forward, 8).add(new THREE.Vector3(0, -1.15, 0)));

    const closest = STATION_POINTS.reduce<{ point: (typeof STATION_POINTS)[number] | null; dist: number }>(
      (best, point) => {
        const dist = position.current.distanceTo(point.position);
        return dist < best.dist ? { point, dist } : best;
      },
      { point: null, dist: Infinity },
    );
    nearby.current = closest.dist < 6.7 ? closest.point : null;

    if (position.current.z > 14.5 && keys.current.KeyF && !interactLatch.current) {
      setPhase("sector");
      interactLatch.current = true;
      setHud((current) => ({
        ...current,
        objective: "Explora el sector y busca contratos",
        prompt: "Acércate al anillo o vuelve a la estación",
        message: "Has salido de Bastion Aurelia.",
      }));
    }

    if (keys.current.KeyF && nearby.current && !interactLatch.current) {
      interactLatch.current = true;
      const action = nearby.current.id;

      if (action === "ownShip") {
        setPhase("sector");
        stationMessage.current = "Subes por la escotilla, cierras compuertas y sales del hangar.";
        setHud((current) => ({
          ...current,
          objective: "Explora el sector y busca contratos",
          prompt: "Arrastra para girar, W/S motor, A/D rumbo",
          message: stationMessage.current,
        }));
      }

      if (action === "fuelHose") {
        hasFuelHose.current = true;
        stationMessage.current = "Manguera cogida. Llévala al rectángulo iluminado del puerto de carga de tu nave.";
      }

      if (action === "fuelPort") {
        if (hasFuelHose.current) {
          fuelConnected.current = true;
          stationMessage.current = "Manguera conectada. Ahora puedes pagar combustible en el terminal de la plaza.";
        } else {
          stationMessage.current = "Primero tienes que coger la manguera de la estación de gasolina.";
        }
      }

      if (action === "fuelPay") {
        if (!fuelConnected.current) {
          stationMessage.current = "Conecta la manguera al puerto de tu nave antes de pagar.";
        } else if (runtime.current.fuel >= runtime.current.maxFuel) {
          stationMessage.current = "El depósito ya está lleno.";
        } else if (credits >= 120) {
          runtime.current.fuel = Math.min(runtime.current.maxFuel, runtime.current.fuel + 45);
          setCredits((value) => value - 120);
          stationMessage.current = "Pago aceptado: +45 unidades de gasolina cargadas.";
        } else {
          stationMessage.current = "No tienes 120 créditos para este tramo de combustible.";
        }
      }

      if (action === "mechanic") {
        if (credits >= 420) {
          runtime.current.damageBonus += 4;
          runtime.current.engineBonus += 3;
          runtime.current.maxFuel += 12;
          runtime.current.fuel = runtime.current.maxFuel;
          setCredits((value) => value - 420);
          stationMessage.current = "El mecánico instala motor afinado, refuerzo de armas y depósito ampliado.";
        } else {
          stationMessage.current = "El taller exige 420 créditos por la mejora completa.";
        }
      }

      if (action === "armorerLaser" || action === "armorerDual" || action === "armorerTriple") {
        const weaponByAction: Record<"armorerLaser" | "armorerDual" | "armorerTriple", { mode: WeaponMode; cost: number; label: string }> = {
          armorerLaser: { mode: "laser", cost: 520, label: "láser continuo" },
          armorerDual: { mode: "dual", cost: 360, label: "arma dual" },
          armorerTriple: { mode: "triple", cost: 480, label: "triple disparo" },
        };
        const offer = weaponByAction[action];
        if (credits >= offer.cost) {
          runtime.current.weapon = offer.mode;
          runtime.current.heat = 0;
          setCredits((value) => value - offer.cost);
          stationMessage.current = `Armero: ${offer.label} instalada. Puedes probarla en combate.`;
        } else {
          stationMessage.current = `El armero pide ${offer.cost} créditos para esa arma.`;
        }
      }

      if (action === "cards") {
        const win = Math.random() > 0.45;
        const amount = win ? 75 : 35;
        setCredits((value) => (win ? value + amount : Math.max(0, value - amount)));
        stationMessage.current = win ? `Buena mano en el restaurante: +${amount} créditos.` : `Mala mano de cartas: -${amount} créditos.`;
      }

      if (action === "quarters") {
        stationMessage.current = "Camarote conectado: amigos online ahora mismo: Mara, Niko y Vega. Desde el panel inferior puedes saltar a otras zonas de la web.";
      }

      if (action === "combat1v1") {
        runtime.current.duelWingmen = 0;
        stationMessage.current = "Kael Voss acepta el reto. La arena 1 vs 1 está preparada.";
        setPhase("duel");
      }

      if (action === "combat3v3") {
        runtime.current.duelWingmen = 2;
        stationMessage.current = "Contrato 3 vs 3 firmado. Dos aliados entrarán contigo en la arena.";
        setPhase("duel");
      }

      if (action === "betting") {
        stationMessage.current = "Apuesta registrada. Abriendo vista aérea del combate 2 vs 2.";
        setPhase("spectator");
      }

      setHud((current) => ({ ...current, message: stationMessage.current }));
    }

    if (!keys.current.KeyF) interactLatch.current = false;

    const prompt = nearby.current
      ? `F: ${nearby.current.detail}`
      : position.current.z > 12
        ? "F: salir al muelle"
        : "WASD andar, Q/E girar, F interactuar";

    if (state.clock.elapsedTime - lastHudAt.current > 0.18) {
      lastHudAt.current = state.clock.elapsedTime;
      setHud({
        hull: Math.round(runtime.current.hull),
        shield: Math.round(runtime.current.shield),
        fuel: Math.round(runtime.current.fuel),
        maxFuel: Math.round(runtime.current.maxFuel),
        heat: Math.round(runtime.current.heat),
        weapon: WEAPON_NAMES[runtime.current.weapon],
        credits,
        enemyHull: 0,
        objective: "Bastion Aurelia",
        prompt,
        message: nearby.current ? nearby.current.detail : stationMessage.current,
        distanceToDuel: 0,
      });
    }
  });

  return (
    <>
      {STATION_POINTS.map((point) => (
        <Text key={point.id} position={[point.position.x, point.position.y + 3.2, point.position.z]} fontSize={0.62} color="#f8dfb6" anchorX="center">
          {point.label}
        </Text>
      ))}
      <Text position={[position.current.x, 0.05, position.current.z]} fontSize={0.45} color={ship.accent} anchorX="center">
        {ship.name}
      </Text>
    </>
  );
}

function GameController({
  ship,
  runtime,
  asteroids,
  phase,
  setPhase,
  credits,
  setCredits,
  setHud,
}: {
  ship: ShipConfig;
  runtime: React.MutableRefObject<RuntimeState>;
  asteroids: AsteroidVisual[];
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  setHud: React.Dispatch<React.SetStateAction<HudState>>;
}) {
  const keys = useKeyboard();
  const { camera } = useThree();
  const playerRef = useRef<THREE.Group>(null);
  const enemyRef = useRef<THREE.Group>(null);
  const projectiles = useRef<Projectile[]>(makeProjectiles());
  const velocity = useRef(new THREE.Vector3());
  const enemyHull = useRef(170);
  const lastShot = useRef(0);
  const enemyShot = useRef(0);
  const duelInitialized = useRef(false);
  const sectorInitialized = useRef(false);
  const message = useRef("Elige rumbo hacia Bastion Aurelia. La zona de duelo está junto al anillo exterior.");
  const pointer = useRef({ active: false, x: 0, y: 0 });

  const spawnShot = useCallback((enemy: boolean, origin: THREE.Vector3, direction: THREE.Vector3, damage: number) => {
    const slot = projectiles.current.find((projectile) => !projectile.active);
    if (!slot) return;
    slot.active = true;
    slot.enemy = enemy;
    slot.position.copy(origin);
    slot.velocity.copy(direction.normalize().multiplyScalar(enemy ? 46 : 68));
    slot.life = enemy ? 2.4 : 1.8;
    slot.damage = damage;
  }, []);

  const spawnPlayerWeapon = useCallback(
    (origin: THREE.Vector3, forward: THREE.Vector3, player: THREE.Group) => {
      const baseDamage = ship.damage + runtime.current.damageBonus;
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(player.quaternion);
      if (runtime.current.weapon === "dual") {
        spawnShot(false, origin.clone().addScaledVector(right, -1.25), forward, baseDamage * 0.78);
        spawnShot(false, origin.clone().addScaledVector(right, 1.25), forward, baseDamage * 0.78);
        return;
      }
      if (runtime.current.weapon === "triple") {
        spawnShot(false, origin, forward, baseDamage * 0.76);
        spawnShot(false, origin.clone().addScaledVector(right, -0.9), forward.clone().addScaledVector(right, -0.16), baseDamage * 0.68);
        spawnShot(false, origin.clone().addScaledVector(right, 0.9), forward.clone().addScaledVector(right, 0.16), baseDamage * 0.68);
        return;
      }
      spawnShot(false, origin, forward, baseDamage);
    },
    [runtime, ship.damage, spawnShot],
  );

  useEffect(() => {
    runtime.current.hull = ship.armor;
    runtime.current.shield = ship.shield;
    runtime.current.fuel = runtime.current.maxFuel || ship.fuel;
    runtime.current.heat = 0;
    velocity.current.set(0, 0, 0);
    sectorInitialized.current = false;
    duelInitialized.current = false;
  }, [runtime, ship]);

  useEffect(() => {
    const down = () => {
      pointer.current.active = true;
    };
    const up = () => {
      pointer.current.active = false;
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    const move = (event: PointerEvent) => {
      if (!pointer.current.active) return;
      pointer.current.x = clamp(pointer.current.x + event.movementX * 0.0025, -1.4, 1.4);
      pointer.current.y = clamp(pointer.current.y + event.movementY * 0.0025, -1.1, 1.1);
    };

    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  useFrame((state, delta) => {
    const player = playerRef.current;
    if (!player) return;

    if (phase === "sector" && !sectorInitialized.current) {
      player.position.copy(SECTOR_START);
      player.rotation.set(0, 0, 0);
      player.quaternion.identity();
      velocity.current.set(0, 0, 0);
      message.current = "Localiza la base y entra en el anillo de duelo para combatir por créditos.";
      sectorInitialized.current = true;
      duelInitialized.current = false;
    }

    if (phase === "duel" && !duelInitialized.current) {
      player.position.copy(DUEL_START);
      player.rotation.set(0, 0, 0);
      player.quaternion.identity();
      velocity.current.set(0, 0, -8);
      enemyHull.current = 185;
      runtime.current.hull = Math.min(ship.armor, runtime.current.hull + 18);
      runtime.current.shield = ship.shield;
      projectiles.current.forEach((projectile) => { projectile.active = false; });
      if (enemyRef.current) {
        enemyRef.current.position.copy(DUEL_ENEMY_START);
        enemyRef.current.rotation.set(0, Math.PI, 0);
      }
      message.current = "Duelo iniciado. Rompe escudos y derriba la nave rival.";
      duelInitialized.current = true;
      sectorInitialized.current = false;
    }

    if (phase === "destroyed") {
      velocity.current.multiplyScalar(0.92);
    }

    const turn = ship.handling * delta;
    if (phase !== "destroyed") {
      if (keys.current.ArrowUp || keys.current.KeyI) player.rotateX(-turn);
      if (keys.current.ArrowDown || keys.current.KeyK) player.rotateX(turn);
      if (keys.current.ArrowLeft || keys.current.KeyA) player.rotateY(turn);
      if (keys.current.ArrowRight || keys.current.KeyD) player.rotateY(-turn);
      if (keys.current.KeyQ) player.rotateZ(turn * 0.8);
      if (keys.current.KeyE) player.rotateZ(-turn * 0.8);
      player.rotateY(-pointer.current.x * delta * 1.6);
      player.rotateX(-pointer.current.y * delta * 1.2);
      pointer.current.x *= 0.88;
      pointer.current.y *= 0.88;
    }

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion);
    const thrusting = keys.current.KeyW || keys.current.ShiftLeft || keys.current.ShiftRight;
    const braking = keys.current.KeyS;
    const hasFuel = runtime.current.fuel > 0 || phase === "duel";
    const tunedSpeed = ship.speed + runtime.current.engineBonus;
    const thrust = thrusting && hasFuel ? tunedSpeed * (keys.current.ShiftLeft || keys.current.ShiftRight ? 1.32 : 1) : braking ? -tunedSpeed * 0.62 : 0;
    if (thrusting && phase === "sector") {
      runtime.current.fuel = Math.max(0, runtime.current.fuel - delta * (keys.current.ShiftLeft || keys.current.ShiftRight ? 8.5 : 4.2));
    }
    velocity.current.addScaledVector(forward, thrust * delta);
    velocity.current.multiplyScalar(0.985);
    velocity.current.clampLength(0, tunedSpeed * 1.45);
    player.position.addScaledVector(velocity.current, delta);

    if (phase === "sector") {
      player.position.x = clamp(player.position.x, -145, 145);
      player.position.y = clamp(player.position.y, -35, 52);
      player.position.z = clamp(player.position.z, -210, 70);
    } else if (phase === "duel") {
      player.position.x = clamp(player.position.x, -78, 78);
      player.position.y = clamp(player.position.y, -24, 44);
      player.position.z = clamp(player.position.z, -112, 52);
    }

    for (const asteroid of asteroids) {
      const minDistance = asteroid.scale + 2.25;
      const diff = player.position.clone().sub(asteroid.position);
      const distance = diff.length();
      if (distance < minDistance) {
        const normal = distance > 0.001 ? diff.normalize() : new THREE.Vector3(0, 1, 0);
        player.position.copy(asteroid.position.clone().addScaledVector(normal, minDistance));
        velocity.current.reflect(normal).multiplyScalar(0.36);
        const impact = (minDistance - distance + velocity.current.length() * 0.03) * 6.5;
        const absorbed = Math.min(runtime.current.shield, impact);
        runtime.current.shield -= absorbed;
        runtime.current.hull = Math.max(0, runtime.current.hull - (impact - absorbed));
        message.current = "Impacto con asteroide: trayectoria corregida y casco dañado.";
        if (runtime.current.hull <= 0) {
          setPhase("destroyed");
          message.current = "Nave destruida contra un asteroide.";
        }
        break;
      }
    }

    const firing = keys.current.Space && phase !== "destroyed";
    if (runtime.current.weapon === "laser") {
      if (firing && runtime.current.heat < 100) {
        runtime.current.heat = Math.min(100, runtime.current.heat + delta * 34);
        if (phase === "duel" && enemyRef.current) {
          const toEnemy = enemyRef.current.position.clone().sub(player.position);
          const aim = forward.dot(toEnemy.clone().normalize());
          if (aim > 0.965 && toEnemy.length() < 92) {
            enemyHull.current = Math.max(0, enemyHull.current - (ship.damage + runtime.current.damageBonus) * delta * 2.4);
            message.current = enemyHull.current > 0 ? "Láser sostenido mordiendo el casco rival." : "Rival neutralizado por láser continuo.";
          }
        }
      } else {
        runtime.current.heat = Math.max(0, runtime.current.heat - delta * 24);
        if (firing && runtime.current.heat >= 100) message.current = "Láser sobrecalentado. Espera a que baje la temperatura.";
      }
    } else {
      runtime.current.heat = Math.max(0, runtime.current.heat - delta * 30);
      if (firing && state.clock.elapsedTime - lastShot.current > 0.16) {
        spawnPlayerWeapon(player.position.clone().addScaledVector(forward, 3.1), forward, player);
        lastShot.current = state.clock.elapsedTime;
      }
    }

    if (phase === "duel" && enemyHull.current <= 0) {
      const reward = Math.round((runtime.current.duelWingmen > 0 ? 1280 : 900) * ship.rewardBonus);
      projectiles.current.forEach((shot) => {
        shot.active = false;
      });
      setCredits((value) => value + reward);
      message.current = `${runtime.current.duelWingmen > 0 ? "Duelo 3 vs 3 ganado" : "Duelo ganado"}: +${reward} créditos.`;
      runtime.current.duelWingmen = 0;
      enemyHull.current = 185;
      setPhase("sector");
      sectorInitialized.current = false;
    }

    if (phase === "sector") {
      const distance = player.position.distanceTo(DUEL_GATE);
      const baseDistance = player.position.distanceTo(BASE_POSITION);
      if (distance < 15 && keys.current.KeyF) {
        setPhase("duel");
        message.current = "Transfiriendo al corredor de duelo...";
      }
      if (baseDistance < 24 && keys.current.KeyF) {
        setPhase("station");
        message.current = "Atraque completado. Bienvenido a Bastion Aurelia.";
      }
      if (baseDistance < 30) {
        runtime.current.shield = Math.min(ship.shield, runtime.current.shield + 18 * delta);
        runtime.current.hull = Math.min(ship.armor, runtime.current.hull + 5 * delta);
      }
    }

    if (phase === "duel" && enemyRef.current) {
      const enemy = enemyRef.current;
      const t = state.clock.elapsedTime;
      enemy.position.set(Math.sin(t * 0.82) * 34, 7 + Math.sin(t * 1.4) * 9, -42 + Math.cos(t * 0.7) * 28);
      enemy.lookAt(player.position);

      if (state.clock.elapsedTime - enemyShot.current > 1.05) {
        const aim = player.position.clone().sub(enemy.position).normalize();
        spawnShot(true, enemy.position.clone().addScaledVector(aim, 3), aim, 13);
        enemyShot.current = state.clock.elapsedTime;
      }
    }

    projectiles.current.forEach((projectile) => {
      if (!projectile.active) return;
      projectile.position.addScaledVector(projectile.velocity, delta);
      projectile.life -= delta;
      if (projectile.life <= 0) {
        projectile.active = false;
        return;
      }

      if (!projectile.enemy) {
        const hitAsteroid = asteroids.some((asteroid) => projectile.position.distanceTo(asteroid.position) < asteroid.scale + 0.75);
        if (hitAsteroid) {
          projectile.active = false;
          return;
        }
      }

      if (phase === "duel" && !projectile.enemy && enemyRef.current && projectile.position.distanceTo(enemyRef.current.position) < 4.7) {
        enemyHull.current = Math.max(0, enemyHull.current - projectile.damage);
        projectile.active = false;
        message.current = enemyHull.current > 0 ? "Impacto confirmado en el rival." : "Rival neutralizado. Recompensa transferida.";
        if (enemyHull.current <= 0) {
          const reward = Math.round(900 * ship.rewardBonus);
          projectiles.current.forEach((shot) => {
            shot.active = false;
          });
          setCredits((value) => value + reward);
          message.current = `Duelo ganado: +${reward} créditos.`;
          setPhase("sector");
          sectorInitialized.current = false;
        }
      }

      if (projectile.enemy && projectile.position.distanceTo(player.position) < 3.2) {
        projectile.active = false;
        const absorbed = Math.min(runtime.current.shield, projectile.damage);
        runtime.current.shield -= absorbed;
        runtime.current.hull = Math.max(0, runtime.current.hull - (projectile.damage - absorbed));
        message.current = "Escudos recibiendo fuego enemigo.";
        if (runtime.current.hull <= 0) {
          setPhase("destroyed");
          message.current = "Nave destruida. Reinicia seleccionando otra nave.";
        }
      }
    });

    const cameraOffset = new THREE.Vector3(0, 4.6, 13);
    cameraOffset.applyQuaternion(player.quaternion);
    const targetCamera = player.position.clone().add(cameraOffset);
    camera.position.lerp(targetCamera, 0.12);
    camera.lookAt(player.position.clone().addScaledVector(forward, 8));

    if (Math.floor(state.clock.elapsedTime * 8) % 2 === 0) {
      const distanceToDuel = player.position.distanceTo(DUEL_GATE);
      setHud({
        hull: Math.round(runtime.current.hull),
        shield: Math.round(runtime.current.shield),
        fuel: Math.round(runtime.current.fuel),
        maxFuel: Math.round(runtime.current.maxFuel),
        heat: Math.round(runtime.current.heat),
        weapon: WEAPON_NAMES[runtime.current.weapon],
        credits,
        enemyHull: Math.round(enemyHull.current),
        objective: phase === "duel" ? "Gana el duelo orbital" : phase === "destroyed" ? "Nave destruida" : "Explora el sector y busca contratos",
        prompt:
          phase === "duel"
            ? "Arrastra para apuntar, W/S motor, A/D giro, Espacio dispara"
            : distanceToDuel < 15
              ? "Pulsa F para entrar en duelo"
              : player.position.distanceTo(BASE_POSITION) < 24
                ? "Pulsa F para entrar andando en la estación"
                : "Arrastra para girar, W/S motor, A/D rumbo",
        message: message.current,
        distanceToDuel: Math.round(distanceToDuel),
      });
    }
  });

  const enemyConfig = SHIPS[2];

  return (
    <>
      <group ref={playerRef}>
        <DetailedShip config={ship} engine={phase === "destroyed" ? 0 : 0.8} scale={1.45} />
      </group>
      {phase === "duel" && runtime.current.duelWingmen > 0 ? (
        <>
          <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.45}>
            <group position={[-13, 4, 24]} rotation={[0, -0.18, 0]}>
              <DetailedShip config={SHIPS[0]} engine={0.55} scale={1.1} />
            </group>
          </Float>
          <Float speed={1} rotationIntensity={0.12} floatIntensity={0.45}>
            <group position={[13, 5, 20]} rotation={[0, 0.2, 0]}>
              <DetailedShip config={SHIPS[1]} engine={0.48} scale={1} />
            </group>
          </Float>
        </>
      ) : null}
      {phase === "duel" ? (
        <group ref={enemyRef}>
          <DetailedShip config={enemyConfig} enemy engine={0.65} scale={1.55} />
        </group>
      ) : null}
      <ProjectileMeshes projectiles={projectiles} />
    </>
  );
}

function BettingFighter({ index }: { index: number }) {
  const ref = useRef<THREE.Group>(null);
  const team = index < 2;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + index * 1.57;
    const radius = team ? 18 : 27;
    ref.current.position.set(Math.cos(t * (team ? 0.9 : -0.75)) * radius, 1.2, -38 + Math.sin(t * (team ? 0.9 : -0.75)) * radius);
    ref.current.rotation.set(0, -t, 0);
  });

  return (
    <group ref={ref}>
      <DetailedShip config={SHIPS[index % SHIPS.length]} enemy={!team} engine={0.6} scale={0.88} />
      <mesh position={[0, 0.2, team ? -5 : 5]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.04, 4.2, 4, 8]} />
        <meshBasicMaterial color={team ? "#6aa8a8" : "#ff9b73"} transparent opacity={0.72} />
      </mesh>
    </group>
  );
}

function BettingArena({
  runtime,
  credits,
  setCredits,
  setPhase,
  setHud,
}: {
  runtime: React.MutableRefObject<RuntimeState>;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  setPhase: (phase: GamePhase) => void;
  setHud: React.Dispatch<React.SetStateAction<HudState>>;
}) {
  const { camera } = useThree();
  const keys = useKeyboard();
  const paid = useRef(false);
  const lastHudAt = useRef(0);

  useFrame((state) => {
    camera.position.lerp(new THREE.Vector3(0, 78, -38), 0.08);
    camera.lookAt(0, 0, -38);
    if (keys.current.KeyF) {
      setPhase("station");
      setHud((current) => ({ ...current, objective: "Bastion Aurelia", prompt: "WASD andar, F interactuar", message: "Vuelves desde la grada de apuestas a la sala de combate." }));
      return;
    }
    if (!paid.current && state.clock.elapsedTime > 10) {
      paid.current = true;
      const won = Math.random() > 0.42;
      const amount = won ? 180 : 90;
      setCredits((value) => (won ? value + amount : Math.max(0, value - amount)));
      setHud((current) => ({ ...current, message: won ? `Tu apuesta gana en el combate 2 vs 2: +${amount} cr.` : `La apuesta cae: -${amount} cr.` }));
    }
    if (state.clock.elapsedTime - lastHudAt.current < 0.25) return;
    lastHudAt.current = state.clock.elapsedTime;
    setHud((current) => ({
      ...current,
      hull: Math.round(runtime.current.hull),
      shield: Math.round(runtime.current.shield),
      fuel: Math.round(runtime.current.fuel),
      maxFuel: Math.round(runtime.current.maxFuel),
      heat: Math.round(runtime.current.heat),
      weapon: WEAPON_NAMES[runtime.current.weapon],
      credits,
      enemyHull: 0,
      objective: "Apuestas 2 vs 2",
      prompt: "F: volver a la estación",
      distanceToDuel: 0,
    }));
  });

  return (
    <group>
      <mesh position={[0, -0.25, -38]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[38, 0.3, 8, 144]} />
        <meshBasicMaterial color="#d6a65c" transparent opacity={0.72} />
      </mesh>
      <mesh position={[0, -0.2, -38]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[14, 39, 96]} />
        <meshBasicMaterial color="#6aa8a8" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 4 }, (_, index) => (
        <BettingFighter key={index} index={index} />
      ))}
      <Text position={[0, 3.5, -84]} fontSize={2.2} color="#f8dfb6" anchorX="center">
        Vista aérea 2 vs 2
      </Text>
    </group>
  );
}

function SpaceWorld({
  ship,
  runtime,
  phase,
  setPhase,
  credits,
  setCredits,
  setHud,
}: {
  ship: ShipConfig;
  runtime: React.MutableRefObject<RuntimeState>;
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  setHud: React.Dispatch<React.SetStateAction<HudState>>;
}) {
  const asteroids = useMemo(() => createAsteroidVisuals(phase === "duel"), [phase]);

  if (phase === "station") {
    return (
      <>
        <StationInterior ship={ship} />
        <StationController ship={ship} runtime={runtime} credits={credits} setCredits={setCredits} setPhase={setPhase} setHud={setHud} />
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.38} luminanceSmoothing={0.45} />
          <Vignette eskil={false} offset={0.18} darkness={0.72} />
        </EffectComposer>
      </>
    );
  }

  if (phase === "spectator") {
    return (
      <>
        <color attach="background" args={["#05070d"]} />
        <fog attach="fog" args={["#05070d", 70, 240]} />
        <ambientLight intensity={0.36} />
        <directionalLight position={[25, 80, 10]} intensity={1.6} color="#fff0d5" />
        <Stars radius={260} depth={80} count={2600} factor={3.5} saturation={0.35} fade speed={0.25} />
        <DuelArena />
        <BettingArena runtime={runtime} credits={credits} setCredits={setCredits} setPhase={setPhase} setHud={setHud} />
        <EffectComposer>
          <Bloom intensity={0.62} luminanceThreshold={0.34} luminanceSmoothing={0.45} />
          <Vignette eskil={false} offset={0.18} darkness={0.72} />
        </EffectComposer>
      </>
    );
  }

  return (
    <>
      <color attach="background" args={["#05070d"]} />
      <fog attach="fog" args={["#05070d", 85, 390]} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[45, 60, 30]} intensity={1.8} color="#fff0d5" />
      <pointLight position={[-90, 30, -120]} intensity={2.4} color="#6aa8a8" distance={180} />
      <Stars radius={280} depth={90} count={4200} factor={4.2} saturation={0.4} fade speed={0.4} />
      <Nebulae />
      <Planet />
      {phase === "duel" ? <DuelArena /> : <OrbitalBase />}
      {phase === "duel" ? null : <DuelGate />}
      <AsteroidField asteroids={asteroids} />
      <GameController ship={ship} runtime={runtime} asteroids={asteroids} phase={phase} setPhase={setPhase} credits={credits} setCredits={setCredits} setHud={setHud} />
      <EffectComposer>
        <Bloom intensity={0.75} luminanceThreshold={0.34} luminanceSmoothing={0.45} />
        <Vignette eskil={false} offset={0.2} darkness={0.65} />
      </EffectComposer>
    </>
  );
}

const initialHud: HudState = {
  hull: 0,
  shield: 0,
  fuel: 0,
  maxFuel: 100,
  heat: 0,
  weapon: WEAPON_NAMES.pulse,
  credits: 850,
  enemyHull: 0,
  objective: "Selecciona una nave",
  prompt: "Elige uno de los tres chasis disponibles",
  message: "Cada nave cambia velocidad, blindaje y recompensa de duelo.",
  distanceToDuel: 0,
};

export default function SandboxScene() {
  const [selectedShip, setSelectedShip] = useState<ShipConfig | null>(null);
  const [phase, setPhase] = useState<GamePhase>("select");
  const [credits, setCredits] = useState(850);
  const [hud, setHud] = useState<HudState>(initialHud);
  const runtime = useRef<RuntimeState>({
    hull: 0,
    shield: 0,
    fuel: 100,
    maxFuel: 100,
    damageBonus: 0,
    engineBonus: 0,
    heat: 0,
    weapon: "pulse",
    duelWingmen: 0,
  });

  const startWithShip = (ship: ShipConfig) => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    runtime.current = {
      hull: ship.armor,
      shield: ship.shield,
      fuel: ship.fuel,
      maxFuel: ship.fuel,
      damageBonus: 0,
      engineBonus: 0,
      heat: 0,
      weapon: "pulse",
      duelWingmen: 0,
    };
    setSelectedShip(ship);
    setPhase("sector");
    setHud({
      hull: ship.armor,
      shield: ship.shield,
      fuel: ship.fuel,
      maxFuel: ship.fuel,
      heat: 0,
      weapon: WEAPON_NAMES.pulse,
      credits,
      enemyHull: 0,
      objective: "Explora el sector y busca contratos",
      prompt: "Acércate al anillo de duelo junto a la base",
      message: `${ship.name} activada. Sistemas nominales.`,
      distanceToDuel: 0,
    });
  };

  const resetRun = () => {
    setSelectedShip(null);
    setPhase("select");
    runtime.current = {
      hull: 0,
      shield: 0,
      fuel: 100,
      maxFuel: 100,
      damageBonus: 0,
      engineBonus: 0,
      heat: 0,
      weapon: "pulse",
      duelWingmen: 0,
    };
    setHud(initialHud);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black text-white">
      <Canvas
        camera={{ position: [0, 8, 58], fov: 62, near: 0.1, far: 700 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.75]}
      >
        {selectedShip ? (
          <SpaceWorld ship={selectedShip} runtime={runtime} phase={phase} setPhase={setPhase} credits={credits} setCredits={setCredits} setHud={setHud} />
        ) : (
          <>
            <color attach="background" args={["#05070d"]} />
            <ambientLight intensity={0.32} />
            <directionalLight position={[30, 40, 25]} intensity={1.8} color="#fff0d5" />
            <Stars radius={260} depth={90} count={3200} factor={4} saturation={0.4} fade speed={0.25} />
            <Nebulae />
            <Float speed={0.75} rotationIntensity={0.25} floatIntensity={0.4}>
              <group position={[0, 0, -10]} rotation={[0.1, -0.38, 0]}>
                <DetailedShip config={SHIPS[0]} engine={0.7} scale={2.2} />
              </group>
            </Float>
            <EffectComposer>
              <Bloom intensity={0.55} luminanceThreshold={0.35} />
              <Vignette eskil={false} offset={0.24} darkness={0.7} />
            </EffectComposer>
          </>
        )}
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/70 via-black/20 to-transparent p-6 pt-24 md:pt-6">
        <div className="ml-auto grid max-w-sm gap-3 rounded-2xl border border-white/10 bg-[#0b0d12]/70 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#d6a65c]">Deep Space Sandbox</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">{hud.objective}</h1>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right font-mono text-xs text-[#f6dfbd]">
              {credits} cr
            </div>
          </div>
          <p className="text-sm leading-6 text-white/70">{hud.message}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Meter label="Casco" value={hud.hull} max={selectedShip?.armor ?? 100} tone="#d6a65c" />
            <Meter label="Escudo" value={hud.shield} max={selectedShip?.shield ?? 100} tone="#6aa8a8" />
            <Meter label="Gasolina" value={hud.fuel} max={hud.maxFuel} tone="#7d9669" />
            <Meter label="Calor" value={hud.heat} max={100} tone="#b86854" />
            <Stat label="Arma" value={hud.weapon} />
            {phase === "duel" ? <Meter label="Rival" value={hud.enemyHull} max={185} tone="#b86854" /> : <Stat label={phase === "station" ? "Estación" : "Duelo"} value={phase === "station" ? "Interior" : hud.distanceToDuel ? `${hud.distanceToDuel} m` : "--"} />}
            <Stat label="Orden" value={hud.prompt} />
          </div>
        </div>
      </div>

      {phase === "select" ? (
        <div className="absolute inset-x-0 bottom-0 z-30 p-5 md:p-8">
          <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-[#0b0d12]/80 p-5 shadow-2xl backdrop-blur-xl md:p-6">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d6a65c]">Hangar de salida</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Elige tu nave</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-white/60">Después despegarás en el sector abierto. En la base Bastion Aurelia hay un anillo de duelo: entra, vence a la nave rival y cobra créditos.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {SHIPS.map((ship) => (
                <button
                  key={ship.id}
                  type="button"
                  onClick={() => startWithShip(ship)}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:-translate-y-1 hover:border-[#d6a65c]/45 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{ship.name}</h3>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">{ship.className}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[10px] text-[#d6a65c]">x{ship.rewardBonus.toFixed(2)}</span>
                  </div>
                  <p className="mt-3 min-h-[48px] text-sm leading-6 text-white/60">{ship.description}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/60">
                    <Spec label="Vel" value={ship.speed} />
                    <Spec label="Blind" value={ship.armor} />
                    <Spec label="Dmg" value={ship.damage} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-5 left-5 z-30 flex flex-wrap gap-2">
          {phase === "sector" ? (
            <button
              type="button"
              onClick={() => {
                setPhase("station");
                setHud((current) => ({ ...current, objective: "Bastion Aurelia", prompt: "WASD andar, F interactuar", message: "Atraque asistido completado. Ya puedes recorrer la estación." }));
              }}
              className="rounded-full border border-[#d6a65c]/35 bg-[#d6a65c]/14 px-4 py-2 text-sm font-semibold text-[#f8dfb6] backdrop-blur-md transition hover:bg-[#d6a65c]/22"
            >
              Atracar en estación
            </button>
          ) : null}
          {phase === "station" && hud.message.includes("Camarote") ? (
            <>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/chess";
                }}
                className="rounded-full border border-[#6aa8a8]/35 bg-[#6aa8a8]/14 px-4 py-2 text-sm font-semibold text-[#d8ffff] backdrop-blur-md transition hover:bg-[#6aa8a8]/22"
              >
                Ir a ajedrez
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/chess/community";
                }}
                className="rounded-full border border-white/10 bg-black/45 px-4 py-2 text-sm text-white/70 backdrop-blur-md transition hover:text-white"
              >
                Comunidad
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/projects";
                }}
                className="rounded-full border border-white/10 bg-black/45 px-4 py-2 text-sm text-white/70 backdrop-blur-md transition hover:text-white"
              >
                Proyectos
              </button>
            </>
          ) : null}
          {phase === "spectator" ? (
            <button
              type="button"
              onClick={() => {
                setPhase("station");
                setHud((current) => ({ ...current, objective: "Bastion Aurelia", prompt: "WASD andar, F interactuar", message: "Vuelves desde la grada de apuestas a la sala de combate." }));
              }}
              className="rounded-full border border-[#d6a65c]/35 bg-[#d6a65c]/14 px-4 py-2 text-sm font-semibold text-[#f8dfb6] backdrop-blur-md transition hover:bg-[#d6a65c]/22"
            >
              Volver a estación
            </button>
          ) : null}
          <button
            type="button"
            onClick={resetRun}
            className="rounded-full border border-white/10 bg-black/45 px-4 py-2 text-sm text-white/70 backdrop-blur-md transition hover:text-white"
          >
            Cambiar nave
          </button>
          {phase === "destroyed" ? (
            <button
              type="button"
              onClick={resetRun}
              className="rounded-full border border-[#d6a65c]/35 bg-[#d6a65c]/14 px-4 py-2 text-sm font-semibold text-[#f8dfb6] backdrop-blur-md transition hover:bg-[#d6a65c]/22"
            >
              Elegir otra nave
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Meter({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const pct = clamp(max > 0 ? (value / max) * 100 : 0, 0, 100);
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-2">
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/50">
        <span>{label}</span>
        <span>{Math.max(0, Math.round(value))}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-2">
      <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-1 truncate text-xs text-white/80">{value}</p>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2">
      <p className="font-mono text-[9px] uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-1 font-semibold text-white/80">{value}</p>
    </div>
  );
}
