import { Chess } from "chess.js";

type Dificultad = "Fácil" | "Medio" | "Difícil";

/**
 * Mapa con los valores de cada pieza.
 * Se usa para calcular la puntuación de una posición.
 */
const VALOR_PIEZAS: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 90 };

/**
 * Calcula la puntuación de una posición del tablero.
 * Una puntuación positiva favorece a las blancas, una negativa a las negras.
 * @param partida - El estado actual de la partida.
 * @returns La puntuación numérica del tablero.
 */
export function evaluarTablero(partida: Chess): number {
    if (partida.isCheckmate()) {
        // Si hay jaque mate, es la peor/mejor situación posible.
        return partida.turn() === 'w' ? -Infinity : Infinity;
    }
    if (partida.isDraw()) {
        return 0; // Tablas (empate).
    }

    let puntuacionTotal = 0;
    const tablero = partida.board();

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const pieza = tablero[i][j];
            if (pieza) {
                const valor = VALOR_PIEZAS[pieza.type];
                puntuacionTotal += (pieza.color === 'w' ? valor : -valor);
            }
        }
    }
    return puntuacionTotal;
}

/**
 * Una cola de prioridad simple para el algoritmo de Dijkstra.
 * Almacena los nodos a visitar, ordenados por el de menor coste primero.
 */
class ColaDePrioridad {
    private nodos: { fen: string, coste: number, camino: string[] }[] = [];

    encolar(fen: string, coste: number, camino: string[]) {
        this.nodos.push({ fen, coste, camino });
        this.ordenar();
    }

    desencolar() {
        return this.nodos.shift();
    }

    estaVacia() {
        return this.nodos.length === 0;
    }

    private ordenar() {
        this.nodos.sort((a, b) => a.coste - b.coste);
    }
}

/**
 * Encuentra el mejor movimiento usando una lógica inspirada en Dijkstra.
 * Busca el "camino" de N movimientos que lleva al estado del tablero
 * con el menor coste acumulado (evaluación más baja para las negras).
 * @param partida - El estado actual de la partida.
 * @param profundidad - Cuántos movimientos hacia adelante debe "pensar" la IA.
 * @returns El mejor movimiento encontrado o uno aleatorio si no hay más opción.
 */
function encontrarMejorMovimientoConDijkstra(partida: Chess, profundidad: number): string | null {
    const fenInicial = partida.fen();
    const cola = new ColaDePrioridad();
    cola.encolar(fenInicial, 0, []);

    const costes = new Map<string, number>();
    costes.set(fenInicial, 0);

    let mejorMovimiento: string | null = null;
    let mejorCoste = Infinity;

    while (!cola.estaVacia()) {
        const actual = cola.desencolar();
        if (!actual) continue;

        const { fen, coste, camino } = actual;

        if (coste > mejorCoste) {
            continue; // Poda: si este camino ya es peor que el mejor, no lo exploramos.
        }

        if (camino.length === profundidad) {
            if (coste < mejorCoste) {
                mejorCoste = coste;
                mejorMovimiento = camino[0]; // El mejor movimiento es el inicio del mejor camino.
            }
            continue; // No explorar más allá de la profundidad máxima.
        }

        if (camino.length > profundidad) continue; // Salvaguarda.

        const partidaActual = new Chess(fen);
        const movimientosPosibles = partidaActual.moves();

        for (const movimiento of movimientosPosibles) {
            partidaActual.move(movimiento);
            const siguienteFen = partidaActual.fen();

            // El "coste" es la evaluación del tablero. La IA (negras) busca minimizarlo.
            const evaluacion = evaluarTablero(partidaActual);
            const nuevoCoste = coste + evaluacion; // Acumulamos la puntuación del camino.

            if (nuevoCoste < (costes.get(siguienteFen) || Infinity)) {
                costes.set(siguienteFen, nuevoCoste);
                const nuevoCamino = [...camino, movimiento];
                cola.encolar(siguienteFen, nuevoCoste, nuevoCamino);
            }
            partidaActual.undo();
        }
    }

    // Si no se encontró un movimiento (algo raro), devolver uno aleatorio.
    if (mejorMovimiento) {
        return mejorMovimiento;
    }

    const movimientos = partida.moves();
    return movimientos.length > 0 ? movimientos[Math.floor(Math.random() * movimientos.length)] : null;
}

/**
 * Función principal que decide el movimiento de la IA según la dificultad.
 * @param partida - El estado actual de la partida.
 * @param dificultad - El nivel de dificultad seleccionado ("Fácil", "Medio", "Difícil").
 * @returns El movimiento que debe realizar la IA.
 */
export function obtenerMovimientoIA(partida: Chess, dificultad: Dificultad): string | null {
    const movimientosPosibles = partida.moves();
    if (movimientosPosibles.length === 0) return null;

    // La IA siempre juega con negras en esta configuración.
    if (partida.turn() === 'w') {
        return movimientosPosibles[Math.floor(Math.random() * movimientosPosibles.length)];
    }

    switch (dificultad) {
        case "Fácil":
            // Profundidad 1: Movimiento "codicioso", elige el mejor resultado inmediato.
            return encontrarMejorMovimientoConDijkstra(partida, 1);
        
        case "Medio":
            // Profundidad 2: Piensa un movimiento de la IA y una posible respuesta del jugador.
            return encontrarMejorMovimientoConDijkstra(partida, 2);

        case "Difícil":
            // Profundidad 3: Mayor anticipación. Será más lento.
            return encontrarMejorMovimientoConDijkstra(partida, 3);
            
        default:
            const indiceAleatorio = Math.floor(Math.random() * movimientosPosibles.length);
            return movimientosPosibles[indiceAleatorio];
    }
}
