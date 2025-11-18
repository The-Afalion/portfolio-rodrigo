declare module 'chess.js' {
  export class Chess {
    constructor(fen?: string);
    moves(options?: { verbose: boolean }): string[] | object[];
    game_over(): boolean;
    in_draw(): boolean;
    fen(): string;
    move(move: string | object): object | null;
    turn(): string;
    get(square: string): { type: string; color: string } | null;
    // Añade más métodos si los necesitas
  }

  // Definimos Square como string para que no falle el componente
  export type Square = string;
}