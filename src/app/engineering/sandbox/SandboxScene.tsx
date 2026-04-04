"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Stars, Text } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';

import { Spaceship } from '@/components/3d/Spaceship';

type MissionPhase = 'briefing' | 'harvest' | 'dock' | 'defense' | 'boss' | 'victory' | 'dead';
type EnemyType = 'drone' | 'interceptor' | 'ace';
type PickupType = 'ore' | 'repair' | 'plasma';

type AsteroidData = {
  active: boolean;
  respawn: number;
  pos: THREE.Vector3;
  basePos: THREE.Vector3;
  drift: THREE.Vector3;
  rotation: THREE.Vector3;
  spin: THREE.Vector3;
  scale: number;
  oreYield: number;
  durability: number;
  maxDurability: number;
};

type EnemyData = {
  active: boolean;
  type: EnemyType;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  hp: number;
  maxHp: number;
  cooldown: number;
  wobble: number;
  wobbleSpeed: number;
  scale: number;
  target: 'player' | 'station';
};

type ProjectileData = {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  power: number;
};

type PickupData = {
  active: boolean;
  type: PickupType;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  value: number;
  spin: number;
};

type WorldState = {
  player: {
    hull: number;
    shield: number;
    fuel: number;
    plasma: number;
    ore: number;
    score: number;
    lastHitAt: number;
  };
  station: {
    health: number;
  };
  mission: {
    phase: MissionPhase;
    wave: number;
    harvestTarget: number;
    nextWaveIn: number;
    bossSpawned: boolean;
    elapsed: number;
  };
  asteroids: AsteroidData[];
  enemies: EnemyData[];
  playerProjectiles: ProjectileData[];
  enemyProjectiles: ProjectileData[];
  pickups: PickupData[];
};

type HudSnapshot = {
  hull: number;
  shield: number;
  fuel: number;
  plasma: number;
  ore: number;
  score: number;
  station: number;
  wave: number;
  enemies: number;
  objective: string;
  subobjective: string;
  prompt: string;
};

const ASTEROID_COUNT = 70;
const ENEMY_POOL = 18;
const PLAYER_PROJECTILES = 48;
const ENEMY_PROJECTILES = 40;
const PICKUP_POOL = 48;

const STATION_POSITION = new THREE.Vector3(-110, 18, -160);
const PORTAL_POSITION = new THREE.Vector3(140, 26, -230);
const PLAYER_START = new THREE.Vector3(0, 2, 58);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createAsteroids() {
  return Array.from({ length: ASTEROID_COUNT }, (_, index) => {
    const beltBias = index % 2 === 0 ? 1 : -1;
    const x = rand(-35, 150) + beltBias * rand(8, 30);
    const y = rand(-24, 32);
    const z = rand(-40, -250);
    const scale = rand(1.3, 4.7);
    const durability = Math.round(scale * rand(9, 14));

    return {
      active: true,
      respawn: 0,
      pos: new THREE.Vector3(x, y, z),
      basePos: new THREE.Vector3(x, y, z),
      drift: new THREE.Vector3(rand(-2.5, 2.5), rand(-1.2, 1.2), rand(-1.8, 1.8)),
      rotation: new THREE.Vector3(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI)),
      spin: new THREE.Vector3(rand(-0.4, 0.4), rand(-0.5, 0.5), rand(-0.35, 0.35)),
      scale,
      oreYield: Math.round(scale * rand(7, 12)),
      durability,
      maxDurability: durability,
    };
  });
}

function createProjectiles(count: number) {
  return Array.from({ length: count }, () => ({
    active: false,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    life: 0,
    power: 0,
  }));
}

function createEnemies() {
  return Array.from({ length: ENEMY_POOL }, () => ({
    active: false,
    type: 'drone' as EnemyType,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    hp: 0,
    maxHp: 0,
    cooldown: 0,
    wobble: rand(0, Math.PI * 2),
    wobbleSpeed: rand(1.2, 2.6),
    scale: 1,
    target: 'player' as const,
  }));
}

function createPickups() {
  return Array.from({ length: PICKUP_POOL }, () => ({
    active: false,
    type: 'ore' as PickupType,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    life: 0,
    value: 0,
    spin: rand(1, 4),
  }));
}

function createWorld(): WorldState {
  return {
    player: {
      hull: 100,
      shield: 100,
      fuel: 100,
      plasma: 100,
      ore: 0,
      score: 0,
      lastHitAt: -10,
    },
    station: {
      health: 100,
    },
    mission: {
      phase: 'briefing',
      wave: 0,
      harvestTarget: 180,
      nextWaveIn: 0,
      bossSpawned: false,
      elapsed: 0,
    },
    asteroids: createAsteroids(),
    enemies: createEnemies(),
    playerProjectiles: createProjectiles(PLAYER_PROJECTILES),
    enemyProjectiles: createProjectiles(ENEMY_PROJECTILES),
    pickups: createPickups(),
  };
}

function resetWorld(world: WorldState, shipRef: RefObject<THREE.Group>) {
  const fresh = createWorld();

  Object.assign(world.player, fresh.player);
  Object.assign(world.station, fresh.station);
  Object.assign(world.mission, fresh.mission);

  world.asteroids.splice(0, world.asteroids.length, ...fresh.asteroids);
  world.enemies.splice(0, world.enemies.length, ...fresh.enemies);
  world.playerProjectiles.splice(0, world.playerProjectiles.length, ...fresh.playerProjectiles);
  world.enemyProjectiles.splice(0, world.enemyProjectiles.length, ...fresh.enemyProjectiles);
  world.pickups.splice(0, world.pickups.length, ...fresh.pickups);

  if (shipRef.current) {
    shipRef.current.position.copy(PLAYER_START);
    shipRef.current.rotation.set(0, 0, 0);
    shipRef.current.quaternion.identity();
  }
}

function getHudSnapshot(world: WorldState, shipRef: RefObject<THREE.Group>): HudSnapshot {
  const shipPosition = shipRef.current?.position ?? PLAYER_START;
  const nearStation = shipPosition.distanceTo(STATION_POSITION) < 26;
  const activeEnemies = world.enemies.filter((enemy) => enemy.active).length;
  const phase = world.mission.phase;

  let objective = 'Prepara la salida del convoy Aurora';
  let subobjective = 'Lanza la misión desde el panel de mando';
  let prompt = 'Pulsa LANZAR MISIÓN para iniciar la escolta';

  if (phase === 'harvest') {
    objective = 'Recoge lumen del cinturón quebrado';
    subobjective = `${world.player.ore}/${world.mission.harvestTarget} unidades para alimentar el portal de evacuación`;
    prompt = nearStation ? 'La estación puede recargar tus sistemas' : 'Derriba asteroides ámbar para obtener lumen';
  } else if (phase === 'dock') {
    objective = 'Entrega el lumen a Bastion Aurelia';
    subobjective = 'Entra en el radio de atraque para iniciar la defensa';
    prompt = nearStation ? 'Transferencia lista: mantén posición sobre el hangar' : 'Sigue la baliza azul de la estación';
  } else if (phase === 'defense') {
    objective = `Defiende Bastion Aurelia - oleada ${world.mission.wave}/3`;
    subobjective = activeEnemies > 0 ? `${activeEnemies} hostiles en el sector` : 'Escaneando la siguiente incursión enemiga';
    prompt = nearStation ? 'Las defensas de la estación recargan escudos y plasma' : 'Prioriza interceptores antes de que alcancen la estación';
  } else if (phase === 'boss') {
    objective = 'Neutraliza el acorazado Spectra';
    subobjective = activeEnemies > 0 ? `${activeEnemies} firmas hostiles restantes` : 'El portal está inestable. Mantén presión.';
    prompt = 'Golpea el núcleo del acorazado antes de que derribe la estación';
  } else if (phase === 'victory') {
    objective = 'Convoy Aurora a salvo';
    subobjective = 'La brecha queda sellada y la ruta de evacuación es segura';
    prompt = 'Puedes reiniciar la misión para volver a jugar';
  } else if (phase === 'dead') {
    objective = 'Misión perdida';
    subobjective = world.player.hull <= 0 ? 'Tu interceptor fue destruido' : 'Bastion Aurelia cayó durante el asedio';
    prompt = 'Reinicia para intentar otra vez';
  }

  return {
    hull: world.player.hull,
    shield: world.player.shield,
    fuel: world.player.fuel,
    plasma: world.player.plasma,
    ore: world.player.ore,
    score: world.player.score,
    station: world.station.health,
    wave: world.mission.wave,
    enemies: activeEnemies,
    objective,
    subobjective,
    prompt,
  };
}

function spawnPickup(world: WorldState, type: PickupType, position: THREE.Vector3, value: number) {
  const pickup = world.pickups.find((item) => !item.active);
  if (!pickup) return;

  pickup.active = true;
  pickup.type = type;
  pickup.pos.copy(position);
  pickup.vel.set(rand(-5, 5), rand(-2, 4), rand(-5, 5));
  pickup.life = 12;
  pickup.value = value;
  pickup.spin = rand(1, 4);
}

function spawnPlayerProjectile(world: WorldState, position: THREE.Vector3, quaternion: THREE.Quaternion) {
  if (world.player.plasma < 3) return;

  const projectile = world.playerProjectiles.find((item) => !item.active);
  if (!projectile) return;

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion).normalize();

  world.player.plasma = clamp(world.player.plasma - 3, 0, 100);
  projectile.active = true;
  projectile.life = 2.2;
  projectile.power = 14;
  projectile.pos.copy(position).add(forward.clone().multiplyScalar(2.1));
  projectile.vel.copy(forward.multiplyScalar(260));
}

function spawnEnemyProjectile(world: WorldState, origin: THREE.Vector3, target: THREE.Vector3, power: number, speed: number) {
  const projectile = world.enemyProjectiles.find((item) => !item.active);
  if (!projectile) return;

  projectile.active = true;
  projectile.life = 3.4;
  projectile.power = power;
  projectile.pos.copy(origin);
  projectile.vel.copy(target.clone().sub(origin).normalize().multiplyScalar(speed));
}

function spawnWave(world: WorldState, wave: number) {
  const configs =
    wave === 1
      ? [
          { type: 'drone' as const, count: 5 },
          { type: 'interceptor' as const, count: 1 },
        ]
      : wave === 2
        ? [
            { type: 'drone' as const, count: 5 },
            { type: 'interceptor' as const, count: 3 },
          ]
        : [
            { type: 'drone' as const, count: 6 },
            { type: 'interceptor' as const, count: 4 },
          ];

  configs.forEach((config) => {
    for (let index = 0; index < config.count; index += 1) {
      const enemy = world.enemies.find((item) => !item.active);
      if (!enemy) return;

      const isInterceptor = config.type === 'interceptor';

      enemy.active = true;
      enemy.type = config.type;
      enemy.pos.copy(PORTAL_POSITION).add(new THREE.Vector3(rand(-18, 18), rand(-12, 12), rand(-18, 18)));
      enemy.vel.set(rand(-6, 6), rand(-2, 2), rand(-6, 6));
      enemy.scale = isInterceptor ? 1.45 : 1.05;
      enemy.maxHp = isInterceptor ? 52 : 34;
      enemy.hp = enemy.maxHp;
      enemy.cooldown = rand(0.1, 1.2);
      enemy.wobble = rand(0, Math.PI * 2);
      enemy.wobbleSpeed = rand(1.2, 2.6);
      enemy.target = Math.random() > 0.45 ? 'station' : 'player';
    }
  });
}

function spawnBoss(world: WorldState) {
  const boss = world.enemies.find((item) => !item.active);
  if (!boss) return;

  boss.active = true;
  boss.type = 'ace';
  boss.pos.copy(PORTAL_POSITION).add(new THREE.Vector3(0, 10, 0));
  boss.vel.set(0, 0, 0);
  boss.scale = 3.8;
  boss.maxHp = 280;
  boss.hp = 280;
  boss.cooldown = 1.2;
  boss.wobble = rand(0, Math.PI * 2);
  boss.wobbleSpeed = 0.8;
  boss.target = 'station';
}

function applyDamage(world: WorldState, damage: number) {
  world.player.lastHitAt = world.mission.elapsed;

  if (world.player.shield > 0) {
    const shieldDamage = Math.min(world.player.shield, damage);
    world.player.shield -= shieldDamage;
    damage -= shieldDamage;
  }

  if (damage > 0) {
    world.player.hull = clamp(world.player.hull - damage, 0, 100);
  }
}

function SectorBackdrop() {
  const outerRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (outerRef.current) outerRef.current.rotation.y += delta * 0.01;
    if (midRef.current) {
      midRef.current.rotation.y -= delta * 0.02;
      midRef.current.rotation.x += delta * 0.008;
    }
  });

  return (
    <>
      <mesh ref={outerRef}>
        <sphereGeometry args={[520, 32, 32]} />
        <meshBasicMaterial color="#02030b" side={THREE.BackSide} />
      </mesh>

      <mesh ref={midRef} position={[40, 10, -120]}>
        <sphereGeometry args={[290, 24, 24]} />
        <meshBasicMaterial color="#140a2a" transparent opacity={0.18} side={THREE.BackSide} />
      </mesh>

      <mesh position={[-120, -30, -260]}>
        <sphereGeometry args={[220, 24, 24]} />
        <meshBasicMaterial color="#082235" transparent opacity={0.14} side={THREE.BackSide} />
      </mesh>

      <mesh position={[200, 90, -340]}>
        <sphereGeometry args={[26, 24, 24]} />
        <meshBasicMaterial color="#fb7185" toneMapped={false} />
      </mesh>

      <pointLight position={[200, 90, -340]} intensity={18} color="#fb7185" distance={520} />
      <pointLight position={[-140, 20, -150]} intensity={10} color="#38bdf8" distance={260} />
    </>
  );
}

function MiningBelt({ world }: { world: WorldState }) {
  const rockRef = useRef<THREE.InstancedMesh>(null);
  const veinRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const veinDummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!rockRef.current || !veinRef.current) return;

    world.asteroids.forEach((asteroid, index) => {
      if (asteroid.active) {
        asteroid.rotation.addScaledVector(asteroid.spin, delta);
        asteroid.pos.addScaledVector(asteroid.drift, delta);

        if (asteroid.pos.distanceTo(asteroid.basePos) > 12) {
          asteroid.drift.multiplyScalar(-1);
        }

        dummy.position.copy(asteroid.pos);
        dummy.rotation.set(asteroid.rotation.x, asteroid.rotation.y, asteroid.rotation.z);
        dummy.scale.setScalar(asteroid.scale);

        veinDummy.position.copy(asteroid.pos).add(new THREE.Vector3(0, asteroid.scale * 0.1, 0));
        veinDummy.rotation.set(asteroid.rotation.x * 0.9, asteroid.rotation.y * 0.6, asteroid.rotation.z * 0.7);
        veinDummy.scale.setScalar(asteroid.scale * 0.4);
      } else {
        if (asteroid.respawn > 0) {
          asteroid.respawn -= delta;
        } else {
          asteroid.active = true;
          asteroid.durability = asteroid.maxDurability;
          asteroid.pos.copy(asteroid.basePos).add(new THREE.Vector3(rand(-6, 6), rand(-4, 4), rand(-6, 6)));
        }

        dummy.position.set(0, 0, 0);
        dummy.scale.setScalar(0);
        veinDummy.position.set(0, 0, 0);
        veinDummy.scale.setScalar(0);
      }

      dummy.updateMatrix();
      veinDummy.updateMatrix();
      rockRef.current.setMatrixAt(index, dummy.matrix);
      veinRef.current.setMatrixAt(index, veinDummy.matrix);
    });

    rockRef.current.instanceMatrix.needsUpdate = true;
    veinRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={rockRef} args={[undefined, undefined, world.asteroids.length]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#475569" roughness={0.85} metalness={0.18} />
      </instancedMesh>

      <instancedMesh ref={veinRef} args={[undefined, undefined, world.asteroids.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.8} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function PickupField({
  world,
  type,
  color,
}: {
  world: WorldState;
  type: PickupType;
  color: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    world.pickups.forEach((pickup, index) => {
      if (pickup.active && pickup.type === type) {
        pickup.life -= delta;
        pickup.pos.addScaledVector(pickup.vel, delta);
        pickup.vel.multiplyScalar(0.985);

        if (pickup.life <= 0) {
          pickup.active = false;
        }

        dummy.position.copy(pickup.pos);
        dummy.rotation.y += pickup.spin * delta;
        dummy.rotation.x += pickup.spin * delta * 0.4;
        dummy.scale.setScalar(type === 'ore' ? 0.75 : 0.95);
      } else {
        dummy.position.set(0, 0, 0);
        dummy.scale.setScalar(0);
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, world.pickups.length]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
    </instancedMesh>
  );
}

function ProjectileLayer({
  projectiles,
  color,
  emissive,
  scale,
}: {
  projectiles: ProjectileData[];
  color: string;
  emissive: string;
  scale: [number, number, number];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    projectiles.forEach((projectile, index) => {
      if (projectile.active) {
        projectile.life -= delta;
        projectile.pos.addScaledVector(projectile.vel, delta);

        if (projectile.life <= 0) {
          projectile.active = false;
        }

        dummy.position.copy(projectile.pos);
        dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), projectile.vel.clone().normalize());
        dummy.scale.set(scale[0], scale[1], scale[2]);
      } else {
        dummy.position.set(0, 0, 0);
        dummy.scale.setScalar(0);
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, projectiles.length]}>
      <cylinderGeometry args={[1, 1, 1, 8]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={8} toneMapped={false} />
    </instancedMesh>
  );
}

function EnemySquadron({ world }: { world: WorldState }) {
  const hullRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const coreDummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!hullRef.current || !glowRef.current) return;

    world.enemies.forEach((enemy, index) => {
      if (enemy.active) {
        enemy.wobble += delta * enemy.wobbleSpeed;
        dummy.position.copy(enemy.pos);
        dummy.lookAt(enemy.pos.clone().add(enemy.vel.clone().normalize()));
        dummy.rotateX(Math.PI / 2);
        dummy.scale.set(enemy.scale, enemy.scale * 1.5, enemy.scale);

        coreDummy.position.copy(enemy.pos);
        coreDummy.scale.setScalar(enemy.type === 'ace' ? enemy.scale * 0.7 : enemy.scale * 0.38);
      } else {
        dummy.position.set(0, 0, 0);
        dummy.scale.setScalar(0);
        coreDummy.position.set(0, 0, 0);
        coreDummy.scale.setScalar(0);
      }

      dummy.updateMatrix();
      coreDummy.updateMatrix();
      hullRef.current.setMatrixAt(index, dummy.matrix);
      glowRef.current.setMatrixAt(index, coreDummy.matrix);
    });

    hullRef.current.instanceMatrix.needsUpdate = true;
    glowRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={hullRef} args={[undefined, undefined, world.enemies.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.28} metalness={0.86} />
      </instancedMesh>

      <instancedMesh ref={glowRef} args={[undefined, undefined, world.enemies.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={3.6} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function StationAurelia({ health }: { health: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const shieldRef = useRef<THREE.Mesh>(null);
  const healthRatio = clamp(health / 100, 0, 1);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
    if (ringRef.current) ringRef.current.rotation.z -= delta * 0.32;
    if (shieldRef.current) shieldRef.current.rotation.y += delta * 0.16;
  });

  return (
    <group ref={groupRef} position={STATION_POSITION.toArray()}>
      <mesh>
        <octahedronGeometry args={[10, 1]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.18} />
      </mesh>

      <mesh>
        <sphereGeometry args={[4.2, 24, 24]} />
        <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={3.2} toneMapped={false} />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[15, 1.1, 20, 72]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>

      <mesh ref={shieldRef}>
        <sphereGeometry args={[20, 32, 32]} />
        <meshStandardMaterial
          color="#67e8f9"
          transparent
          opacity={0.08 + healthRatio * 0.08}
          emissive="#22d3ee"
          emissiveIntensity={1.4 + healthRatio}
        />
      </mesh>

      <mesh position={[0, -6.5, 0]}>
        <cylinderGeometry args={[5, 8.5, 5, 18]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.28} />
      </mesh>

      <Sparkles count={70} speed={0.4} opacity={0.7} scale={[28, 20, 28]} size={3} color="#67e8f9" />
      <Text position={[0, 23, 0]} fontSize={4.2} color="#e0f2fe" outlineWidth={0.18} outlineColor="#082f49">
        BASTION AURELIA
      </Text>
    </group>
  );
}

function BreachPortal({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringARef = useRef<THREE.Mesh>(null);
  const ringBRef = useRef<THREE.Mesh>(null);
  const glow = active ? 1 : 0.55;

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.18;
    if (ringARef.current) ringARef.current.rotation.z += delta * 0.8;
    if (ringBRef.current) ringBRef.current.rotation.x -= delta * 0.6;
  });

  return (
    <group ref={groupRef} position={PORTAL_POSITION.toArray()}>
      <mesh>
        <torusGeometry args={[16, 2.2, 24, 120]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={3.4 * glow} toneMapped={false} />
      </mesh>
      <mesh ref={ringARef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[11, 0.6, 18, 80]} />
        <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={3 * glow} toneMapped={false} />
      </mesh>
      <mesh ref={ringBRef}>
        <torusGeometry args={[8, 0.45, 16, 60]} />
        <meshStandardMaterial color="#f9a8d4" emissive="#f9a8d4" emissiveIntensity={2.4 * glow} toneMapped={false} />
      </mesh>
      <Sparkles count={100} speed={1.4} opacity={0.75} scale={[30, 24, 30]} size={4} color="#fda4af" />
      <Text position={[0, 23, 0]} fontSize={3.8} color="#fecdd3" outlineWidth={0.18} outlineColor="#4c0519">
        FRACTURA SPECTRA
      </Text>
    </group>
  );
}

function AlliedConvoy() {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (leftRef.current) {
      leftRef.current.position.set(STATION_POSITION.x - 28, STATION_POSITION.y + Math.sin(time * 0.9) * 2.5, STATION_POSITION.z + 18);
      leftRef.current.rotation.y += delta * 0.15;
    }

    if (rightRef.current) {
      rightRef.current.position.set(STATION_POSITION.x + 34, STATION_POSITION.y + Math.cos(time * 0.8) * 2.8, STATION_POSITION.z - 14);
      rightRef.current.rotation.y -= delta * 0.17;
    }
  });

  const frigate = (
    <>
      <mesh>
        <boxGeometry args={[5.4, 1.4, 18]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.75, -3]}>
        <boxGeometry args={[2.2, 0.9, 7]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.65} roughness={0.18} />
      </mesh>
      <mesh position={[0, -0.2, 7]}>
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
    </>
  );

  return (
    <>
      <group ref={leftRef}>{frigate}</group>
      <group ref={rightRef}>{frigate}</group>
    </>
  );
}

function GameDirector({
  world,
  shipRef,
  onHudSync,
  onPhaseChange,
  onEvent,
}: {
  world: WorldState;
  shipRef: RefObject<THREE.Group>;
  onHudSync: (snapshot: HudSnapshot) => void;
  onPhaseChange: (phase: MissionPhase, message?: string) => void;
  onEvent: (message: string) => void;
}) {
  const hudTimer = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    world.mission.elapsed += dt;

    if (!shipRef.current || world.mission.phase === 'briefing' || world.mission.phase === 'victory' || world.mission.phase === 'dead') {
      hudTimer.current += dt;
      if (hudTimer.current > 0.14) {
        hudTimer.current = 0;
        onHudSync(getHudSnapshot(world, shipRef));
      }
      return;
    }

    const shipPosition = shipRef.current.position;
    const nearStation = shipPosition.distanceTo(STATION_POSITION) < 26;

    if (nearStation) {
      world.player.fuel = clamp(world.player.fuel + dt * 16, 0, 100);
      world.player.plasma = clamp(world.player.plasma + dt * 24, 0, 100);
      world.player.shield = clamp(world.player.shield + dt * 18, 0, 100);
    } else {
      world.player.plasma = clamp(world.player.plasma + dt * 2.4, 0, 100);
    }

    if (world.mission.elapsed - world.player.lastHitAt > 3.5) {
      world.player.shield = clamp(world.player.shield + dt * 6, 0, 100);
    }

    world.playerProjectiles.forEach((projectile) => {
      if (!projectile.active) return;

      for (const asteroid of world.asteroids) {
        if (!asteroid.active) continue;

        if (projectile.pos.distanceTo(asteroid.pos) < asteroid.scale * 1.18) {
          projectile.active = false;
          asteroid.durability -= projectile.power;

          if (asteroid.durability <= 0) {
            asteroid.active = false;
            asteroid.respawn = rand(9, 16);

            const shards = clamp(Math.round(asteroid.oreYield / 12), 1, 4);
            for (let index = 0; index < shards; index += 1) {
              spawnPickup(world, 'ore', asteroid.pos, Math.round(asteroid.oreYield / shards));
            }

            if (Math.random() > 0.72) {
              spawnPickup(world, 'plasma', asteroid.pos, 18);
            }
          }

          break;
        }
      }

      if (!projectile.active) return;

      for (const enemy of world.enemies) {
        if (!enemy.active) continue;

        if (projectile.pos.distanceTo(enemy.pos) < enemy.scale * (enemy.type === 'ace' ? 2.6 : 1.6)) {
          projectile.active = false;
          enemy.hp -= projectile.power;

          if (enemy.hp <= 0) {
            enemy.active = false;
            world.player.score += enemy.type === 'ace' ? 900 : enemy.type === 'interceptor' ? 220 : 140;
            spawnPickup(world, 'repair', enemy.pos, enemy.type === 'ace' ? 24 : 12);
            spawnPickup(world, 'plasma', enemy.pos, enemy.type === 'ace' ? 40 : 18);

            if (enemy.type === 'ace') {
              onEvent('Nyx Spectra ha caído. El convoy tiene una ventana segura para escapar.');
            }
          }

          break;
        }
      }
    });

    world.enemyProjectiles.forEach((projectile) => {
      if (!projectile.active) return;

      if (projectile.pos.distanceTo(shipPosition) < 2.6) {
        projectile.active = false;
        applyDamage(world, projectile.power);
      } else if (projectile.pos.distanceTo(STATION_POSITION) < 15) {
        projectile.active = false;
        world.station.health = clamp(world.station.health - projectile.power * 0.55, 0, 100);
      }
    });

    world.pickups.forEach((pickup) => {
      if (!pickup.active) return;

      if (pickup.pos.distanceTo(shipPosition) < 4.4) {
        pickup.active = false;

        if (pickup.type === 'ore') {
          world.player.ore += pickup.value;
          world.player.score += pickup.value * 2;
        } else if (pickup.type === 'repair') {
          world.player.hull = clamp(world.player.hull + pickup.value, 0, 100);
          world.player.shield = clamp(world.player.shield + pickup.value * 0.8, 0, 100);
        } else if (pickup.type === 'plasma') {
          world.player.plasma = clamp(world.player.plasma + pickup.value, 0, 100);
        }
      }
    });

    world.enemies.forEach((enemy) => {
      if (!enemy.active) return;

      const targetPosition =
        enemy.type === 'ace'
          ? shipPosition.clone().lerp(STATION_POSITION, 0.35)
          : enemy.target === 'station'
            ? STATION_POSITION
            : shipPosition;

      const desired = targetPosition.clone().sub(enemy.pos);
      const distance = desired.length();
      const direction = desired.normalize();
      const orbit = new THREE.Vector3(
        Math.sin(enemy.wobble) * 0.6,
        Math.cos(enemy.wobble * 0.7) * 0.35,
        Math.cos(enemy.wobble) * 0.6,
      );

      const speed = enemy.type === 'ace' ? 18 : enemy.type === 'interceptor' ? 34 : 24;
      enemy.vel.lerp(direction.multiplyScalar(speed).add(orbit.multiplyScalar(speed * 0.35)), dt * 1.4);
      enemy.pos.addScaledVector(enemy.vel, dt);
      enemy.cooldown -= dt;

      const fireDistance = enemy.type === 'ace' ? 85 : enemy.type === 'interceptor' ? 70 : 58;

      if (distance < fireDistance && enemy.cooldown <= 0) {
        enemy.cooldown = enemy.type === 'ace' ? 0.45 : enemy.type === 'interceptor' ? 1 : 1.45;
        const shotTarget = enemy.target === 'station' && shipPosition.distanceTo(enemy.pos) > 26 ? STATION_POSITION : shipPosition;
        spawnEnemyProjectile(world, enemy.pos, shotTarget, enemy.type === 'ace' ? 9 : enemy.type === 'interceptor' ? 6 : 5, enemy.type === 'ace' ? 175 : 145);
      }

      if (enemy.target === 'station' && distance < 18) {
        world.station.health = clamp(world.station.health - dt * (enemy.type === 'ace' ? 4.8 : 1.5), 0, 100);
      }

      if (enemy.pos.distanceTo(shipPosition) < enemy.scale + 1.4) {
        applyDamage(world, enemy.type === 'ace' ? 12 : 5);
        enemy.vel.multiplyScalar(-0.6);
      }
    });

    if (world.mission.phase === 'harvest' && world.player.ore >= world.mission.harvestTarget) {
      world.mission.phase = 'dock';
      onPhaseChange('dock');
      onEvent('Lumen suficiente. Regresa a Bastion Aurelia para energizar el portal.');
    }

    if (world.mission.phase === 'dock' && nearStation) {
      world.mission.phase = 'defense';
      world.mission.wave = 1;
      world.mission.nextWaveIn = 0;
      spawnWave(world, 1);
      onPhaseChange('defense');
      onEvent('El portal empieza a cargar. Mantén viva la estación durante tres oleadas.');
    }

    if (world.mission.phase === 'defense') {
      const activeEnemies = world.enemies.some((enemy) => enemy.active);

      if (!activeEnemies) {
        if (world.mission.wave >= 3) {
          world.mission.phase = 'boss';
          world.mission.bossSpawned = true;
          spawnBoss(world);
          onPhaseChange('boss');
          onEvent('Lectura crítica: Nyx Spectra atraviesa la fractura con su acorazado.');
        } else {
          world.mission.nextWaveIn -= dt;

          if (world.mission.nextWaveIn <= 0) {
            world.mission.wave += 1;
            spawnWave(world, world.mission.wave);
            world.mission.nextWaveIn = 5;
            onEvent(`Oleada ${world.mission.wave} detectada. Mantén la línea.`);
          }
        }
      } else {
        world.mission.nextWaveIn = 4;
      }
    }

    if (world.mission.phase === 'boss' && world.mission.bossSpawned && !world.enemies.some((enemy) => enemy.active && enemy.type === 'ace')) {
      world.mission.phase = 'victory';
      onPhaseChange('victory');
      onEvent('La ruta queda abierta. El convoy Aurora abandona el sector entre chispas del portal.');
    }

    if (world.player.hull <= 0) {
      world.mission.phase = 'dead';
      onPhaseChange('dead', 'Tu interceptor fue destruido antes de asegurar la evacuación.');
      onEvent('El sector se perdió. Nyx Spectra rompió la línea de defensa.');
    } else if (world.station.health <= 0) {
      world.mission.phase = 'dead';
      onPhaseChange('dead', 'Bastion Aurelia cayó durante el asedio y el convoy quedó expuesto.');
      onEvent('La estación ha sido destruida. No quedó ninguna salida segura.');
    }

    hudTimer.current += dt;
    if (hudTimer.current > 0.12) {
      hudTimer.current = 0;
      onHudSync(getHudSnapshot(world, shipRef));
    }
  });

  return null;
}

export default function SandboxScene() {
  const shipRef = useRef<THREE.Group>(null);
  const world = useMemo(() => createWorld(), []);

  const [missionPhase, setMissionPhase] = useState<MissionPhase>('briefing');
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [overlayMessage, setOverlayMessage] = useState<string | null>(null);
  const [eventFeed, setEventFeed] = useState<string[]>([
    'Bastion Aurelia detecta actividad pirata en la Fractura Spectra.',
    'El convoy Aurora espera una ruta de evacuación estable para cruzar.',
  ]);
  const [hud, setHud] = useState<HudSnapshot>(() => getHudSnapshot(world, shipRef));

  const controlsEnabled = !briefingOpen && missionPhase !== 'dead' && missionPhase !== 'victory';

  const pushEvent = (message: string) => {
    setEventFeed((previous) => [message, ...previous].slice(0, 5));
  };

  const syncHud = (snapshot: HudSnapshot) => {
    setHud(snapshot);
  };

  const handlePhaseChange = (phase: MissionPhase, message?: string) => {
    setMissionPhase(phase);

    if (phase === 'victory') {
      setOverlayMessage('El convoy Aurora atraviesa el portal mientras la Fractura Spectra se derrumba detrás de ti.');
    } else if (phase === 'dead') {
      setOverlayMessage(message ?? 'La misión terminó en derrota.');
    } else {
      setOverlayMessage(null);
    }
  };

  const launchMission = () => {
    resetWorld(world, shipRef);
    world.mission.phase = 'harvest';
    setMissionPhase('harvest');
    setBriefingOpen(false);
    setOverlayMessage(null);
    setEventFeed([
      'Misión iniciada. Extrae lumen del cinturón quebrado y vuelve a la estación.',
      'Bastion Aurelia mantiene la cobertura del convoy Aurora.',
    ]);
    syncHud(getHudSnapshot(world, shipRef));
  };

  const resetMission = () => {
    setBriefingOpen(true);
    setMissionPhase('briefing');
    setOverlayMessage(null);
    resetWorld(world, shipRef);
    setEventFeed([
      'Bastion Aurelia detecta actividad pirata en la Fractura Spectra.',
      'El convoy Aurora espera una ruta de evacuación estable para cruzar.',
    ]);
    syncHud(getHudSnapshot(world, shipRef));
  };

  const handleFlightUpdate = (isBoosting: boolean, isAccelerating: boolean, delta: number) => {
    if (world.mission.phase === 'briefing' || world.mission.phase === 'dead' || world.mission.phase === 'victory') {
      return;
    }

    if (isAccelerating) {
      world.player.fuel = clamp(world.player.fuel - delta * (isBoosting ? 10 : 3.8), 0, 100);
      if (isBoosting) {
        world.player.plasma = clamp(world.player.plasma - delta * 12, 0, 100);
      }
    }
  };

  return (
    <>
      <Canvas camera={{ fov: 68, position: [0, 2, 62] }} gl={{ antialias: true }}>
        <color attach="background" args={['#02040c']} />
        <fog attach="fog" args={['#02040c', 150, 420]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[12, 18, 8]} intensity={1.8} color="#dbeafe" />
        <directionalLight position={[-18, 8, -14]} intensity={0.9} color="#67e8f9" />

        <SectorBackdrop />
        <Stars radius={430} depth={120} count={18000} factor={8} saturation={0.2} fade speed={0.8} />
        <Stars radius={260} depth={60} count={3600} factor={5} saturation={1} fade speed={1.2} />
        <Sparkles count={120} scale={[320, 180, 320]} size={1.6} speed={0.25} opacity={0.35} color="#c4b5fd" />

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.8} intensity={1.8} mipmapBlur />
        </EffectComposer>

        <MiningBelt world={world} />
        <PickupField world={world} type="ore" color="#fbbf24" />
        <PickupField world={world} type="repair" color="#34d399" />
        <PickupField world={world} type="plasma" color="#67e8f9" />
        <ProjectileLayer projectiles={world.playerProjectiles} color="#67e8f9" emissive="#22d3ee" scale={[0.22, 7.4, 0.22]} />
        <ProjectileLayer projectiles={world.enemyProjectiles} color="#fb7185" emissive="#fb7185" scale={[0.18, 5.4, 0.18]} />
        <EnemySquadron world={world} />
        <StationAurelia health={hud.station} />
        <AlliedConvoy />
        <BreachPortal active={missionPhase === 'defense' || missionPhase === 'boss'} />

        <Float speed={1.4} floatIntensity={1.4} rotationIntensity={0.2}>
          <Text position={[20, 26, -92]} fontSize={4.4} color="#fde68a" outlineWidth={0.18} outlineColor="#78350f">
            CINTURON QUEBRADO
          </Text>
        </Float>

        <Spaceship
          ref={shipRef}
          isSandbox={true}
          hasFuel={world.player.fuel > 1}
          controlsEnabled={controlsEnabled}
          onFlightUpdate={handleFlightUpdate}
          onShoot={(position, quaternion) => spawnPlayerProjectile(world, position, quaternion)}
        />

        <GameDirector
          world={world}
          shipRef={shipRef}
          onHudSync={syncHud}
          onPhaseChange={handlePhaseChange}
          onEvent={pushEvent}
        />
      </Canvas>

      {briefingOpen && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_rgba(2,6,23,0.94)_50%,_rgba(2,6,23,1)_100%)] px-6">
          <div className="w-full max-w-4xl rounded-[32px] border border-cyan-400/30 bg-slate-950/80 p-8 text-white shadow-[0_0_90px_rgba(34,211,238,0.18)] backdrop-blur-xl md:p-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/80">Operación</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-100 md:text-5xl">Aurora: Last Light</h1>
              </div>
              <div className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] text-rose-200">
                Alerta pirata en curso
              </div>
            </div>

            <p className="max-w-3xl text-pretty text-lg leading-8 text-slate-300">
              La capitana Nyx Spectra ha abierto una fractura en el sector y su flota busca destruir Bastion Aurelia antes de que el convoy Aurora pueda escapar. Tu interceptor debe minar lumen del cinturón quebrado, alimentar el portal de evacuación y sostener la línea hasta el final del asedio.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300">Acto I</p>
                <p className="mt-3 text-sm text-slate-300">Destruye asteroides ámbar y recoge 180 unidades de lumen.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300">Acto II</p>
                <p className="mt-3 text-sm text-slate-300">Vuelve a la estación para abrir el portal y activar las defensas.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300">Acto III</p>
                <p className="mt-3 text-sm text-slate-300">Sobrevive a tres oleadas y derriba el acorazado Spectra.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-[0.18em] text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">W/S acelerar y frenar</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Flechas pitch y yaw</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">A/D roll</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Shift impulso</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Space disparo</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-xl text-sm text-slate-400">Consejo táctico: cerca de Bastion Aurelia tus sistemas recargan combustible, escudos y plasma.</p>
              <button
                type="button"
                onClick={launchMission}
                className="rounded-full border border-cyan-300/60 bg-cyan-300 px-7 py-3 font-mono text-sm font-semibold uppercase tracking-[0.22em] text-slate-950 transition hover:scale-[1.02] hover:bg-cyan-200"
              >
                Lanzar misión
              </button>
            </div>
          </div>
        </div>
      )}

      {(missionPhase === 'dead' || missionPhase === 'victory') && overlayMessage && (
        <div className="absolute inset-0 z-[130] flex items-center justify-center bg-slate-950/82 px-6 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-950/90 p-8 text-center text-white shadow-[0_0_80px_rgba(15,23,42,0.7)]">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/80">
              {missionPhase === 'victory' ? 'Misión completada' : 'Misión fallida'}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-100">
              {missionPhase === 'victory' ? 'El convoy ha escapado' : 'La línea se ha roto'}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">{overlayMessage}</p>
            <button
              type="button"
              onClick={resetMission}
              className="mt-8 rounded-full border border-white/15 bg-white px-7 py-3 font-mono text-sm font-semibold uppercase tracking-[0.22em] text-slate-950 transition hover:scale-[1.02]"
            >
              Reiniciar misión
            </button>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-6 top-24 z-[80] max-w-sm rounded-[24px] border border-cyan-300/20 bg-slate-950/65 p-5 text-white shadow-[0_0_40px_rgba(8,47,73,0.45)] backdrop-blur-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-cyan-300/75">Objetivo</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">{hud.objective}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{hud.subobjective}</p>
        <p className="mt-4 border-t border-white/10 pt-4 text-xs uppercase tracking-[0.18em] text-slate-400">{hud.prompt}</p>
      </div>

      <div className="pointer-events-none absolute right-6 top-24 z-[80] flex w-[250px] flex-col gap-3">
        <div className="rounded-[22px] border border-white/10 bg-slate-950/65 p-4 text-white backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cyan-300/80">Estado</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Puntuación</p>
              <p className="mt-1 text-lg font-semibold text-white">{hud.score}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Lumen</p>
              <p className="mt-1 text-lg font-semibold text-amber-300">{hud.ore}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Hostiles</p>
              <p className="mt-1 text-lg font-semibold text-rose-300">{hud.enemies}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Oleada</p>
              <p className="mt-1 text-lg font-semibold text-cyan-200">{Math.max(hud.wave, 0)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-slate-950/65 p-4 text-white backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cyan-300/80">Bitácora</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
            {eventFeed.map((message) => (
              <p key={message} className="rounded-xl border border-white/6 bg-white/5 px-3 py-2 leading-6">
                {message}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-6 z-[80] w-[320px] rounded-[24px] border border-white/10 bg-slate-950/70 p-5 text-white shadow-[0_0_40px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400">
              <span>Casco</span>
              <span>{Math.round(hud.hull)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-rose-400 transition-all duration-150" style={{ width: `${hud.hull}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400">
              <span>Escudo</span>
              <span>{Math.round(hud.shield)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300 transition-all duration-150" style={{ width: `${hud.shield}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400">
              <span>Combustible</span>
              <span>{Math.round(hud.fuel)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-amber-300 transition-all duration-150" style={{ width: `${hud.fuel}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400">
              <span>Plasma</span>
              <span>{Math.round(hud.plasma)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-300 transition-all duration-150" style={{ width: `${hud.plasma}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400">
              <span>Estación</span>
              <span>{Math.round(hud.station)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-violet-300 transition-all duration-150" style={{ width: `${hud.station}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 z-[80] rounded-[22px] border border-white/10 bg-slate-950/70 p-4 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300 backdrop-blur-xl">
        <p className="mb-2 text-cyan-300/80">Controles</p>
        <p>W/S impulso y freno</p>
        <p>Flechas pitch y yaw</p>
        <p>A/D roll</p>
        <p>Shift postcombustión</p>
        <p>Space cañones de plasma</p>
      </div>
    </>
  );
}
