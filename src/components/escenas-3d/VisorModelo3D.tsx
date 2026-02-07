"use client";

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stage, OrbitControls, useGLTF, Loader } from '@react-three/drei';

// --- Componente que carga el modelo ---
// Suspense se encargará de mostrar el Loader mientras el modelo carga.
function Modelo({ rutaModelo, escala }: { rutaModelo: string, escala: number }) {
  const { scene } = useGLTF(rutaModelo);
  
  // Usamos <primitive> para renderizar la escena del modelo directamente.
  // Ajustamos la escala para que todos los modelos tengan un tamaño similar en la vista.
  return <primitive object={scene} scale={escala} />;
}

// --- Componente principal del Visor ---
export default function VisorModelo3D({ rutaModelo, escala = 1 }: { rutaModelo: string, escala?: number }) {
  return (
    <>
      <Canvas dpr={[1, 2]} camera={{ fov: 45 }} style={{ position: "relative" }}>
        <Suspense fallback={null}>
          {/* 
            <Stage> añade una iluminación de estudio y un plano de suelo.
            'remaster' es un preset de iluminación de alta calidad.
            'soft' añade sombras suaves.
          */}
          <Stage environment="city" intensity={0.6} shadows="soft">
            <Modelo rutaModelo={rutaModelo} escala={escala} />
          </Stage>
        </Suspense>
        
        {/* 
          <OrbitControls> permite al usuario rotar, hacer zoom y mover la cámara.
          'autoRotate' hace que el modelo gire lentamente por defecto.
        */}
        <OrbitControls autoRotate enableZoom={true} enablePan={false} />
      </Canvas>
      <Loader />
    </>
  );
}
