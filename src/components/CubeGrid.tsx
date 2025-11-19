"use client";
import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";

const GRID_SIZE = 10;
const BOX_SIZE = 0.5;

export default function CubeGrid() {
  const ref = useRef();

  useFrame(({ clock, mouse }) => {
    if (ref.current) {
      // Gira lentamente todo el grid
      ref.current.rotation.y = clock.getElapsedTime() * 0.05;
      ref.current.rotation.x = clock.getElapsedTime() * 0.05;

      // Mueve el grid en base a la posición del ratón
      ref.current.position.x = (mouse.x * GRID_SIZE) / 4;
      ref.current.position.y = (mouse.y * GRID_SIZE) / 4;
    }
  });

  return (
    <group ref={ref}>
      <Instances>
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
        <meshStandardMaterial emissive="#3B82F6" emissiveIntensity={0} />
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
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      // Animación individual de cada cubo
      const time = clock.getElapsedTime();
      const angle =
        (props.position[0] + props.position[1] + props.position[2]) * 0.1 +
        time * 0.2;
      ref.current.rotation.x = angle;
      ref.current.rotation.y = angle;

      // Iluminación basada en la proximidad al centro
      const dist = ref.current.position.distanceTo(new THREE.Vector3(0, 0, 0));
      ref.current.material.emissiveIntensity = Math.max(
        0,
        1 - dist / (GRID_SIZE / 2)
      );
    }
  });
  return <Instance ref={ref} {...props} />;
}
