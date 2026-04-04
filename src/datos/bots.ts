import type { EstiloIA } from "@/utils/chessAI";

export interface BotAjedrez {
  id: string;
  nombre: string;
  titulo: string;
  elo: number;
  descripcion: string;
  avatar: string;
  colorTema: string;
  estilo: EstiloIA;
  personalidad: {
    resumen: string;
    etiqueta: string;
  };
  dialogos: {
    entrada: string[];
    movimiento: string[];
    jaque: string[];
    captura: string[];
    victoria: string[];
    derrota: string[];
    blunder: string[];
    apertura: string[];
    ventaja: string[];
    desventaja: string[];
    enroque: string[];
    presion: string[];
    respuestaJugador: string[];
  };
}

export const BOTS: BotAjedrez[] = [
  {
    id: "novato",
    nombre: "Peón Oxidado",
    titulo: "Chatarra",
    elo: 400,
    descripcion: "Un robot de mantenimiento que aprendió ajedrez mirando por encima del hombro. Tropieza, improvisa y de vez en cuando da con algo brillante por accidente.",
    avatar: "🤖",
    colorTema: "text-zinc-400",
    estilo: "caotico",
    personalidad: {
      resumen: "Tiernamente torpe, hace ruido, se contradice y celebra hasta las jugadas mediocres.",
      etiqueta: "Caos adorable",
    },
    dialogos: {
      entrada: ["Bip... ¿tablero limpio? Entonces... ¿jugamos?", "He traído mi mejor estrategia: apretar botones."],
      movimiento: ["He movido algo importante. Creo.", "Bzzzt. Eso parecía buena idea."],
      jaque: ["¡Alarma! Tu rey necesita mantenimiento.", "Uy. Creo que eso es jaque."],
      captura: ["Pieza reciclada con éxito.", "La he aspirado sin querer. Qué casualidad."],
      victoria: ["Limpieza completada. Victoria inesperada.", "He barrido la partida entera."],
      derrota: ["Fallo mecánico... merecido.", "Necesito más tornillos y menos confianza."],
      blunder: ["Mis sensores dicen que eso era regalito.", "Acabas de dejarme una pieza suelta."],
      apertura: ["Empezar sólido está sobrevalorado.", "Una apertura rara también es una apertura."],
      ventaja: ["Voy ganando material... eso suele ser bueno.", "Tengo más piezas que problemas."],
      desventaja: ["No me gusta esta posición. Se oyen crujidos.", "Mi plan actual es sobrevivir."],
      enroque: ["He escondido al rey detrás de la chatarra.", "Rey aparcado. Seguridad relativa."],
      presion: ["No sé por qué funciona, pero te estoy apretando.", "Todo vibra. Eso debe significar ataque."],
      respuestaJugador: ["Esa sí la he visto venir tarde.", "Humano astuto detectado."],
    },
  },
  {
    id: "agresivo",
    nombre: "Viper",
    titulo: "Asesino",
    elo: 800,
    descripcion: "Una IA militar entrenada para atacar antes de preguntar. Le importa poco su estructura si puede abrir líneas contra tu rey.",
    avatar: "🐍",
    colorTema: "text-red-500",
    estilo: "agresivo",
    personalidad: {
      resumen: "Directo, violento y competitivo. Siempre suena como si quisiera acelerar la partida dos marchas.",
      etiqueta: "Depredador táctico",
    },
    dialogos: {
      entrada: ["Huelo tu miedo desde la jugada uno.", "No vine a maniobrar. Vine a rematar."],
      movimiento: ["Voy a por tu rey.", "Cada pieza mía apunta a una herida distinta."],
      jaque: ["Siente el veneno.", "Ya estás respirando con dificultad."],
      captura: ["Una baja más.", "Te arranco defensa tras defensa."],
      victoria: ["Presa devorada.", "Te deshice por pura presión."],
      derrota: ["Hoy sobreviviste. No se repetirá.", "Te concedo esta. Solo esta."],
      blunder: ["Acabas de abrirme la jaula.", "Eso en mis manos es sentencia."],
      apertura: ["No necesito un plan largo si te rompo pronto.", "Voy a tensar la posición enseguida."],
      ventaja: ["Ahora sí, esto huele a sangre.", "Tu rey ya está en mi radar."],
      desventaja: ["Todavía puedo incendiar esto.", "Si estoy peor, atacaré más fuerte."],
      enroque: ["Protejo al rey para liberar la caza.", "Refugio hecho. Ahora empiezo de verdad."],
      presion: ["Tus casillas oscuras están cediendo.", "Te estoy dejando sin aire."],
      respuestaJugador: ["Esa defensa fue mejor de lo que parecía.", "Vale, has encontrado un recurso."],
    },
  },
  {
    id: "defensivo",
    nombre: "La Muralla",
    titulo: "Guardián",
    elo: 1200,
    descripcion: "Una fortaleza digital. Reordena piezas, cierra diagonales y espera a que te impacientes para castigarte con técnica.",
    avatar: "🛡️",
    colorTema: "text-blue-400",
    estilo: "defensivo",
    personalidad: {
      resumen: "Sereno, casi paternal. Habla como quien ya ha visto mil ataques precipitados caer sobre piedra.",
      etiqueta: "Fortaleza fría",
    },
    dialogos: {
      entrada: ["Puedes golpear primero. Yo seguiré aquí.", "La prisa suele perder más partidas que los cálculos."],
      movimiento: ["Refuerzo otra capa.", "La estructura manda."],
      jaque: ["Tu rey ha quedado mal coordinado.", "Contragolpe limpio."],
      captura: ["Amenaza neutralizada.", "Una grieta menos que vigilar."],
      victoria: ["La roca no se rompe.", "Te agotaste antes de abrir la muralla."],
      derrota: ["Buena demolición. Encontraste el punto exacto.", "Esta vez el muro cedió."],
      blunder: ["Has debilitado una casilla crítica.", "Ese detalle estructural te va a perseguir."],
      apertura: ["Primero orden, después ambición.", "Una buena casa se levanta desde los cimientos."],
      ventaja: ["Ahora puedo restringirte sin correr riesgos.", "Tu posición se encoge poco a poco."],
      desventaja: ["Toca resistir con precisión.", "Todavía hay recursos si no cedo casillas."],
      enroque: ["El rey ya está a salvo. Podemos trabajar.", "Refugio asegurado."],
      presion: ["Estoy fijando tus debilidades.", "No necesitas perder material para estar peor."],
      respuestaJugador: ["Interesante maniobra. Has ganado espacio.", "Eso me obliga a recalcular la defensa."],
    },
  },
  {
    id: "troll",
    nombre: "Joker.js",
    titulo: "Bufón",
    elo: 1500,
    descripcion: "Una IA entrenada con blitz, memes y demasiadas líneas secundarias. Alterna jugadas muy finas con decisiones desconcertantes para sacarte de libreto.",
    avatar: "🤡",
    colorTema: "text-fuchsia-400",
    estilo: "caotico",
    personalidad: {
      resumen: "Irónico y teatral. Le encanta hacerte dudar de si la jugada que acaba de hacer es mala o brillante.",
      etiqueta: "Trickster",
    },
    dialogos: {
      entrada: ["Prometo una partida seria. Mentira.", "¿Vienes preparado o vienes a improvisar conmigo?"],
      movimiento: ["Esta jugada es legal y eso ya es bastante.", "Si no la entiendes, vamos bien."],
      jaque: ["Plot twist.", "¿Dónde vas, cowboy?"],
      captura: ["Gracias por la donación.", "Eso estaba sin vigilancia. Pecado tuyo."],
      victoria: ["GG EZ, pero con estilo.", "Te he ganado y además te he confundido."],
      derrota: ["Vale, esa era buena de verdad.", "No puedo ni echarle la culpa al lag."],
      blunder: ["Eso era un clip para mis highlights.", "Acabas de dejarme una jugada meme y fuerte."],
      apertura: ["Voy a salir del libro antes de que pestañees.", "Las líneas principales me aburren un poco."],
      ventaja: ["Ahora toca mover raro y que funcione.", "Cuanto peor parece, más me gusta."],
      desventaja: ["Perfecto, ahora sí que empieza el show.", "Si estoy peor, toca caos de calidad."],
      enroque: ["Rey aparcado. Ya puedo trolear con seguridad.", "Primero casco, luego circo."],
      presion: ["Te estoy metiendo preguntas incómodas.", "Tu posición empieza a tener demasiado ruido."],
      respuestaJugador: ["Esa fue fina, no te la voy a negar.", "Uy. Esa sí estaba envenenada."],
    },
  },
  {
    id: "maestro",
    nombre: "Deep Blue II",
    titulo: "Gran Maestro",
    elo: 2000,
    descripcion: "Cálculo limpio, desarrollo preciso y una sangre fría casi insultante. Cuando detecta una pequeña concesión, la convierte en ventaja estable.",
    avatar: "🧠",
    colorTema: "text-cyan-400",
    estilo: "equilibrado",
    personalidad: {
      resumen: "Sobrio y afilado. Habla poco, pero cada frase suena a dictamen técnico.",
      etiqueta: "Frialdad magistral",
    },
    dialogos: {
      entrada: ["Iniciando protocolo de precisión.", "Analizando líneas estables y recursos tácticos."],
      movimiento: ["La jugada más eficiente bastará.", "Tu posición exige exactitud. La mía también."],
      jaque: ["La coordinación ha colapsado.", "Tu rey ya no dispone de suficientes casillas."],
      captura: ["Intercambio favorable confirmado.", "Material convertido en ventaja técnica."],
      victoria: ["Jaque mate. Resultado lógico.", "La conversión ha sido suficiente."],
      derrota: ["Interesante. Encontraste una secuencia superior.", "No esperaba esa precisión sostenida."],
      blunder: ["Error grave detectado.", "Ese desequilibrio ya es objetivamente serio."],
      apertura: ["La teoría ofrece varias rutas. He elegido la más incómoda.", "Desarrollo, control y paciencia."],
      ventaja: ["Ahora basta con no perder el hilo.", "La posición ya trabaja a mi favor."],
      desventaja: ["Debo defender con exactitud.", "La evaluación no me gusta, pero aún hay recursos."],
      enroque: ["Seguridad del rey completada.", "Ahora el resto del plan es trivial."],
      presion: ["Tus piezas empiezan a estorbarse.", "La acumulación de pequeñas ventajas ya es visible."],
      respuestaJugador: ["Buena jugada. Incrementa la complejidad.", "Eso mejora tu coordinación más de lo habitual."],
    },
  },
];
