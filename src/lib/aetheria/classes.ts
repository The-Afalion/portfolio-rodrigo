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

// --- NORMALES (MAX 6 PUNTOS COMBINADOS - Hp/2 + stats = 6) ---
// Distribución balanceada de estadísticas en diferentes direcciones para fomentar la estrategia.
export const NORMALS: CardDef[] = [
  { id: 'n1', name: 'Muro', rarity: 'NORMAL', health: 8, top: D(1), right: D(1), bottom: D(1), left: D(1) },
  { id: 'n2', name: 'Escudero', rarity: 'NORMAL', health: 4, top: A(1), right: D(1), bottom: N(), left: D(2) },
  { id: 'n3', name: 'Milicia', rarity: 'NORMAL', health: 4, top: A(1), right: A(1), bottom: A(1), left: A(1) },
  { id: 'n4', name: 'Lancero', rarity: 'NORMAL', health: 2, top: A(3), right: N(), bottom: A(2), left: N() },
  { id: 'n5', name: 'Centinela', rarity: 'NORMAL', health: 4, top: D(2), right: N(), bottom: A(2), left: N() },
  { id: 'n6', name: 'Aprendiz', rarity: 'NORMAL', health: 2, top: H(2), right: H(1), bottom: H(2), left: H(1) },
  { id: 'n7', name: 'Arquero', rarity: 'NORMAL', health: 2, top: R(2), right: R(1), bottom: N(), left: R(2) },
  { id: 'n8', name: 'Campesino', rarity: 'NORMAL', health: 6, top: A(1), right: H(1), bottom: N(), left: D(1) }
];

// --- RARAS (MAX 10 PUNTOS COMBINADOS - Hp/2 + stats = 10) ---
export const RARES: CardDef[] = [
  { id: 'r1', name: 'Caballero', rarity: 'RARE', health: 6, top: A(2), right: D(2), bottom: A(1), left: D(2) },
  { id: 'r2', name: 'Asesino', rarity: 'RARE', health: 4, top: A(3), right: A(2), bottom: A(1), left: A(2) },
  { id: 'r3', name: 'Cazador', rarity: 'RARE', health: 4, top: R(3), right: A(1), bottom: R(2), left: A(2) },
  { id: 'r4', name: 'Sacerdote', rarity: 'RARE', health: 6, top: H(2), right: D(1), bottom: H(3), left: D(1) },
  { id: 'r5', name: 'Gólem', rarity: 'RARE', health: 10, top: D(2), right: D(2), bottom: D(1), left: D(2) },
  { id: 'r6', name: 'Bárbaro', rarity: 'RARE', health: 6, top: A(3), right: A(2), bottom: N(), left: A(2) }
];

// --- PALADINES (MAX 15 PUNTOS COMBINADOS - Hp/2 + stats = 15) ---
export const PALADINS: CardDef[] = [
  { id: 'p1', name: 'Dragón', rarity: 'PALADIN', health: 8, top: A(4), right: A(3), bottom: A(2), left: A(2) },
  { id: 'p2', name: 'Arcángel', rarity: 'PALADIN', health: 8, top: H(3), right: D(3), bottom: H(2), left: D(3) },
  { id: 'p3', name: 'Titán', rarity: 'PALADIN', health: 12, top: D(3), right: D(2), bottom: D(3), left: A(2) },
  { id: 'p4', name: 'Mago Real', rarity: 'PALADIN', health: 6, top: R(4), right: R(2), bottom: R(3), left: R(3) }
];
