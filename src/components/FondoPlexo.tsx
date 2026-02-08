"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MotionValue, useTransform } from "framer-motion";
import * as THREE from "three";

const cantidadParticulas = 500;

function Particulas({ progresoScrollY }: { progresoScrollY: MotionValue<number> }) {
  const refMalla = useRef<THREE.InstancedMesh>(null!);
  const objetoTemporal = useMemo(() => new THREE.Object3D(), []);
  const posRaton = useRef(new THREE.Vector2(0, 0));

  const particulas = useMemo(() => {
    const temp = [];
    for (let i = 0; i < cantidadParticulas; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const velocidad = 0.01 + Math.random() / 200;
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      temp.push({ t, factor, velocidad, x, y, z });
    }
    return temp;
  }, []);

  const rotacionY = useTransform(progresoScrollY, [0, 1], [0, Math.PI * 2]);

  useFrame((estado) => {
    posRaton.current.lerp(estado.mouse, 0.05);

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

      // Lógica de repulsión del ratón
      const distanciaAlRaton = objetoTemporal.position.distanceTo(new THREE.Vector3(posRaton.current.x * 5, posRaton.current.y * 5, 0));
      if (distanciaAlRaton < 1.5) {
        const fuerzaRepulsion = (1.5 - distanciaAlRaton) * 0.1;
        objetoTemporal.position.add(objetoTemporal.position.clone().sub(new THREE.Vector3(posRaton.current.x * 5, posRaton.current.y * 5, 0)).normalize().multiplyScalar(fuerzaRepulsion));
      }

      objetoTemporal.scale.set(s, s, s);
      objetoTemporal.updateMatrix();
      refMalla.current.setMatrixAt(i, objetoTemporal.matrix);
    });
    refMalla.current.instanceMatrix.needsUpdate = true;
    refMalla.current.rotation.y = rotacionY.get();
  });

  return (
    <instancedMesh ref={refMalla} args={[undefined, undefined, cantidadParticulas]}>
      <sphereGeometry args={[0.02, 32, 32]} />
      <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
    </instancedMesh>
  );
}

export default function FondoPlexo({ progresoScrollY }: { progresoScrollY: MotionValue<number> }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.1} />
        <Particulas progresoScrollY={progresoScrollY} />
      </Canvas>
    </div>
  );
}
