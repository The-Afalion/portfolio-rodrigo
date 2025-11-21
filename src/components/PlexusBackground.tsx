"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MotionValue, useTransform } from "framer-motion";
import * as THREE from "three";

const particleCount = 500;
const lineDistanceThreshold = 0.2;

function Particles({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const mousePos = useRef(new THREE.Vector2(0, 0));

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      temp.push({ t, factor, speed, x, y, z });
    }
    return temp;
  }, []);

  const rotationY = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 2]);

  useFrame((state) => {
    mousePos.current.lerp(state.mouse, 0.05);

    particles.forEach((particle, i) => {
      let { t, factor, speed, x, y, z } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);

      tempObject.position.set(
        x + a * (factor / 10),
        y + b * (factor / 10),
        z + s * (factor / 10)
      );

      // Repulsión del ratón
      const distanceToMouse = tempObject.position.distanceTo(new THREE.Vector3(mousePos.current.x * 5, mousePos.current.y * 5, 0));
      if (distanceToMouse < 1.5) {
        const repulsion = (1.5 - distanceToMouse) * 0.1;
        tempObject.position.add(tempObject.position.clone().sub(new THREE.Vector3(mousePos.current.x * 5, mousePos.current.y * 5, 0)).normalize().multiplyScalar(repulsion));
      }

      tempObject.scale.set(s, s, s);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y = rotationY.get();
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[0.02, 32, 32]} />
      <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
    </instancedMesh>
  );
}

export default function PlexusBackground({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.1} />
        <Particles scrollYProgress={scrollYProgress} />
      </Canvas>
    </div>
  );
}
