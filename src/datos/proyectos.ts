export const PROYECTOS_CORE = [
  {
    id: 'nexus',
    title: 'NEXUS',
    description: 'Simulador de Sistema de Archivos Distribuido. Visualización en tiempo real de sharding, encriptación y distribución de datos entre nodos.',
    tech: ['Next.js', 'Framer Motion', 'Algorithms', 'Sharding'],
    color: '#4ade80', // Verde Matrix
    position: [0, 0, 0] as [number, number, number],
    link: '/nexus'
  },
  {
    id: 'slalom',
    title: 'Slalom Arch.',
    description: 'Herramienta CAD para diseño de circuitos olímpicos. Editor vectorial interactivo con gestión de estado compleja y persistencia de datos.',
    tech: ['SVG', 'React', 'Supabase', 'PostgreSQL'],
    color: '#3b82f6', // Azul Agua
    position: [5, 2, -5] as [number, number, number],
    link: '/slalom'
  },
  {
    id: 'chess-engine',
    title: 'Chess AI',
    description: 'Motor de ajedrez con personalidades múltiples basado en Stockfish/Lichess API. Arquitectura serverless con colas de mensajes.',
    tech: ['QStash', 'Serverless', 'Chess.js', 'API Integration'],
    color: '#f59e0b', // Dorado
    position: [-5, -2, -10] as [number, number, number],
    link: '/chess' // Enlazamos al Hub
  },
  {
    id: 'portfolio',
    title: 'Este Portfolio',
    description: 'Meta-proyecto. Una experiencia inmersiva construida con las últimas tecnologías web, integrando 3D, tiempo real y diseño avanzado.',
    tech: ['R3F', 'Three.js', 'TypeScript', 'Vercel'],
    color: '#a855f7', // Púrpura
    position: [3, -4, -15] as [number, number, number],
    link: '/'
  }
];
