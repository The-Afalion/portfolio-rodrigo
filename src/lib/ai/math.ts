// src/lib/ai/math.ts

/**
 * Función de activación Sigmoide (valores entre 0 y 1).
 */
export function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
}

/**
 * Función de activación Tangente Hiperbólica (valores entre -1 y 1).
 */
export function tanh(x: number): number {
    return Math.tanh(x);
}

/**
 * Interpolación lineal.
 */
export function lerp(A: number, B: number, t: number): number {
    return A + (B - A) * t;
}

/**
 * Devuelve un número aleatorio entre min y max.
 */
export function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Encuentra la intersección entre dos segmentos de línea (A-B) y (C-D).
 * Devuelve el punto de intersección y la t-distance a lo largo de A-B.
 * Usado para el cálculo de los radares (Raycasting) del coche contra las paredes.
 */
export function getIntersection(A: { x: number, y: number }, B: { x: number, y: number }, C: { x: number, y: number }, D: { x: number, y: number }) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if (bottom !== 0) {
        const t = tTop / bottom;
        const u = uTop / bottom;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t // La distancia de 0 a 1 a lo largo del rayo
            };
        }
    }
    return null;
}
