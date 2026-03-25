export type ElementType = 'FIRE' | 'ICE' | 'EARTH' | 'THUNDER' | 'WIND' | 'HOLY' | 'DARK' | 'NEUTRAL';
export type Ability = 'RANGED' | 'HEAL' | 'PIERCE' | 'NONE';

export type CardSide = {
  damage: number; // 0 a 9
  shield: number; // 0 a 9
  ability: Ability;
};

export interface CardDef {
  id: string;
  name: string;
  element: ElementType;
  top: CardSide;
  right: CardSide;
  bottom: CardSide;
  left: CardSide;
}

// Helper para crear lados limpios
const S = (damage: number, shield: number, ability: Ability = 'NONE'): CardSide => ({ damage, shield, ability });

// Base de Datos de Cartas Perfectamente Balanceadas (32 cartas en total)
export const AETHERIA_CARDS: CardDef[] = [
  // --- NEUTRALES (Equilibradas, sin debilidades) ---
  { id: 'n1', name: 'Guardia Real', element: 'NEUTRAL', top: S(3,5), right: S(2,4), bottom: S(1,6), left: S(2,4) },
  { id: 'n2', name: 'Arquero Élite', element: 'NEUTRAL', top: S(5,1,'RANGED'), right: S(4,1), bottom: S(2,2), left: S(4,1) },
  { id: 'n3', name: 'Caballero Pesado', element: 'NEUTRAL', top: S(6,3), right: S(4,4), bottom: S(2,6), left: S(4,4) },
  { id: 'n4', name: 'Escudero', element: 'NEUTRAL', top: S(1,3), right: S(1,7), bottom: S(1,3), left: S(1,7) },
  { id: 'n5', name: 'Ariete', element: 'NEUTRAL', top: S(8,2,'PIERCE'), right: S(1,2), bottom: S(1,5), left: S(1,2) },

  // --- FIRE (Altísimo Daño, Bajo Escudo) ---
  { id: 'f1', name: 'Piromante', element: 'FIRE', top: S(7,1), right: S(6,1), bottom: S(4,2), left: S(6,1) },
  { id: 'f2', name: 'Dragón Carmesí', element: 'FIRE', top: S(9,3), right: S(7,2), bottom: S(5,4), left: S(7,2) },
  { id: 'f3', name: 'Cañón de Asedio', element: 'FIRE', top: S(8,0,'RANGED'), right: S(0,2), bottom: S(0,4), left: S(0,2) },
  { id: 'f4', name: 'Espada Ardiente', element: 'FIRE', top: S(6,2,'PIERCE'), right: S(5,2), bottom: S(3,3), left: S(5,2) },
  { id: 'f5', name: 'Elemental de Fuego', element: 'FIRE', top: S(5,4), right: S(8,1), bottom: S(5,4), left: S(8,1) },

  // --- ICE (Control, Escudos Altos, Daño Moderado) ---
  { id: 'i1', name: 'Golem de Hielo', element: 'ICE', top: S(2,8), right: S(3,6), bottom: S(1,9), left: S(3,6) },
  { id: 'i2', name: 'Criomante', element: 'ICE', top: S(4,5), right: S(5,5), bottom: S(4,5), left: S(5,5) },
  { id: 'i3', name: 'Lanza Glacial', element: 'ICE', top: S(6,2,'PIERCE'), right: S(2,4), bottom: S(2,4), left: S(2,4) },
  { id: 'i4', name: 'Muro Densa', element: 'ICE', top: S(0,9), right: S(0,9), bottom: S(0,9), left: S(0,9) },
  { id: 'i5', name: 'Wyrm de Escarcha', element: 'ICE', top: S(7,6), right: S(4,7), bottom: S(5,5), left: S(4,7) },

  // --- EARTH (Defensa Pura y Curación) ---
  { id: 'e1', name: 'Druida Anciano', element: 'EARTH', top: S(2,5), right: S(0,6,'HEAL'), bottom: S(2,5), left: S(0,6,'HEAL') },
  { id: 'e2', name: 'Treant Gigante', element: 'EARTH', top: S(4,7), right: S(6,5), bottom: S(1,8), left: S(6,5) },
  { id: 'e3', name: 'Minero Enano', element: 'EARTH', top: S(5,4,'PIERCE'), right: S(3,5), bottom: S(2,6), left: S(3,5) },
  { id: 'e4', name: 'Raíces Espinosas', element: 'EARTH', top: S(3,5), right: S(3,5), bottom: S(3,5), left: S(3,5) },
  { id: 'e5', name: 'Titán de Roca', element: 'EARTH', top: S(8,8), right: S(5,6), bottom: S(4,8), left: S(5,6) },

  // --- THUNDER (Daño Perforante Rápido) ---
  { id: 't1', name: 'Jinete de Tormentas', element: 'THUNDER', top: S(8,1,'PIERCE'), right: S(5,2), bottom: S(3,3), left: S(5,2) },
  { id: 't2', name: 'Mago Eléctrico', element: 'THUNDER', top: S(6,2,'RANGED'), right: S(6,2,'RANGED'), bottom: S(2,2), left: S(2,2) },
  { id: 't3', name: 'Pájaro del Trueno', element: 'THUNDER', top: S(7,3), right: S(7,3), bottom: S(4,1), left: S(7,3) },
  { id: 't4', name: 'Pararrayos', element: 'THUNDER', top: S(0,7), right: S(4,4), bottom: S(0,7), left: S(4,4) },

  // --- WIND (Agilidad, Movimiento Direccional Irregular) ---
  { id: 'w1', name: 'Asesino Céfiro', element: 'WIND', top: S(8,0), right: S(7,1), bottom: S(2,3), left: S(9,0) },
  { id: 'w2', name: 'Águila Viento', element: 'WIND', top: S(5,3), right: S(5,3), bottom: S(5,3), left: S(5,3) },
  { id: 'w3', name: 'Francotirador', element: 'WIND', top: S(8,1,'RANGED'), right: S(1,2), bottom: S(1,2), left: S(1,2) },
  { id: 'w4', name: 'Bailarina', element: 'WIND', top: S(6,4), right: S(3,6), bottom: S(6,4), left: S(3,6) },

  // --- HOLY (Curación Extrema y Stats Balanceados) ---
  { id: 'h1', name: 'Paladín', element: 'HOLY', top: S(5,7), right: S(4,6), bottom: S(2,8), left: S(4,6) },
  { id: 'h2', name: 'Sacerdotisa', element: 'HOLY', top: S(0,4,'HEAL'), right: S(0,4,'HEAL'), bottom: S(0,4,'HEAL'), left: S(0,4,'HEAL') },
  { id: 'h3', name: 'Arcángel', element: 'HOLY', top: S(8,8), right: S(6,6), bottom: S(6,6), left: S(6,6) },

  // --- DARK (Destrucción Descomunal con Debilidades Terribles) ---
  { id: 'd1', name: 'Nigromante', element: 'DARK', top: S(8,2), right: S(9,1), bottom: S(0,0), left: S(9,1) },
  { id: 'd2', name: 'Caballero de la Muerte', element: 'DARK', top: S(9,5), right: S(8,3), bottom: S(2,2), left: S(8,3) },
  { id: 'd3', name: 'Deidad Abisal', element: 'DARK', top: S(9,9), right: S(1,2), bottom: S(1,2), left: S(1,2) }
];
