"use client";
import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";

const TAMANO_REJILLA = 10;
const TAMANO_CUBO = 0.5;
const colorBase = new THREE.Color("#3B82F6");

function Cubo({ ...props }) {
  const refCubo = useRef<any>();
  const colorTemporal = new THREE.Color();

  useFrame(({ clock }) => {
    if (refCubo.current) {
      const tiempo = clock.getElapsedTime();
      const angulo =
        (props.position[0] + props.position[1] + props.position[2]) * 0.1 +
        tiempo * 0.2;
      refCubo.current.rotation.x = angulo;
      refCubo.current.rotation.y = angulo;

      const distancia = refCubo.current.position.distanceTo(new THREE.Vector3(0, 0, 0));
      const intensidad = Math.max(0, 1 - distancia / (TAMANO_REJILLA / 2));
      
      refCubo.current.color.set(colorTemporal.copy(colorBase).multiplyScalar(intensidad * 2));
    }
  });
  return <Instance ref={refCubo} {...props} />;
}

export default function RejillaDeCubos() {
  const refGrupo = useRef<THREE.Group>(null);

  useFrame(({ clock, mouse }) => {
    if (refGrupo.current) {
      refGrupo.current.rotation.y = clock.getElapsedTime() * 0.05;
      refGrupo.current.rotation.x = clock.getElapsedTime() * 0.05;
      refGrupo.current.position.x = (mouse.x * TAMANO_REJILLA) / 4;
      refGrupo.current.position.y = (mouse.y * TAMANO_REJILLA) / 4;
    }
  });

  return (
    <group ref={refGrupo}>
      <Instances>
        <boxGeometry args={[TAMANO_CUBO, TAMANO_CUBO, TAMANO_CUBO]} />
        <meshStandardMaterial />
        {Array.from({ length: TAMANO_REJILLA * TAMANO_REJILLA * TAMANO_REJILLA }).map(
          (_, i) => {
            const x = (i % TAMANO_REJILLA) - TAMANO_REJILLA / 2;
            const y =
              Math.floor((i / TAMANO_REJILLA) % TAMANO_REJILLA) - TAMANO_REJILLA / 2;
            const z =
              Math.floor(i / (TAMANO_REJILLA * TAMANO_REJILLA)) - TAMANO_REJILLA / 2;
            return (
              <Cubo
                key={i}
                position={[x * TAMANO_CUBO * 2, y * TAMANO_CUBO * 2, z * TAMANO_CUBO * 2]}
              />
            );
          }
        )}
      </Instances>
    </group>
  );
}
