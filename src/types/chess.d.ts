// Este archivo "aumenta" las definiciones de tipo de la librería chess.js
// para incluir los métodos que faltan en @types/chess.js

import { Chess } from 'chess.js';

declare module 'chess.js' {
  interface Chess {
    isCheckmate(): boolean;
    isDraw(): boolean;
    isCheck(): boolean;
    // Puedes añadir cualquier otro método que falte aquí
  }
}
