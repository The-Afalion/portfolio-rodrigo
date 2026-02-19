"use client";

import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { motion } from 'framer-motion';

function RotatingShape() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="hsl(var(--primary))" 
            roughness={0.1} 
            metalness={0.1} 
            wireframe
          />
        </mesh>
      </Float>
    </Canvas>
  );
}

export default function SobreMi() {
  return (
    <section id="sobre-mi" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Columna de Texto */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            De la Idea a la <span className="text-primary">Realidad Digital</span>
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Como Ingeniero de Software, mi objetivo es transformar ideas complejas en productos digitales eficientes y escalables. Me especializo en el desarrollo full-stack, con un fuerte enfoque en la arquitectura de software y la optimización del rendimiento.
            </p>
            <p>
              Mi experiencia abarca desde la creación de APIs robustas hasta el desarrollo de interfaces de usuario interactivas. Disfruto trabajando en proyectos que requieren un alto nivel de detalle técnico y un enfoque creativo para resolver problemas.
            </p>
          </div>
        </motion.div>

        {/* Columna Visual 3D */}
        <motion.div 
          className="h-80 md:h-96"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <RotatingShape />
        </motion.div>

      </div>
    </section>
  );
}
