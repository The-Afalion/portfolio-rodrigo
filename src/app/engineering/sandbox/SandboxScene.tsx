"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Float } from '@react-three/drei';
import React, { useRef, useState, useEffect, useMemo, forwardRef } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Spaceship } from '@/components/3d/Spaceship';

// --- SISTEMA GLOBAL PARA PERFORMANCE ---
export let globalFuel = 100;
export let globalPlasma = 100;
export let globalMinerals = 0;
export let globalWantedLevel = 0;
const POLICE_MAX = 5;
let isPlayerDead = false;

function updateHUD() {
  const fuelEl = document.getElementById('hud-fuel');
  const plasmaEl = document.getElementById('hud-plasma');
  const minEl = document.getElementById('hud-minerals');
  const wantedEl = document.getElementById('hud-wanted');
  
  if (fuelEl) fuelEl.style.width = `${Math.max(0, Math.min(100, globalFuel))}%`;
  if (plasmaEl) plasmaEl.style.width = `${Math.max(0, Math.min(100, globalPlasma))}%`;
  if (minEl) minEl.innerText = globalMinerals.toString();
  if (wantedEl) {
    wantedEl.innerText = globalWantedLevel > 0 ? `WANTED LEVEL: ${globalWantedLevel} - POLICE INBOUND` : 'STATUS: CLEAR';
    wantedEl.style.color = globalWantedLevel > 0 ? '#ef4444' : '#4ade80';
  }
}

// --- PROJECTILES SISTEMA (Player) ---
const PROJECTILES_COUNT = 30;
export const projectiles = Array.from({ length: PROJECTILES_COUNT }, () => ({
  active: false,
  pos: new THREE.Vector3(),
  vel: new THREE.Vector3(),
  life: 0
}));

// --- PROJECTILES SISTEMA (Police) ---
export const policeProjectiles = Array.from({ length: 30 }, () => ({
  active: false,
  pos: new THREE.Vector3(),
  vel: new THREE.Vector3(),
  life: 0
}));

// --- ARRAYS GLOBALES ---
const ASTEROID_COUNT = 250;
const sandboxAsteroids = Array.from({ length: ASTEROID_COUNT }, () => ({
  active: true,
  pos: new THREE.Vector3((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 800),
  scale: Math.random() * 3 + 1,
  rotation: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
  vel: new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5)
}));

const MERCHANT_COUNT = 15;
const merchants = Array.from({ length: MERCHANT_COUNT }, () => ({
  active: true,
  pos: new THREE.Vector3((Math.random() - 0.5) * 600, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 600),
  vel: new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20),
  quaternion: new THREE.Quaternion()
}));

const POLICE_COUNT = 5;
const policeCars = Array.from({ length: POLICE_COUNT }, () => ({
  active: false,
  pos: new THREE.Vector3(),
  lastShot: 0
}));

// --- COMPONENTES VISUALES ---

function ProjectileBeams({ isPolice = false }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();
  const arr = isPolice ? policeProjectiles : projectiles;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    arr.forEach((p, i) => {
      if (p.active) {
        p.life -= delta;
        if (p.life <= 0) p.active = false;
        p.pos.add(p.vel.clone().multiplyScalar(delta));
        
        if (!isPolice) {
          // Player shoots asteroids
          sandboxAsteroids.forEach(ast => {
             if (ast.active && p.pos.distanceTo(ast.pos) < ast.scale * 1.5) {
                ast.active = false; p.active = false;
                globalMinerals += Math.floor(ast.scale * 10);
             }
          });
          // Player shoots merchants -> Crime!
          merchants.forEach(m => {
            if (m.active && p.pos.distanceTo(m.pos) < 6) {
               m.active = false; p.active = false;
               globalMinerals += 100;
               globalWantedLevel += 1;
            }
         });
        } 

        dummy.position.copy(p.pos);
        dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.vel.clone().normalize());
        dummy.scale.set(0.8, 15, 0.8); // Laser grueso y super rápido
      } else {
        dummy.scale.set(0, 0, 0); // Ocultar
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, arr.length]}>
      <cylinderGeometry args={[1, 1, 1, 8]} />
      <meshStandardMaterial 
        color={isPolice ? "#ef4444" : "#06b6d4"} 
        emissive={isPolice ? "#ef4444" : "#0284c7"} 
        emissiveIntensity={isPolice ? 10 : 8} 
        toneMapped={false} 
      />
    </instancedMesh>
  );
}

function AsteroidsField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    sandboxAsteroids.forEach((ast, i) => {
      if (ast.active) {
        ast.pos.add(ast.vel.clone().multiplyScalar(delta));
        dummy.position.copy(ast.pos);
        dummy.rotation.setFromVector3(ast.rotation);
        dummy.scale.setScalar(ast.scale);
      } else {
        dummy.scale.set(0,0,0);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ASTEROID_COUNT]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#475569" roughness={0.8} />
    </instancedMesh>
  );
}

// NPC Merchants (Cargueros lentos)
function MerchantsSwarm() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    merchants.forEach((m, i) => {
      if (m.active) {
        m.pos.add(m.vel.clone().multiplyScalar(delta));
        const dir = m.vel.clone().normalize();
        
        // Evitar el centro si se alejan mucho (rebote suave)
        if (m.pos.length() > 300) {
          m.vel.lerp(m.pos.clone().multiplyScalar(-1).normalize().multiplyScalar(20), 0.01);
        }

        const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        m.quaternion.slerp(targetQuat, 0.1);

        dummy.position.copy(m.pos);
        dummy.quaternion.copy(m.quaternion);
        dummy.scale.set(6, 2, 8); 
      } else {
        dummy.scale.set(0,0,0);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MERCHANT_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.5} />
    </instancedMesh>
  );
}

// Policía Intergaláctica (IA de persecución)
function PoliceSwarm({ playerRef, onPlayerHit }: { playerRef: React.RefObject<THREE.Group>, onPlayerHit: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (!meshRef.current || !playerRef.current || isPlayerDead) return;
    
    // Spawn police if wanted
    if (globalWantedLevel > 0) {
      const activePoliceCount = policeCars.filter(p => p.active).length;
      if (activePoliceCount < Math.min(globalWantedLevel, POLICE_MAX)) {
        const inactive = policeCars.find(p => !p.active);
        if (inactive) {
          inactive.active = true;
          // Spawn detrás del jugador lejos
          inactive.pos.copy(playerRef.current.position).add(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
        }
      }
    }

    policeCars.forEach((p, i) => {
      if (p.active) {
        // Moverse hacia el jugador rápido
        const dirToPlayer = playerRef.current!.position.clone().sub(p.pos).normalize();
        p.pos.add(dirToPlayer.multiplyScalar(delta * 40)); 
        
        dummy.position.copy(p.pos);
        dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), dirToPlayer);
        dummy.scale.setScalar(2); 

        // Disparar
        const dist = p.pos.distanceTo(playerRef.current!.position);
        if (dist < 100 && state.clock.elapsedTime - p.lastShot > 1.0) {
           p.lastShot = state.clock.elapsedTime;
           const proj = policeProjectiles.find(pr => !pr.active);
           if (proj) {
             proj.active = true; proj.life = 2; proj.pos.copy(p.pos);
             proj.vel.copy(dirToPlayer.clone().multiplyScalar(200));
           }
        }
      } else {
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Check hit by police laser
    policeProjectiles.forEach(pr => {
      if (pr.active && pr.pos.distanceTo(playerRef.current!.position) < 3) {
        pr.active = false;
        onPlayerHit();
      }
    });

  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POLICE_MAX]}>
      <coneGeometry args={[1, 3, 4]} />
      <meshStandardMaterial color="#ef4444" wireframe />
    </instancedMesh>
  );
}

function GasStation() {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group ref={meshRef} position={[40, -10, -60]}>
      <mesh>
         <cylinderGeometry args={[8, 8, 30, 16]} />
         <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={1} toneMapped={false} wireframe />
      </mesh>
      <mesh position={[0, -15, 0]}>
         <sphereGeometry args={[10, 16, 16]} />
         <meshStandardMaterial color="#334155" />
      </mesh>
      <Text position={[0, 20, 0]} fontSize={6} color="#fcd34d">OUTPOST (FUEL)</Text>
    </group>
  );
}

function MothershipOmega({ shipRef, setTradeUI }: { shipRef: React.RefObject<THREE.Group>, setTradeUI: (v: boolean) => void }) {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  const hangarCenter = new THREE.Vector3(0, -10, 20); // Posición local del hangar de atraque

  useFrame((state, delta) => {
    if (!meshRef.current || !shipRef.current || !ringRef.current) return;
    meshRef.current.rotation.y += delta * 0.05;
    ringRef.current.rotation.x += delta * 0.5;
    
    // Calcular posición global del hangar
    const globalHangar = hangarCenter.clone().applyMatrix4(meshRef.current.matrixWorld);
    
    // Si estricta y físicamente entramos en el hangar
    if (shipRef.current.position.distanceTo(globalHangar) < 15) {
       setTradeUI(true);
    } else {
       setTradeUI(false);
    }
  });

  return (
    <group ref={meshRef} position={[-150, 40, -250]}>
       {/* Casco Principal */}
       <mesh>
         <boxGeometry args={[60, 20, 120]} />
         <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
       </mesh>
       
       {/* Anillos Rotatorios de Gravedad */}
       <mesh ref={ringRef}>
         <torusGeometry args={[45, 3, 16, 100]} />
         <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2} toneMapped={false} wireframe />
       </mesh>

       {/* Tormenta de Antenas */}
       <mesh position={[0, 20, -40]}>
         <cylinderGeometry args={[0.5, 0.5, 40]} />
         <meshStandardMaterial color="#cbd5e1" />
       </mesh>

       {/* HANGAR DE ATERRIZAJE (CAVIDAD GIGANTE) */}
       <group position={[0, -10, 20]}>
          <mesh>
            {/* Box abierto (BackSide) para simular entrada */}
            <boxGeometry args={[30, 10, 40]} />
            <meshStandardMaterial color="#1e293b" side={THREE.BackSide} />
          </mesh>
          <mesh position={[0, -4.9, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[30, 40]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={2} wireframe />
          </mesh>
          <Text position={[0, 8, 20]} fontSize={4} color="#06b6d4" outlineWidth={0.2} outlineColor="black">DOCKING BAY 01</Text>
       </group>
       
       <Text position={[0, 45, 0]} fontSize={10} color="#06b6d4" outlineWidth={0.2} outlineColor="black">MOTHERSHIP OMEGA</Text>
    </group>
  );
}


// --- ESCENA PRINCIPAL ---
export default function SandboxScene() {
  const shipRef = useRef<THREE.Group>(null);
  const [tradeUI, setTradeUI] = useState(false);
  const [deadUI, setDeadUI] = useState(false);
  const [mineralsRender, setMineralsRender] = useState(0);

  useEffect(() => {
     if (tradeUI) setMineralsRender(globalMinerals);
  }, [tradeUI]);

  // Gestor Central de Vuelo para usar Fuel
  const handleFlightUpdate = (isBoosting: boolean, isAccelerating: boolean, delta: number) => {
     if (gasStationCheck()) {
       globalFuel += delta * 40; if(globalFuel>100) globalFuel=100;
     }

     updateHUD();
  };

  const handleShoot = (pos: THREE.Vector3, quat: THREE.Quaternion) => {
    if (globalPlasma < 2) return;
    const proj = projectiles.find(p => !p.active);
    if (proj) {
      globalPlasma -= 2;
      proj.active = true;
      proj.life = 2; // Láser duradero
      proj.pos.copy(pos);
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
      proj.pos.add(forward.clone().multiplyScalar(2));
      proj.vel.copy(forward.multiplyScalar(300)); // Increíblemente veloz
    }
  };

  const handleDeath = () => {
     isPlayerDead = true;
     setDeadUI(true);
  };

  const resetGame = () => {
    isPlayerDead = false;
    globalWantedLevel = 0;
    globalFuel = 100;
    globalPlasma = 100;
    if(shipRef.current) {
       shipRef.current.position.set(0,0,0);
       shipRef.current.rotation.set(0,0,0);
    }
    setDeadUI(false);
  };

  // Verificación simple de Gasolinera
  const gasStationCheck = () => {
    if (!shipRef.current) return false;
    // Gasolina pos en GasStation es [40, -10, -60]
    return shipRef.current.position.distanceTo(new THREE.Vector3(40, -10, -60)) < 30;
  };

  return (
    <>
      <Canvas camera={{ fov: 70 }}>
        <color attach="background" args={['#010103']} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 20, 5]} intensity={1} />
        
        <Stars radius={400} depth={100} count={20000} factor={8} saturation={1} fade speed={1} />
        
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={2} />
        </EffectComposer>

        {!isPlayerDead && (
          <Spaceship 
            ref={shipRef} 
            isSandbox={true} 
            hasFuel={globalFuel > 0}
            onFlightUpdate={handleFlightUpdate}
            onShoot={handleShoot}
          />
        )}
        
        <GasStation />
        <MothershipOmega shipRef={shipRef} setTradeUI={setTradeUI} />
        <MerchantsSwarm />
        <PoliceSwarm playerRef={shipRef} onPlayerHit={handleDeath} />
        
        <ProjectileBeams isPolice={false} />
        <ProjectileBeams isPolice={true} />
        <AsteroidsField />
      </Canvas>

      {/* RENDER DOM FUERA DEL CANVAS */}
      
      {deadUI && (
         <div className="absolute inset-0 bg-red-900/80 z-[200] flex flex-col items-center justify-center font-mono">
            <h1 className="text-6xl text-white font-bold mb-4">NAVE DESTRUIDA</h1>
            <p className="text-red-200 text-xl mb-8">La Policía Intergaláctica te ha aniquilado.</p>
            <button onClick={resetGame} className="px-8 py-3 bg-white text-black font-bold text-lg rounded opacity-90 hover:opacity-100">
               REINICIAR SIMULACIÓN
            </button>
         </div>
      )}

      {/* Trade UI Overlay */}
      {tradeUI && !isPlayerDead && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/95 border-2 border-cyan-500 p-8 rounded-lg z-50 text-white w-[400px] font-mono shadow-[0_0_50px_rgba(6,182,212,0.4)] animate-fade-in flex flex-col pointer-events-auto">
          <h2 className="text-3xl text-cyan-400 font-bold mb-4 text-center border-b border-cyan-500/50 pb-2">
             MOTHERSHIP OMEGA<br/><span className="text-sm text-cyan-200/50">PLATAFORMA DE ATRAQUE (HANGAR 01)</span>
          </h2>
          <div className="mb-4 text-center text-lg">Carga Mineral: <span className="text-emerald-400 font-bold">{mineralsRender}</span></div>
          <div className="flex flex-col gap-4">
            <button 
               onClick={() => { if (globalMinerals >= 50) { globalMinerals-=50; globalPlasma=100; setMineralsRender(globalMinerals); updateHUD(); } }}
               className="bg-cyan-900/50 hover:bg-cyan-700/80 p-4 rounded text-cyan-300 transition-colors flex justify-between uppercase text-sm font-bold"
            >
              <span>Recargar Plasma</span> <span>-50 MIN</span>
            </button>
            <button 
               onClick={() => { if (globalMinerals >= 100) { globalMinerals-=100; globalFuel=100; setMineralsRender(globalMinerals); updateHUD(); } }}
               className="bg-amber-900/50 hover:bg-amber-700/80 p-4 rounded text-amber-300 transition-colors flex justify-between uppercase text-sm font-bold"
            >
              <span>Recargar Gasolina</span> <span>-100 MIN</span>
            </button>
            <button 
               onClick={() => { globalWantedLevel = 0; updateHUD(); }}
               className="bg-indigo-900/50 hover:bg-indigo-700/80 p-4 rounded text-indigo-300 transition-colors flex justify-between uppercase text-sm font-bold"
            >
              <span>Sobornar Policía</span> <span>-200 MIN</span>
            </button>
            <p className="text-xs text-cyan-400/50 text-center mt-4 tracking-widest uppercase border-t border-cyan-900 pt-4">Acelera para desorbitar y salir del hangar.</p>
          </div>
        </div>
      )}

      {/* HUD del Usuario */}
      <div className="absolute top-24 left-6 pointer-events-none z-50 bg-black/60 p-4 rounded border border-white/20 font-mono shadow-xl backdrop-blur-md">
        <p className="text-emerald-400 font-bold text-xl mb-2">MINERALES: <span id="hud-minerals">0</span></p>
        <p id="hud-wanted" className="text-emerald-400 text-xs font-bold tracking-wider">STATUS: CLEAR</p>
      </div>

      <div className="absolute bottom-6 left-6 w-72 flex flex-col gap-4 pointer-events-none z-50">
        <div>
          <div className="flex justify-between text-white/70 font-mono text-[10px] mb-1 font-bold">
            <span>FUEL (GASOLINA)</span>
          </div>
          <div className="h-3 w-full bg-black/80 border border-white/20 rounded-sm overflow-hidden">
            <div id="hud-fuel" className="h-full bg-[#fcd34d] transition-all duration-75" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-white/70 font-mono text-[10px] mb-1 font-bold">
            <span>PLASMA (LÁSER / TURBO)</span>
          </div>
          <div className="h-3 w-full bg-black/80 border border-white/20 rounded-sm overflow-hidden">
            <div id="hud-plasma" className="h-full bg-[#06b6d4] transition-all duration-75" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 text-white/40 font-mono text-[10px] text-right pointer-events-none z-50 bg-black/40 p-4 rounded backdrop-blur">
        <p className="font-bold text-cyan-400 mb-2 border-b border-cyan-900 pb-1">6DOF FLIGHT SYSTEMS</p>
        <p>[W] ACELERAR | [S] FRENAR</p>
        <p>[↑][↓] CABECEO (PITCH)</p>
        <p>[←][→] GUIÑADA (YAW)</p>
        <p>[A][D] ALABEO (ROLL)</p>
        <p className="text-cyan-200 mt-2">[SHIFT] TURBO DE PLASMA</p>
        <p className="text-emerald-300 font-bold mt-1">[SPACE] DISPARAR LÁSER</p>
      </div>
    </>
  );
}
