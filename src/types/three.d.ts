import { MaterialNode } from '@react-three/fiber';
import * as THREE from 'three';

// Definimos las propiedades de nuestro shader
interface VortexMaterialProps {
  uTime?: number;
  uMouse?: THREE.Vector2;
  uColor?: THREE.Color;
  uFrequency?: number;
  uAmplitude?: number;
}

// Aumentamos los tipos de @react-three/fiber para que reconozca nuestro material
declare module '@react-three/fiber' {
  interface ThreeElements {
    vortexMaterial: MaterialNode<THREE.ShaderMaterial & VortexMaterialProps, typeof THREE.ShaderMaterial>;
  }
}
