"use client";
import { Capsule, Sphere, Box, Cylinder } from "@react-three/drei";

export default function KayakerModel() {
  return (
    <group>
      {/* Kayak */}
      <Capsule args={[1, 4, 8]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="red" />
      </Capsule>

      {/* Piragüista */}
      <group position={[0, 1.2, 0]}>
        {/* Torso */}
        <Cylinder args={[0.5, 0.5, 1.5, 16]}>
          <meshStandardMaterial color="blue" />
        </Cylinder>
        {/* Cabeza */}
        <Sphere args={[0.6]} position={[0, 1.3, 0]}>
          <meshStandardMaterial color="#F0D9B5" />
        </Sphere>
      </group>

      {/* Pala */}
      <group position={[0, 1, 0]} rotation={[0, 0, -0.3]}>
        {/* Mango */}
        <Cylinder args={[0.05, 0.05, 4, 8]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="black" />
        </Cylinder>
        {/* Hojas de la pala */}
        <Box args={[0.4, 0.05, 0.8]} position={[2, 0, 0]}>
          <meshStandardMaterial color="black" />
        </Box>
        <Box args={[0.4, 0.05, 0.8]} position={[-2, 0, 0]}>
          <meshStandardMaterial color="black" />
        </Box>
      </group>
    </group>
  );
}
