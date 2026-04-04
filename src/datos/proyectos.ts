export type ProyectoCore = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  color: string;
  position: [number, number, number];
  link: string;
  github?: string;
  featured?: boolean;
};

export const PROYECTOS_CORE: ProyectoCore[] = [
  {
    id: 'nexus',
    title: 'NEXUS',
    description: 'Simulador de Sistema de Archivos Distribuido. Visualización en tiempo real de sharding y distribución de datos.',
    tech: ['Next.js', 'Framer Motion', 'Algorithms'],
    color: '#4ade80', // Verde Matrix
    position: [0, 0, 0] as [number, number, number],
    link: '/nexus',
    github: 'https://github.com/The-Afalion/portfolio-rodrigo',
    featured: true,
  },
  {
    id: 'slalom',
    title: 'Slalom Arch.',
    description: 'Herramienta CAD para diseño de circuitos. Editor vectorial interactivo con gestión de estado compleja.',
    tech: ['SVG', 'React', 'Supabase'],
    color: '#3b82f6', // Azul Agua
    position: [5, 2, -5] as [number, number, number],
    link: '/slalom',
    github: 'https://github.com/The-Afalion/portfolio-rodrigo',
    featured: true,
  },
  {
    id: 'chess-engine',
    title: 'Chess AI',
    description: 'Motor de ajedrez serverless con personalidades múltiples y torneos en tiempo real.',
    tech: ['QStash', 'Serverless', 'Chess.js'],
    color: '#f59e0b', // Dorado
    position: [-5, -2, -10] as [number, number, number],
    link: '/chess',
    github: 'https://github.com/The-Afalion/portfolio-rodrigo',
    featured: true,
  },
  {
    id: 'galton',
    title: 'Galton Physics',
    description: 'Simulación de físicas demostrando el Teorema del Límite Central con miles de colisiones.',
    tech: ['Matter.js', 'Canvas API', 'Physics Engine'],
    color: '#ef4444', // Rojo
    position: [6, -4, 5] as [number, number, number],
    link: '/physics',
    featured: true,
  },
  {
    id: 'algo-vis',
    title: 'Algo Vision',
    description: 'Visualizador interactivo de algoritmos de ordenamiento. Observa la lógica interna del código en acción.',
    tech: ['React', 'Algorithms', 'Visualization'],
    color: '#d946ef', // Magenta
    position: [-6, 4, 5] as [number, number, number],
    link: '/algorithms',
    featured: true,
  },
  {
    id: 'sonic',
    title: 'Sonic Canvas',
    description: 'Sintetizador visual experimental. Dibuja en el lienzo para generar frecuencias de audio en tiempo real.',
    tech: ['Web Audio API', 'Canvas', 'DSP'],
    color: '#06b6d4', // Cyan
    position: [0, 6, -8] as [number, number, number],
    link: '/sonic',
    featured: true,
  },
  {
    id: 'urban',
    title: 'Urban Pulse',
    description: 'Gemelo digital de una ciudad visualizando datos masivos de tráfico y energía en un entorno 3D.',
    tech: ['Three.js', 'Data Viz', 'WebGL'],
    color: '#8b5cf6', // Violeta
    position: [0, -6, -8] as [number, number, number],
    link: '/urban'
  },
  {
    id: 'chrono-dasher',
    title: 'Chrono Dasher',
    description: 'Endless runner 3D con generación procedural de niveles y efectos de post-procesado.',
    tech: ['R3F', 'Game Logic', 'WebGL'],
    color: '#f97316', // Naranja Neón
    position: [8, 0, -12] as [number, number, number],
    link: '/chrono-dasher'
  },
  {
    id: 'neural-racing',
    title: 'Neural Racing',
    description: 'Vehículos evolucionan sus Redes Neuronales mediante Algoritmos Genéticos en el cliente.',
    tech: ['TypeScript', 'Neuroevolution', 'Canvas'],
    color: '#10b981', // Verde IA
    position: [4, 4, -5] as [number, number, number],
    link: '/engineering/neural-racing'
  },
  {
    id: 'eco-engine',
    title: 'Ecosystem Engine',
    description: 'Sandbox de Vida Artificial evolutivo. Presas, depredadores y especiación algorítmica.',
    tech: ['TypeScript', 'Artificial Life', 'ProcGen'],
    color: '#8b5cf6', // Violeta evolutivo
    position: [-4, -4, -2] as [number, number, number],
    link: '/engineering/ecosystem'
  },
  {
    id: 'neural-swarm',
    title: 'Neural Swarm',
    description: 'Sandbox interactivo. Dibuja laberintos y observa a enjambres neuronales evolucionar para resolverlos.',
    tech: ['TypeScript', 'Genetic Algorithm', 'Raycasting'],
    color: '#fbbf24', // Amber/Yellow
    position: [0, 3, 4] as [number, number, number],
    link: '/engineering/swarm'
  },
  {
    id: 'lumina-flow',
    title: 'Lumina Flow',
    description: 'Boids interactivos y arte generativo. Relájate observando bancos de luz orgánicos.',
    tech: ['Flocking Math', 'Canvas', 'Generative'],
    color: '#0ea5e9', // Ocean Blue
    position: [-8, 2, 2] as [number, number, number],
    link: '/engineering/lumina'
  },
  {
    id: 'space-sandbox',
    title: 'Deep Space Sandbox',
    description: 'Vuelo 6DOF, comercio, recolección de plasma y combate espacial.',
    tech: ['R3F', 'Physics', 'RPG'],
    color: '#ec4899', // Pink
    position: [0, -5, 12] as [number, number, number],
    link: '/engineering/sandbox'
  },
  {
    id: 'aetheria',
    title: 'Aetheria Tactics',
    description: 'Elegante juego de cartas 4x4. Domina batallas posicionales contra rivales y la IA.',
    tech: ['React', 'Framer Motion', 'Minimax AI'],
    color: '#d97706', // Wood/Gold
    position: [6, 4, 10] as [number, number, number],
    link: '/engineering/aetheria'
  }
];

export const FEATURED_PROJECTS = PROYECTOS_CORE.filter((project) => project.featured);
