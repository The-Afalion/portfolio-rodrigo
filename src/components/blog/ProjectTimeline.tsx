"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

interface TimelineNode {
  id: string;
  title: string;
  description?: string;
  type: 'core' | 'branch';
}

interface NodeData extends TimelineNode {
  position: THREE.Vector3;
  color: string;
}

export function ProjectTimeline({
  coreNode,
  branches
}: {
  coreNode: { title: string, description?: string },
  branches: { id: string, title: string, description?: string }[]
}) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = useMemo(() => {
    const data: NodeData[] = [];

    // Core Node (Center)
    data.push({
      id: 'core',
      title: coreNode.title,
      description: coreNode.description,
      type: 'core',
      position: new THREE.Vector3(0, 0, 0),
      color: '#3b82f6' // Blue-500
    });

    // Branch Nodes (Orbiting or distributed around)
    const radius = 5;
    branches.forEach((branch, index) => {
      const angle = (index / branches.length) * Math.PI * 2;
      data.push({
        id: branch.id,
        title: branch.title,
        description: branch.description,
        type: 'branch',
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 2, // Slight vertical variation
          Math.sin(angle) * radius
        ),
        color: '#60a5fa' // Blue-400
      });
    });

    return data;
  }, [coreNode, branches]);

  return (
    <div className="w-full h-[500px] bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-200 shadow-inner">
      <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
        <color attach="background" args={['#f8fafc']} />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#bae6fd" />

        {/* Lines connecting core to branches */}
        {branches.map((_, index) => {
          const branchPos = nodes[index + 1].position;
          return (
            <line key={`line-${index}`}>
              <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), branchPos]) as any} />
              <lineBasicMaterial attach="material" color="#cbd5e1" linewidth={2} transparent opacity={0.6} />
            </line>
          );
        })}

        {nodes.map((node) => (
          <TimelineSphere
            key={node.id}
            node={node}
            isHovered={hoveredNode === node.id}
            onHover={setHoveredNode}
          />
        ))}

        <OrbitControls enableZoom={true} enablePan={false} autoRotate={true} autoRotateSpeed={0.5} maxDistance={15} minDistance={5} />
      </Canvas>

      {/* Interactive Tooltip Overlay */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 p-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg max-w-xs transition-opacity duration-300 pointer-events-none">
          {nodes.map(n => n.id === hoveredNode && (
            <div key={n.id}>
              <h3 className="text-slate-800 font-serif font-bold text-lg mb-1">{n.title}</h3>
              {n.description && <p className="text-slate-600 text-sm leading-relaxed">{n.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineSphere({
  node,
  isHovered,
  onHover
}: {
  node: NodeData,
  isHovered: boolean,
  onHover: (id: string | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.1;

      // Gentle floating animation for branches
      if (node.type === 'branch') {
        meshRef.current.position.y = node.position.y + Math.sin(state.clock.elapsedTime + node.position.x) * 0.2;
      }
    }
  });

  const scale = node.type === 'core' ? (isHovered ? 1.4 : 1.2) : (isHovered ? 0.9 : 0.7);

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={(e) => { e.stopPropagation(); onHover(node.id); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { onHover(null); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={node.color}
          roughness={0.2}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={node.color}
          emissiveIntensity={isHovered ? 0.4 : 0.1}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* Outer Glow / Wireframe effect */}
      <mesh scale={scale * 1.05}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={node.color} wireframe transparent opacity={0.1} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, node.type === 'core' ? -2 : -1.2, 0]}
        fontSize={node.type === 'core' ? 0.4 : 0.25}
        color="#334155" // Slate-700
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {node.title}
      </Text>
    </group>
  );
}
