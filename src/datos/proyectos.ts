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
    description: 'Simulador visual de almacenamiento distribuido para entender sharding, réplicas y flujo de datos.',
    tech: ['Next.js', 'Framer Motion', 'Algorithms'],
    color: '#7dd3a7',
    position: [0, 0, -6] as [number, number, number],
    link: '/nexus',
    github: 'https://github.com/The-Afalion/portfolio-rodrigo',
    featured: true,
  },
  {
    id: 'slalom',
    title: 'Slalom Arch.',
    description: 'Editor CAD para trazar circuitos con precisión y un flujo de trabajo vectorial.',
    tech: ['SVG', 'React', 'Supabase'],
    color: '#76a9fa',
    position: [10, 4, -10] as [number, number, number],
    link: '/slalom',
    github: 'https://github.com/The-Afalion/portfolio-rodrigo',
    featured: true,
  },
  {
    id: 'chess-engine',
    title: 'Chess AI',
    description: 'Plataforma de ajedrez con lobby, bots y partidas coordinadas en tiempo real.',
    tech: ['QStash', 'Serverless', 'Chess.js'],
    color: '#f1c27d',
    position: [-11, -4, -12] as [number, number, number],
    link: '/chess',
    github: 'https://github.com/The-Afalion/portfolio-rodrigo',
    featured: true,
  },
  {
    id: 'galton',
    title: 'Galton Physics',
    description: 'Simulación del tablero de Galton para observar cómo emerge la distribución normal.',
    tech: ['Matter.js', 'Canvas API', 'Physics Engine'],
    color: '#f29c8f',
    position: [12, -6, 4] as [number, number, number],
    link: '/physics',
    featured: true,
  },
  {
    id: 'algo-vis',
    title: 'Algo Vision',
    description: 'Visualizador de algoritmos de ordenación con control directo sobre velocidad y tamaño.',
    tech: ['React', 'Algorithms', 'Visualization'],
    color: '#c7a6ff',
    position: [-13, 6, 3] as [number, number, number],
    link: '/algorithms',
    featured: true,
  },
  {
    id: 'sonic',
    title: 'Sonic Canvas',
    description: 'Lienzo audiovisual donde cada trazo modifica frecuencias y ritmo en directo.',
    tech: ['Web Audio API', 'Canvas', 'DSP'],
    color: '#79d8e8',
    position: [0, 11, -12] as [number, number, number],
    link: '/sonic',
    featured: true,
  },
  {
    id: 'urban',
    title: 'Urban Pulse',
    description: 'Escena 3D que convierte tráfico, energía y estado de red en una lectura urbana clara.',
    tech: ['Three.js', 'Data Viz', 'WebGL'],
    color: '#9e97ff',
    position: [0, -11, -12] as [number, number, number],
    link: '/urban'
  },
  {
    id: 'chrono-dasher',
    title: 'Chrono Dasher',
    description: 'Runner 3D rápido con niveles generados de forma procedural.',
    tech: ['R3F', 'Game Logic', 'WebGL'],
    color: '#f3b37a',
    position: [15, 0, -15] as [number, number, number],
    link: '/chrono-dasher'
  },
  {
    id: 'neural-racing',
    title: 'Neural Racing',
    description: 'Coches que aprenden a conducir mediante redes neuronales y evolución genética.',
    tech: ['TypeScript', 'Neuroevolution', 'Canvas'],
    color: '#81d4b0',
    position: [8, 10, -4] as [number, number, number],
    link: '/engineering/neural-racing'
  },
  {
    id: 'eco-engine',
    title: 'Ecosystem Engine',
    description: 'Simulación de vida artificial con cadenas tróficas y evolución de especies.',
    tech: ['TypeScript', 'Artificial Life', 'ProcGen'],
    color: '#b39ddb',
    position: [-8, -10, -2] as [number, number, number],
    link: '/engineering/ecosystem'
  },
  {
    id: 'neural-swarm',
    title: 'Neural Swarm',
    description: 'Enjambres que aprenden a resolver recorridos a partir de obstáculos dibujados.',
    tech: ['TypeScript', 'Genetic Algorithm', 'Raycasting'],
    color: '#e7cf82',
    position: [0, 8, 8] as [number, number, number],
    link: '/engineering/swarm'
  },
  {
    id: 'lumina-flow',
    title: 'Lumina Flow',
    description: 'Sistema generativo de partículas inspirado en flocking y comportamiento colectivo.',
    tech: ['Flocking Math', 'Canvas', 'Generative'],
    color: '#7db9e8',
    position: [-15, 2, 8] as [number, number, number],
    link: '/engineering/lumina'
  },
  {
    id: 'space-sandbox',
    title: 'Deep Space Sandbox',
    description: 'Sandbox espacial con vuelo libre, comercio y combate.',
    tech: ['R3F', 'Physics', 'RPG'],
    color: '#e5a6c6',
    position: [0, -10, 13] as [number, number, number],
    link: '/engineering/sandbox'
  },
  {
    id: 'aetheria',
    title: 'Aetheria Tactics',
    description: 'Juego táctico 4x4 centrado en posicionamiento, lectura de tablero y ritmo de turno.',
    tech: ['React', 'Framer Motion', 'Minimax AI'],
    color: '#d7b083',
    position: [12, 8, 12] as [number, number, number],
    link: '/engineering/aetheria'
  }
];

export const FEATURED_PROJECTS = PROYECTOS_CORE.filter((project) => project.featured);
