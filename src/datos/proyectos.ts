import { Code2, Database, Layout } from "lucide-react";

export const DATOS_PROYECTOS = [
  {
    slug: "motor-de-ajedrez",
    titulo: "Motor de Ajedrez Neuronal",
    descripcionCorta: "Algoritmo de ajedrez con toma de decisiones basada en evaluación posicional, usando una variante de Dijkstra.",
    descripcionLarga: [
      "Este proyecto es una exploración de algoritmos de inteligencia artificial aplicados al ajedrez. En lugar de optar por un enfoque tradicional como Minimax, se implementó un agente que utiliza una variante del algoritmo de Dijkstra para encontrar el 'camino' de movimientos que lleva a la posición más favorable.",
      "La evaluación del tablero se basa en un sistema de puntuación material simple. La IA, jugando como las negras, busca minimizar esta puntuación, lo que la lleva a capturar piezas y evitar ser capturada. Los niveles de dificultad se implementan variando la profundidad de búsqueda del algoritmo, creando un comportamiento que es predecible pero no trivial."
    ],
    etiquetas: ["TypeScript", "Next.js", "React", "Chess.js", "Algoritmos"],
    enlace: "/ajedrez",
    github: "https://github.com/The-Afalion",
    destacado: true,
    icono: Code2,
    imagenes: [
      "/imagenes-proyectos/ajedrez-1.png",
      "/imagenes-proyectos/ajedrez-2.png",
    ]
  },
  {
    slug: "infraestructura-nube",
    titulo: "Infraestructura en la Nube",
    descripcionCorta: "Arquitectura sin servidor (serverless) desplegada en AWS usando Terraform y funciones Lambda.",
    descripcionLarga: [
      "Este proyecto define y despliega una arquitectura completa en Amazon Web Services (AWS) utilizando un enfoque de Infraestructura como Código (IaC) con Terraform.",
      "La solución incluye redes privadas virtuales (VPC), subredes, gateways de internet y funciones Lambda escritas en Python que se ejecutan en respuesta a eventos, como subidas a un bucket S3 o peticiones a una API Gateway. Este enfoque garantiza un entorno reproducible, escalable y rentable."
    ],
    etiquetas: ["AWS", "Terraform", "Python", "Serverless", "IaC"],
    enlace: "#",
    github: "#",
    destacado: false,
    icono: Database,
    imagenes: []
  },
  {
    slug: "portafolio-v2",
    titulo: "Portafolio v2",
    descripcionCorta: "Diseño de interfaz y experiencia de usuario con animaciones en Framer Motion, Three.js y Tailwind CSS.",
    descripcionLarga: [
      "El propio sitio web que estás viendo. Este proyecto es un escaparate de mis habilidades en el desarrollo front-end, con un fuerte enfoque en la experiencia de usuario, el rendimiento y la estética.",
      "Se ha construido desde cero con Next.js y TypeScript. Las animaciones se gestionan con Framer Motion, mientras que las escenas 3D interactivas utilizan @react-three/fiber. El diseño, completamente responsivo, se ha implementado con Tailwind CSS."
    ],
    etiquetas: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js"],
    enlace: "#",
    github: "#",
    destacado: false,
    icono: Layout,
    imagenes: []
  }
];
