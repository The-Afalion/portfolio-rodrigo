"use client";
import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere } from "@react-three/drei";
import { Mesh } from "three";

const WobbleSphere = () => {
  const ref = useRef<Mesh>(null);
  const { viewport } = useThree();
  const factor = 1 + viewport.width / 4;

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += 0.001;
      ref.current.rotation.y += 0.002;
      ref.current.position.x =
        Math.sin(state.clock.getElapsedTime()) * (factor / 2);
    }
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]} scale={factor}>
      <MeshDistortMaterial
        color="#8A2BE2"
        distort={0.5}
        speed={2}
        roughness={0.2}
      />
    </Sphere>
  );
};

export default WobbleSphere;
