export type SideType = 'ATTACK' | 'SHIELD' | 'HEAL' | 'RANGED' | 'NONE';

export type CardSide = {
  type: SideType;
  value: number;
};

export type CardRarity = 'NORMAL' | 'RARE' | 'PALADIN';

export interface CardDef {
  id: string;
  name: string;
  rarity: CardRarity;
  health: number; // Max 10
  top: CardSide;
  right: CardSide;
  bottom: CardSide;
  left: CardSide;
}

// Helpers para legibilidad
const A = (value: number): CardSide => ({ type: 'ATTACK', value });
const D = (value: number): CardSide => ({ type: 'SHIELD', value });
const H = (value: number): CardSide => ({ type: 'HEAL', value });
const R = (value: number): CardSide => ({ type: 'RANGED', value });
const N = (): CardSide => ({ type: 'NONE', value: 0 });

// --- NORMALES (MAX 6 PUNTOS COMBINADOS) ---
export const NORMALS: CardDef[] = [
  // Puro Tanque
  { id: 'n1', name: 'Muro', rarity: 'NORMAL', health: 6, top: N(), right: N(), bottom: N(), left: N() },
  { id: 'n2', name: 'Escudero', rarity: 'NORMAL', health: 2, top: D(1), right: D(1), bottom: D(1), left: D(1) },
  // Agresivos (Cañon de Cristal)
  { id: 'n3', name: 'Milicia', rarity: 'NORMAL', health: 3, top: A(2), right: N(), bottom: N(), left: A(1) },
  { id: 'n4', name: 'Lanza Corta', rarity: 'NORMAL', health: 2, top: A(3), right: N(), bottom: N(), left: N() },
  { id: 'n5', name: 'Guarda', rarity: 'NORMAL', health: 4, top: D(2), right: N(), bottom: N(), left: N() },
  { id: 'n6', name: 'Médico', rarity: 'NORMAL', health: 4, top: H(2), right: N(), bottom: N(), left: N() },
  { id: 'n7', name: 'Rastreador', rarity: 'NORMAL', health: 3, top: R(3), right: N(), bottom: N(), left: N() },
  { id: 'n8', name: 'Campesino', rarity: 'NORMAL', health: 5, top: A(1), right: N(), bottom: N(), left: N() }
];

// --- RARAS (MAX 10 PUNTOS COMBINADOS) ---
export const RARES: CardDef[] = [
  { id: 'r1', name: 'Caballero', rarity: 'RARE', health: 5, top: A(2), right: D(1), bottom: N(), left: D(2) },
  { id: 'r2', name: 'Asesino', rarity: 'RARE', health: 3, top: A(4), right: A(3), bottom: N(), left: N() },
  { id: 'r3', name: 'Francotirador', rarity: 'RARE', health: 4, top: R(4), right: N(), bottom: N(), left: A(2) },
  { id: 'r4', name: 'Clérigo', rarity: 'RARE', health: 6, top: H(2), right: H(2), bottom: N(), left: N() },
  { id: 'r5', name: 'Golem', rarity: 'RARE', health: 6, top: D(2), right: D(2), bottom: N(), left: N() },
  { id: 'r6', name: 'Berserker', rarity: 'RARE', health: 5, top: A(3), right: A(1), bottom: N(), left: A(1) }
];

// --- PALADINES (MAX 15 PUNTOS COMBINADOS) ---
export const PALADINS: CardDef[] = [
  { id: 'p1', name: 'Dragón', rarity: 'PALADIN', health: 7, top: A(4), right: A(2), bottom: N(), left: A(2) },
  { id: 'p2', name: 'Arcángel', rarity: 'PALADIN', health: 8, top: H(3), right: D(2), bottom: N(), left: D(2) },
  { id: 'p3', name: 'Titán', rarity: 'PALADIN', health: 10, top: D(2), right: D(2), bottom: N(), left: A(1) },
  { id: 'p4', name: 'Señor Oscuro', rarity: 'PALADIN', health: 6, top: A(5), right: R(2), bottom: N(), left: R(2) }
];
