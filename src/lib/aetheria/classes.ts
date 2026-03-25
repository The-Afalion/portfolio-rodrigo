export type Ability = 'RANGED' | 'HEAL' | 'PIERCE' | 'NONE';
export type CardType = 'HERO' | 'GENERAL' | 'TROOP';
export type ClassType = 'PALADIN' | 'WARLOCK' | 'RANGER';

export type CardSide = {
  damage: number;
  shield: number;
  ability: Ability;
};

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  classType?: ClassType; // Solo para Heroes y Troops
  health: number;
  top: CardSide;
  right: CardSide;
  bottom: CardSide;
  left: CardSide;
}

const S = (damage: number, shield: number, ability: Ability = 'NONE'): CardSide => ({ damage, shield, ability });

// --- HEROES ---
// Los héroes no se juegan en tablero. Otorgan las 6 tropas base.
export const HEROES: CardDef[] = [
  {
    id: 'h_paladin', name: 'Comandante de Luz (Paladín)', type: 'HERO', classType: 'PALADIN', health: 40,
    top: S(0,0), right: S(0,0), bottom: S(0,0), left: S(0,0) // Buff pasivo: +2 Vida a todas sus cartas
  },
  {
    id: 'h_warlock', name: 'Señora Sombría (Bruja)', type: 'HERO', classType: 'WARLOCK', health: 40,
    top: S(0,0), right: S(0,0), bottom: S(0,0), left: S(0,0) // Buff pasivo: Todos los ataques causan +1 Daño
  },
  {
    id: 'h_ranger', name: 'Arquero Mayor (Ranger)', type: 'HERO', classType: 'RANGER', health: 40,
    top: S(0,0), right: S(0,0), bottom: S(0,0), left: S(0,0) // Buff pasivo: +2 Escudo en caras superiores
  }
];

// --- TROOPS --- (6 por clase, más débiles pero sinérgicas)
export const TROOPS: CardDef[] = [
  // PALADIN (Altísima Vida y Escudo, Bajo Daño)
  { id: 't_pal1', name: 'Escudero', type: 'TROOP', classType: 'PALADIN', health: 12, top: S(1,4), right: S(1,4), bottom: S(1,4), left: S(1,4) },
  { id: 't_pal2', name: 'Sacerdote', type: 'TROOP', classType: 'PALADIN', health: 8, top: S(0,1,'HEAL'), right: S(0,1,'HEAL'), bottom: S(0,1), left: S(0,1) },
  { id: 't_pal3', name: 'Caballero', type: 'TROOP', classType: 'PALADIN', health: 15, top: S(4,2), right: S(2,2), bottom: S(1,1), left: S(2,2) },
  { id: 't_pal4', name: 'Infantería Pesada', type: 'TROOP', classType: 'PALADIN', health: 18, top: S(2,5), right: S(1,5), bottom: S(0,2), left: S(1,5) },
  { id: 't_pal5', name: 'Alabardero', type: 'TROOP', classType: 'PALADIN', health: 10, top: S(5,1,'PIERCE'), right: S(2,1), bottom: S(1,1), left: S(2,1) },
  { id: 't_pal6', name: 'Guardián del Umbral', type: 'TROOP', classType: 'PALADIN', health: 20, top: S(1,6), right: S(1,6), bottom: S(1,6), left: S(1,6) },

  // WARLOCK (Altísimo Daño y Pierce, Baja Vida)
  { id: 't_war1', name: 'Imp Menor', type: 'TROOP', classType: 'WARLOCK', health: 6, top: S(2,0), right: S(4,0), bottom: S(0,0), left: S(4,0) },
  { id: 't_war2', name: 'Acólito Oscuro', type: 'TROOP', classType: 'WARLOCK', health: 8, top: S(5,0,'PIERCE'), right: S(1,0), bottom: S(1,0), left: S(1,0) },
  { id: 't_war3', name: 'Sabueso de Fuego', type: 'TROOP', classType: 'WARLOCK', health: 10, top: S(6,1), right: S(3,1), bottom: S(1,1), left: S(3,1) },
  { id: 't_war4', name: 'Señor del Terror', type: 'TROOP', classType: 'WARLOCK', health: 12, top: S(7,2), right: S(5,2), bottom: S(2,2), left: S(5,2) },
  { id: 't_war5', name: 'Ojo Abisal', type: 'TROOP', classType: 'WARLOCK', health: 8, top: S(4,0,'RANGED'), right: S(0,0), bottom: S(0,0), left: S(0,0) },
  { id: 't_war6', name: 'Demonio Mayor', type: 'TROOP', classType: 'WARLOCK', health: 14, top: S(8,1), right: S(6,1), bottom: S(1,1), left: S(6,1) },

  // RANGER (Equilibrado, Ataques a Mediana Distancia, Agilidad)
  { id: 't_ran1', name: 'Explorador', type: 'TROOP', classType: 'RANGER', health: 10, top: S(3,2), right: S(3,2), bottom: S(1,1), left: S(3,2) },
  { id: 't_ran2', name: 'Arquero Silvano', type: 'TROOP', classType: 'RANGER', health: 8, top: S(5,1,'RANGED'), right: S(2,1), bottom: S(1,1), left: S(2,1) },
  { id: 't_ran3', name: 'Domabestias', type: 'TROOP', classType: 'RANGER', health: 14, top: S(4,3), right: S(3,2), bottom: S(2,2), left: S(3,2) },
  { id: 't_ran4', name: 'Asesino Veloz', type: 'TROOP', classType: 'RANGER', health: 9, top: S(6,1,'PIERCE'), right: S(1,0), bottom: S(1,0), left: S(6,1) },
  { id: 't_ran5', name: 'Francotirador', type: 'TROOP', classType: 'RANGER', health: 7, top: S(8,0,'RANGED'), right: S(1,0), bottom: S(1,0), left: S(1,0) },
  { id: 't_ran6', name: 'Montaraz', type: 'TROOP', classType: 'RANGER', health: 12, top: S(5,4), right: S(4,3), bottom: S(2,2), left: S(4,3) }
];

// --- GENERALS --- (Brutales stat-wise. Neutrales.)
export const GENERALS: CardDef[] = [
  { id: 'g_dragon', name: 'Dragón Ancestral', type: 'GENERAL', health: 25, top: S(9,4), right: S(7,3), bottom: S(4,3), left: S(7,3) },
  { id: 'g_golem', name: 'Constructo Primitivo', type: 'GENERAL', health: 35, top: S(4,8), right: S(4,8), bottom: S(2,9), left: S(4,8) },
  { id: 'g_angel', name: 'Seraph Protector', type: 'GENERAL', health: 22, top: S(6,6), right: S(3,5,'HEAL'), bottom: S(1,5), left: S(3,5,'HEAL') },
  { id: 'g_kraken', name: 'Kraken de Éter', type: 'GENERAL', health: 28, top: S(5,4,'PIERCE'), right: S(5,4,'PIERCE'), bottom: S(1,2), left: S(5,4,'PIERCE') },
  { id: 'g_phoenix', name: 'Fénix Renacido', type: 'GENERAL', health: 20, top: S(8,1,'RANGED'), right: S(7,1), bottom: S(3,1), left: S(7,1) },
  { id: 'g_titan', name: 'Titán Acorazado', type: 'GENERAL', health: 30, top: S(7,7), right: S(2,9), bottom: S(1,5), left: S(2,9) }
];
