"use client";
import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";

const GRID_SIZE = 10;
const BOX_SIZE = 0.5;
const baseColor = new THREE.Color("#3B82F6");

export default function CubeGrid() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock, mouse }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.05;
      ref.current.rotation.x = clock.getElapsedTime() * 0.05;
      ref.current.position.x = (mouse.x * GRID_SIZE) / 4;
      ref.current.position.y = (mouse.y * GRID_SIZE) / 4;
    }
  });

  return (
    <group ref={ref}>
      <Instances>
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
        <meshStandardMaterial />
        {Array.from({ length: GRID_SIZE * GRID_SIZE * GRID_SIZE }).map(
          (_, i) => {
            const x = (i % GRID_SIZE) - GRID_SIZE / 2;
            const y =
              Math.floor((i / GRID_SIZE) % GRID_SIZE) - GRID_SIZE / 2;
            const z =
              Math.floor(i / (GRID_SIZE * GRID_SIZE)) - GRID_SIZE / 2;
            return (
              <Cube
                key={i}
                position={[x * BOX_SIZE * 2, y * BOX_SIZE * 2, z * BOX_SIZE * 2]}
              />
            );
          }
        )}
      </Instances>
    </group>
  );
}

function Cube({ ...props }) {
  const ref = useRef<any>();
  const tempColor = new THREE.Color();

  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      const angle =
        (props.position[0] + props.position[1] + props.position[2]) * 0.1 +
        time * 0.2;
      ref.current.rotation.x = angle;
      ref.current.rotation.y = angle;

      const dist = ref.current.position.distanceTo(new THREE.Vector3(0, 0, 0));
      const intensity = Math.max(0, 1 - dist / (GRID_SIZE / 2));
      
      // CORRECCIÓN: Modificamos la propiedad 'color' de la instancia
      ref.current.color.set(tempColor.copy(baseColor).multiplyScalar(intensity * 2));
    }
  });
  return <Instance ref={ref} {...props} />;
}
