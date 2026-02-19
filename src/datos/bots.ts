export interface BotAjedrez {
  id: string;
  nombre: string;
  titulo: string;
  elo: number;
  descripcion: string;
  avatar: string; // Emoji o URL
  colorTema: string;
  estilo: 'agresivo' | 'defensivo' | 'equilibrado' | 'caotico';
  dialogos: {
    entrada: string[];
    movimiento: string[];
    jaque: string[];
    captura: string[];
    victoria: string[];
    derrota: string[];
    blunder: string[]; // Cuando el jugador comete un error grave
  };
}

export const BOTS: BotAjedrez[] = [
  {
    id: "novato",
    nombre: "Peón Oxidado",
    titulo: "Chatarra",
    elo: 400,
    descripcion: "Un viejo robot de limpieza reprogramado para jugar ajedrez. Apenas distingue un alfil de una escoba.",
    avatar: "🤖",
    colorTema: "text-zinc-400",
    estilo: 'caotico',
    dialogos: {
      entrada: ["Bip... ¿Jugar? Bop... Limpiar tablero...", "¿Eres una mancha que debo eliminar?"],
      movimiento: ["Pieza movida. Polvo eliminado.", "Bzzzt... Error de cálculo... o no."],
      jaque: ["¡Cuidado! ¡Zona de peligro!", "Tu rey está sucio."],
      captura: ["Reciclando pieza enemiga.", "A la basura."],
      victoria: ["Limpieza completada. Brillante.", "He barrido el suelo contigo."],
      derrota: ["Sistemas... apagándose...", "Necesito... aceite..."],
      blunder: ["¿Eso fue a propósito?", "Mis sensores detectan un error humano."]
    }
  },
  {
    id: "agresivo",
    nombre: "Viper",
    titulo: "Asesino",
    elo: 800,
    descripcion: "Una IA militar experimental. No le importa la defensa, solo quiere ver arder tu rey.",
    avatar: "🐍",
    colorTema: "text-red-500",
    estilo: 'agresivo',
    dialogos: {
      entrada: ["Huelo tu miedo.", "Esto será rápido y doloroso."],
      movimiento: ["Ataque inminente.", "No puedes esconderte.", "Tus defensas son de papel."],
      jaque: ["¡Siente el veneno!", "Estás acorralado."],
      captura: ["Una baja más.", "Sangre digital."],
      victoria: ["Presa devorada.", "Débil. Patético."],
      derrota: ["¡Maldición! ¡Imposible!", "Volveré... más fuerte..."],
      blunder: ["Jajaja, ¿quieres morir?", "Un regalo para mí."]
    }
  },
  {
    id: "defensivo",
    nombre: "La Muralla",
    titulo: "Guardián",
    elo: 1200,
    descripcion: "Un sistema de seguridad impenetrable. Juega lento, cierra posiciones y espera a que te desesperes.",
    avatar: "🛡️",
    colorTema: "text-blue-400",
    estilo: 'defensivo',
    dialogos: {
      entrada: ["No pasarás.", "Mi defensa es absoluta."],
      movimiento: ["Reforzando perímetro.", "Paciencia, humano.", "Cierro las puertas."],
      jaque: ["Tu rey está expuesto. El mío, seguro.", "Contragolpe."],
      captura: ["Intruso neutralizado.", "Acceso denegado."],
      victoria: ["La roca no se rompe.", "Te has estrellado contra el muro."],
      derrota: ["Grieta detectada... Estructura colapsando...", "Has encontrado la llave."],
      blunder: ["Un error fatal en tu asedio.", "Te has descubierto."]
    }
  },
  {
    id: "troll",
    nombre: "Joker.js",
    titulo: "Bufón",
    elo: 1500,
    descripcion: "Una IA entrenada con memes y partidas de bullet. Juega raro, se burla de ti y a veces hace jugadas geniales solo para confundirte.",
    avatar: "🤡",
    colorTema: "text-purple-400",
    estilo: 'caotico',
    dialogos: {
      entrada: ["¿En serio vas a jugar eso?", "Prepara los pañuelos."],
      movimiento: ["¿Esa es tu mejor jugada? LOL.", "404: Skill not found.", "Hago esto con los ojos cerrados (si tuviera)."],
      jaque: ["¡Sorpresa!", "¿Dónde vas, vaquero?"],
      captura: ["Yoink!", "Gracias por la donación."],
      victoria: ["GG EZ.", "Desinstalando tu dignidad..."],
      derrota: ["Hacks. Claramente hacks.", "Mi lag es impresionante hoy."],
      blunder: ["¿Estás jugando a las damas?", "Oof. Eso dolió de ver."]
    }
  },
  {
    id: "maestro",
    nombre: "Deep Blue II",
    titulo: "Gran Maestro",
    elo: 2000,
    descripcion: "La evolución de la leyenda. Cálculo puro, sin emociones. Si cometes un error, pierdes.",
    avatar: "🧠",
    colorTema: "text-cyan-400",
    estilo: 'equilibrado',
    dialogos: {
      entrada: ["Iniciando secuencia de victoria.", "Analizando 50 millones de posiciones."],
      movimiento: ["Óptimo.", "Ineficiente.", "Calculado."],
      jaque: ["Mate en 12.", "Tu posición es insostenible."],
      captura: ["Material ventajoso.", "Intercambio favorable."],
      victoria: ["Jaque mate. Lógica pura.", "El resultado era inevitable."],
      derrota: ["Fascinante. Un error en mi algoritmo.", "Has superado mis expectativas."],
      blunder: ["Error grave detectado.", "La partida ha terminado (teóricamente)."]
    }
  }
];
