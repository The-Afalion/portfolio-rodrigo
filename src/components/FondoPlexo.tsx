"use client";
import { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MotionValue, useTransform } from "framer-motion";
import * as THREE from "three";

const cantidadParticulas = 500;

function Particulas({ progresoScrollY }: { progresoScrollY: MotionValue<number> }) {
  const refMalla = useRef<THREE.InstancedMesh>(null!);
  const objetoTemporal = useMemo(() => new THREE.Object3D(), []);
  const posRaton = useRef(new THREE.Vector2(0, 0));
  const colorRef = useRef(new THREE.Color());
  const [particleColor, setParticleColor] = useState("#3b82f6");

  // Leer el color de las variables CSS para que se adapte al tema
  useEffect(() => {
    const colorValue = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    // Asumiendo que el color es HSL, lo convertimos a un formato que Three.js entiende
    // Esta es una simplificación. En un caso real, se necesitaría una librería de conversión de color.
    // Por ahora, usaremos un color fijo que funcione bien en ambos temas.
    // En modo oscuro será azul, en modo claro será un gris azulado.
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setParticleColor(theme === 'dark' ? '#3b82f6' : '#64748b');
  }, []); // Se ejecuta una vez. Para cambios de tema dinámicos, necesitaríamos un listener.

  const particulas = useMemo(() => {
    const temp = [];
    for (let i = 0; i < cantidadParticulas; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const velocidad = 0.01 + Math.random() / 200;
      const x = (Math.random() - 0.5) * 25; // Aumentamos la dispersión
      const y = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 25;
      temp.push({ t, factor, velocidad, x, y, z });
    }
    return temp;
  }, []);

  const rotacionY = useTransform(progresoScrollY, [0, 1], [0, Math.PI]);

  useFrame((estado) => {
    posRaton.current.lerp(estado.mouse, 0.05);
    refMalla.current.rotation.y = rotacionY.get();

    particulas.forEach((particula, i) => {
      let { t, factor, velocidad, x, y, z } = particula;
      t = particula.t += velocidad / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);

      objetoTemporal.position.set(
        x + a * (factor / 10),
        y + b * (factor / 10),
        z + s * (factor / 10)
      );

      const distanciaAlRaton = objetoTemporal.position.distanceTo(new THREE.Vector3(posRaton.current.x * 5, posRaton.current.y * 5, 0));
      let escala = s;
      if (distanciaAlRaton < 1.5) {
        escala = s * (1 + (1.5 - distanciaAlRaton)); // Las partículas cercanas al ratón se hacen más grandes
      }
      
      objetoTemporal.scale.set(escala, escala, escala);
      objetoTemporal.updateMatrix();
      refMalla.current.setMatrixAt(i, objetoTemporal.matrix);
    });
    refMalla.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={refMalla} args={[undefined, undefined, cantidadParticulas]}>
      <sphereGeometry args={[0.03, 32, 32]} />
      <meshStandardMaterial color={particleColor} emissive={particleColor} emissiveIntensity={0.5} />
    </instancedMesh>
  );
}

export default function FondoPlexo({ progresoScrollY }: { progresoScrollY: MotionValue<number> }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-background">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <fog attach="fog" args={['#0a0f19', 15, 25]} /> {/* Niebla para efecto de profundidad */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Particulas progresoScrollY={progresoScrollY} />
      </Canvas>
    </div>
  );
}
