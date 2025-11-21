// Este archivo "aumenta" las definiciones de tipo de la librería chess.js
// para incluir los métodos correctos de la v0.13.x que faltan en @types/chess.js

import { Chess } from 'chess.js';

declare module 'chess.js' {
  interface Chess {
    // Métodos correctos para la v0.13.x
    in_checkmate(): boolean;
    in_draw(): boolean;
    in_check(): boolean;
  }
}
