// src/lib/ai/Track.ts
import { lerp } from './math';

export class Track {
    x: number;
    width: number;
    laneCount: number;
    level: number;

    left: number;
    right: number;
    top: number;
    bottom: number;

    borders: { x: number, y: number }[][];

    constructor(x: number, width: number, laneCount: number = 3, level: number = 1) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;
        this.level = level;

        this.left = x - width / 2;
        this.right = x + width / 2;

        const infinity = 50000;
        this.top = -infinity;
        this.bottom = infinity;

        if (level === 3) {
            this.borders = [];
            const leftSegments = [];
            const rightSegments = [];

            // Generamos puntos desde y=1000 hasta y=-50000
            // Usamos un step grueso de 400px para mantener FPS altísimos sin perder forma
            let prevLeft = null;
            let prevRight = null;
            for (let y = 1000; y >= -50000; y -= 400) {
                const progress = Math.abs(y - 100) / 25000;

                // Frequency se reduce (ondas más rápidas) a medida que avanza
                const freq = 600 - (Math.min(progress, 1) * 350);
                const sineWindow = Math.sin(y / freq);

                // Amplitud de la onda (se vuelve salvaje)
                const amplitude = 300 * Math.min(progress, 1);
                const currentX = x + (sineWindow * amplitude);

                // El ancho de la carretera se estrecha hasta la mitad
                const currentWidth = width * Math.max(0.5, 1 - progress * 0.7);

                const ptLeft = { x: currentX - currentWidth / 2, y: y };
                const ptRight = { x: currentX + currentWidth / 2, y: y };

                if (prevLeft && prevRight) {
                    this.borders.push([prevLeft, ptLeft]);
                    this.borders.push([prevRight, ptRight]);
                }
                prevLeft = ptLeft;
                prevRight = ptRight;
            }
        } else {
            // Generaremos las paredes del circuito como segmentos de línea infinitos y rectos por ahora.
            const topLeft = { x: this.left, y: this.top };
            const topRight = { x: this.right, y: this.top };
            const bottomLeft = { x: this.left, y: this.bottom };
            const bottomRight = { x: this.right, y: this.bottom };

            this.borders = [
                [topLeft, bottomLeft],
                [topRight, bottomRight]
            ];
        }
    }

    // Define el inicio del coche en el centro del carril deseado
    getLaneCenter(laneIndex: number, y: number = 0) {
        if (this.level === 3) {
            // Calcular el X central para ese Y en específico usando la misma fórmula generativa
            const progress = Math.abs(y - 100) / 25000;
            const freq = 600 - (Math.min(progress, 1) * 350);
            const sineWindow = Math.sin(y / freq);
            const amplitude = 300 * Math.min(progress, 1);
            const currentX = this.x + (sineWindow * amplitude);
            const currentWidth = this.width * Math.max(0.5, 1 - progress * 0.7);

            const dynamicLeft = currentX - currentWidth / 2;
            const laneWidth = currentWidth / this.laneCount;
            return dynamicLeft + laneWidth / 2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth;
        }

        const laneWidth = this.width / this.laneCount;
        return this.left + laneWidth / 2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"; // Paredes del circuito

        for (let i = 0; i <= this.laneCount; i++) {
            if (this.level === 3) continue; // Desactivar guiones en nivel 3 para ahorrar render

            const x = lerp(this.left, this.right, i / this.laneCount);
            ctx.setLineDash([20, 20]);
            if (i > 0 && i < this.laneCount) {
                ctx.beginPath();
                ctx.moveTo(x, this.top);
                ctx.lineTo(x, this.bottom);
                ctx.stroke();
            }
        }

        if (this.level === 3) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#d946ef"; // Magenta neon glow for level 3
            ctx.strokeStyle = "rgba(217, 70, 239, 0.8)";
        }

        ctx.setLineDash([]);
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            // El array interno siempre tiene 2 puntos [start, end] o múltiples si cambiasemos la estructura.
            for (let i = 1; i < border.length; i++) {
                ctx.lineTo(border[i].x, border[i].y);
            }
            ctx.stroke();
        });
        ctx.shadowBlur = 0;
    }
}
