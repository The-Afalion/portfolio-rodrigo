export const PROYECTOS_CORE = [
  {
    id: 'neural-vis',
    title: 'Neural Vis',
    description: 'Visualizador en tiempo real de los pesos y activaciones de una red neuronal profunda durante el entrenamiento.',
    tech: ['Python', 'TensorFlow', 'WebGL', 'React'],
    color: '#ff5e57', // Rojo neón
    position: [0, 0, 0] as [number, number, number],
  },
  {
    id: 'distributed-sim',
    title: 'Distri-Sim',
    description: 'Simulador de consenso Raft visualizando la elección de líderes y replicación de logs en un clúster distribuido.',
    tech: ['Go', 'gRPC', 'D3.js', 'Docker'],
    color: '#0be881', // Verde neón
    position: [5, 2, -5] as [number, number, number],
  },
  {
    id: 'quantum-crypto',
    title: 'Q-Crypto',
    description: 'Implementación demostrativa del protocolo BB84 de distribución de claves cuánticas.',
    tech: ['Rust', 'WASM', 'React', 'Canvas'],
    color: '#4bcffa', // Azul neón
    position: [-5, -2, -10] as [number, number, number],
  },
  {
    id: 'compiler-arch',
    title: 'Mini-Compiler',
    description: 'Un compilador completo para un subconjunto de C, con análisis léxico, sintáctico y generación de código ensamblador.',
    tech: ['C++', 'LLVM', 'Bison', 'Flex'],
    color: '#ffd32a', // Amarillo neón
    position: [3, -4, -15] as [number, number, number],
  }
];
