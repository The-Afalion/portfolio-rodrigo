"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Plane } from '@react-three/drei';
import { ChessPiece } from '@/components/ChessPiece';

export default function ChessScene() {
  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 60 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow />
      <Stars radius={200} depth={100} count={5000} factor={6} saturation={0} fade speed={1} />

      {/* Tablero de ajedrez como base */}
      <Plane args={[8, 8]} rotation-x={-Math.PI / 2} position={[0, -3, 0]} receiveShadow>
        <meshStandardMaterial color="#555" />
      </Plane>

      {/* Piezas de ajedrez flotando */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <ChessPiece piece="wK" position={[-2, 0, -1]} scale={0.8} castShadow />
      </Float>
      <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.2}>
        <ChessPiece piece="bQ" position={[2, 0.5, 0]} scale={0.8} castShadow />
      </Float>
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.5}>
        <ChessPiece piece="wR" position={[4, 1, -2]} scale={0.8} castShadow />
      </Float>
      <Float speed={1.6} rotationIntensity={0.7} floatIntensity={1.8}>
        <ChessPiece piece="bN" position={[-4, 0.2, 2]} scale={0.8} castShadow />
      </Float>
       <Float speed={2} rotationIntensity={0.8} floatIntensity={2}>
        <ChessPiece piece="wP" position={[0, -1, 3]} scale={0.8} castShadow />
      </Float>

      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
