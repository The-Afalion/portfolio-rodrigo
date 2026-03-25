"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text } from '@react-three/drei';
import React, { useRef, useState, useEffect, useMemo, forwardRef } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- SISTEMA GLOBAL PARA PERFORMANCE ---
export let globalFuel = 100;
export let globalPlasma = 100;
export let globalMinerals = 0;

function updateHUD() {
  const fuelEl = document.getElementById('hud-fuel');
  const plasmaEl = document.getElementById('hud-plasma');
  const minEl = document.getElementById('hud-minerals');
  if (fuelEl) fuelEl.style.width = `${Math.max(0, Math.min(100, globalFuel))}%`;
  if (plasmaEl) plasmaEl.style.width = `${Math.max(0, Math.min(100, globalPlasma))}%`;
  if (minEl) minEl.innerText = globalMinerals.toString();
}

// --- PROJECTILES SISTEMA ---
const PROJECTILES_COUNT = 30;
const projectiles = Array.from({ length: PROJECTILES_COUNT }, () => ({
  active: false,
  pos: new THREE.Vector3(),
  vel: new THREE.Vector3(),
  life: 0
}));

function shootPlasma(shipPos: THREE.Vector3, shipQuat: THREE.Quaternion) {
  if (globalPlasma < 2) return;
  const proj = projectiles.find(p => !p.active);
  if (proj) {
    globalPlasma -= 2;
    proj.active = true;
    proj.life = 1.5; // 1.5 segundos de vida
    proj.pos.copy(shipPos);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(shipQuat);
    proj.pos.add(forward.clone().multiplyScalar(2));
    proj.vel.copy(forward.multiplyScalar(150));
  }
}

// --- ARRAY DE ASTEROIDES RECOLECTABLES ---
const ASTEROID_COUNT = 150;
const sandboxAsteroids = Array.from({ length: ASTEROID_COUNT }, () => ({
  active: true,
  pos: new THREE.Vector3((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 400),
  scale: Math.random() * 2 + 1,
  rotation: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
  vel: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2)
}));

// --- COMPONENTES VISUALES ---
function PlasmaBeams() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    projectiles.forEach((p, i) => {
      if (p.active) {
        p.life -= delta;
        if (p.life <= 0) p.active = false;
        p.pos.add(p.vel.clone().multiplyScalar(delta));
        
        // Comprobar colisión con asteroides
        sandboxAsteroids.forEach(ast => {
           if (ast.active && p.pos.distanceTo(ast.pos) < ast.scale * 1.5) {
              ast.active = false; // Asteroide destruido
              p.active = false; // Plasma se consume
              globalMinerals += Math.floor(ast.scale * 10); // Da minerales
           }
        });

        dummy.position.copy(p.pos);
        dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.vel.clone().normalize());
        dummy.scale.set(0.2, 4, 0.2); // Alargado
      } else {
        dummy.scale.set(0, 0, 0); // Ocultar
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PROJECTILES_COUNT]}>
      <cylinderGeometry args={[1, 1, 1, 8]} />
      <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={5} toneMapped={false} />
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

function GasStation({ shipRef }: { shipRef: React.RefObject<THREE.Group> }) {
  const meshRef = useRef<THREE.Group>(null);
  const [isRefueling, setIsRefueling] = useState(false);

  useFrame((state, delta) => {
    if (!meshRef.current || !shipRef.current) return;
    meshRef.current.rotation.y += delta * 0.2;
    
    if (meshRef.current.position.distanceTo(shipRef.current.position) < 25) {
      if (!isRefueling) setIsRefueling(true);
      globalFuel += delta * 40; 
      if (globalFuel > 100) globalFuel = 100;
    } else {
      if (isRefueling) setIsRefueling(false);
    }
  });

  return (
    <group ref={meshRef} position={[40, -10, -60]}>
      <mesh>
         <cylinderGeometry args={[4, 4, 15, 16]} />
         <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={isRefueling ? 3 : 1} toneMapped={false} wireframe />
      </mesh>
      <mesh position={[0, -8, 0]}>
         <sphereGeometry args={[5, 16, 16]} />
         <meshStandardMaterial color="#334155" />
      </mesh>
      <Text position={[0, 10, 0]} fontSize={2} color="#fcd34d">OUTPOST (FUEL)</Text>
    </group>
  );
}

function Mothership({ shipRef, setTradeUI }: { shipRef: React.RefObject<THREE.Group>, setTradeUI: (v: boolean) => void }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!meshRef.current || !shipRef.current) return;
    meshRef.current.rotation.y += delta * 0.05;
    
    if (meshRef.current.position.distanceTo(shipRef.current.position) < 40) {
       setTradeUI(true);
    } else {
       setTradeUI(false);
    }
  });

  return (
    <group ref={meshRef} position={[-80, 20, -120]}>
       <mesh>
         <boxGeometry args={[40, 10, 80]} />
         <meshStandardMaterial color="#1e293b" metalness={0.8} />
       </mesh>
       <mesh position={[0, 8, 0]}>
         <cylinderGeometry args={[20, 20, 5, 32]} />
         <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={2} toneMapped={false} wireframe />
       </mesh>
       <Text position={[0, 25, 0]} fontSize={6} color="#06b6d4" outlineWidth={0.2} outlineColor="black">MOTHERSHIP OMEGA</Text>
       <pointLight color="#06b6d4" intensity={2} distance={100} />
    </group>
  );
}

// --- NAVE 6DOF ---
const Spaceship6DOF = forwardRef<THREE.Group, {}>((props, ref) => {
  const internalRef = useRef<THREE.Group>(null);
  const meshRef = (ref as React.MutableRefObject<THREE.Group>) || internalRef;
  const engineGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const boostGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const velocity = useRef(0);
  const lastShotTime = useRef(0);
  
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.code]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.code]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const rotSpeed = 1.5 * delta;
    
    if (keys['ArrowUp']) meshRef.current.rotateX(-rotSpeed);
    if (keys['ArrowDown']) meshRef.current.rotateX(rotSpeed);
    if (keys['ArrowLeft']) meshRef.current.rotateY(rotSpeed);
    if (keys['ArrowRight']) meshRef.current.rotateY(-rotSpeed);
    if (keys['KeyA']) meshRef.current.rotateZ(rotSpeed);
    if (keys['KeyD']) meshRef.current.rotateZ(-rotSpeed);

    const isBoosting = keys['ShiftLeft'] || keys['ShiftRight'];
    let acceleration = 0;
    
    if (keys['KeyW']) {
       if (globalFuel > 0) {
         acceleration = isBoosting && globalPlasma > 0 ? 40 : 20;
         globalFuel -= delta * (isBoosting ? 0.8 : 0.3); 
         if (isBoosting) globalPlasma -= delta * 5; 
       }
    }
    if (keys['KeyS']) {
      acceleration = -10;
    }

    if (keys['Space'] && state.clock.elapsedTime - lastShotTime.current > 0.15) {
      shootPlasma(meshRef.current.position, meshRef.current.quaternion);
      lastShotTime.current = state.clock.elapsedTime;
    }

    velocity.current += acceleration * delta;
    velocity.current *= 0.98; // Fricción
    meshRef.current.translateZ(-velocity.current * delta);

    updateHUD();

    if (engineGlowRef.current) engineGlowRef.current.emissiveIntensity = keys['KeyW'] && globalFuel > 0 ? 5 : 0;
    if (boostGlowRef.current) boostGlowRef.current.emissiveIntensity = isBoosting && keys['KeyW'] && globalPlasma > 0 ? 10 : 0;

    const idealOffset = new THREE.Vector3(0, 1.2, 3.5);
    idealOffset.applyQuaternion(meshRef.current.quaternion);
    idealOffset.add(meshRef.current.position);
    
    camera.position.lerp(idealOffset, 0.15);
    camera.quaternion.slerp(meshRef.current.quaternion, 0.1);
  });

  return (
    <group ref={meshRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.3, 1.5, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.1, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} toneMapped={false} emissive="#38bdf8" emissiveIntensity={2} />
      </mesh>
      <group position={[-0.4, 0, 0.2]} rotation={[0, 0.2, -0.2]}>
        <mesh><boxGeometry args={[0.8, 0.05, 0.6]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[-0.2, -0.05, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} /><meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
      <group position={[0.4, 0, 0.2]} rotation={[0, -0.2, 0.2]}>
        <mesh><boxGeometry args={[0.8, 0.05, 0.6]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[0.2, -0.05, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} /><meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
      <mesh position={[0, 0.3, 0.4]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.3]} /><meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial ref={engineGlowRef} color="#ef4444" toneMapped={false} emissive="#ef4444" emissiveIntensity={0} />
      </mesh>
      <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]} scale={0.5}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        <meshStandardMaterial ref={boostGlowRef} color="#06b6d4" toneMapped={false} emissive="#06b6d4" emissiveIntensity={0} />
      </mesh>
    </group>
  );
});
Spaceship6DOF.displayName = "Spaceship6DOF";


// --- ESCENA PRINCIPAL ---
export default function SandboxScene() {
  const shipRef = useRef<THREE.Group>(null);
  const [tradeUI, setTradeUI] = useState(false);
  
  // Refrescar para la IU de React
  const [mineralsRender, setMineralsRender] = useState(0);

  // Cada medio segundo, sync React state con global variables si queremos que la UI compleja se actualice.
  // Pero para minerals HUD normal usamos manipulacion directa. La UI de Trade necesita React State.
  useEffect(() => {
     if (tradeUI) setMineralsRender(globalMinerals);
  }, [tradeUI]);

  return (
    <>
      <Canvas camera={{ fov: 70 }}>
        <color attach="background" args={['#010103']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[100, 100, 100]} intensity={1} />
        
        <Stars radius={200} depth={50} count={15000} factor={6} saturation={1} fade speed={1} />
        
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
        </EffectComposer>

        <Spaceship6DOF ref={shipRef} />
        
        <GasStation shipRef={shipRef} />
        <Mothership shipRef={shipRef} setTradeUI={setTradeUI} />
        
        <PlasmaBeams />
        <AsteroidsField />

      </Canvas>

      {/* RENDER DOM FUERA DEL CANVAS */}
      
      {/* Trade UI Overlay */}
      {tradeUI && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 border-2 border-cyan-500 p-8 rounded-lg z-50 text-white w-96 font-mono shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-fade-in flex flex-col pointer-events-auto">
          <h2 className="text-2xl text-cyan-400 font-bold mb-4 text-center border-b border-cyan-500/50 pb-2">
             MOTHERSHIP OMEGA<br/><span className="text-sm text-cyan-200/50">INTERFAZ DE COMERCIO</span>
          </h2>
          <div className="mb-4 text-center">Tus Minerales: <span className="text-emerald-400 font-bold">{mineralsRender}</span></div>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => { globalMinerals += 100; setMineralsRender(globalMinerals); }} 
              className="bg-emerald-900/50 hover:bg-emerald-700/80 p-3 rounded text-emerald-300 transition-colors flex justify-between"
            >
              <span>Vender Extra (Debug)</span> <span>+100 CR</span>
            </button>
            <button 
               onClick={() => { if (globalMinerals >= 50) { globalMinerals-=50; globalPlasma=100; setMineralsRender(globalMinerals); updateHUD(); } }}
               className="bg-amber-900/50 hover:bg-amber-700/80 p-3 rounded text-amber-300 transition-colors flex justify-between"
            >
              <span>Rellenar Plasma al 100%</span> <span>-50 CR</span>
            </button>
            <button 
               onClick={() => { if (globalMinerals >= 100) { globalMinerals-=100; globalFuel=100; setMineralsRender(globalMinerals); updateHUD(); } }}
               className="bg-fuchsia-900/50 hover:bg-fuchsia-700/80 p-3 rounded text-fuchsia-300 transition-colors flex justify-between"
            >
              <span>Rellenar Gasolina al 100%</span> <span>-100 CR</span>
            </button>
            <p className="text-xs text-white/40 text-center mt-4 tracking-widest uppercase">Destruye asteroides con espacio para conseguir minerales. Alejate de la estación para salir de rango.</p>
          </div>
        </div>
      )}

      {/* HUD del Usuario */}
      <div className="absolute top-24 left-6 pointer-events-none z-50 bg-black/50 p-3 rounded border border-white/10 font-mono shadow-xl">
        <p className="text-emerald-400 font-bold text-lg">MINERALES: <span id="hud-minerals">0</span></p>
      </div>

      <div className="absolute bottom-6 left-6 w-64 flex flex-col gap-3 pointer-events-none z-50">
        <div>
          <div className="flex justify-between text-white/70 font-mono text-[10px] mb-1">
            <span>FUEL (GASOLINA)</span>
          </div>
          <div className="h-3 w-full bg-black/80 border border-white/20 rounded-full overflow-hidden">
            <div id="hud-fuel" className="h-full bg-[#fcd34d] transition-all duration-75" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-white/70 font-mono text-[10px] mb-1">
            <span>PLASMA (ARMAS / TURBO)</span>
          </div>
          <div className="h-3 w-full bg-black/80 border border-white/20 rounded-full overflow-hidden">
            <div id="hud-plasma" className="h-full bg-[#06b6d4] transition-all duration-75" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 text-white/30 font-mono text-[10px] text-right pointer-events-none z-50">
        <p className="font-bold text-white/60 mb-1">6DOF FLIGHT SYSTEMS</p>
        <p>[W] ACELERAR | [S] FRENAR</p>
        <p>[↑][↓] CABECEO (PITCH)</p>
        <p>[←][→] GUIÑADA (YAW)</p>
        <p>[A][D] ALABEO (ROLL)</p>
        <p>[SHIFT] TURBO DE PLASMA</p>
        <p>[SPACE] DISPARAR PLASMA</p>
      </div>
    </>
  );
}
