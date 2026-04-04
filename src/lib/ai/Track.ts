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

        if (level === 3 || level === 7) {
            this.borders = [];
            let prevLeft = null;
            let prevRight = null;
            for (let y = 1000; y >= -100000; y -= 400) {
                let currentX = x;
                let currentWidth = width;

                if (level === 3) {
                    const progress = Math.abs(y - 100) / 25000;
                    const freq = 600 - (Math.min(progress, 1) * 350);
                    const sineWindow = Math.sin(y / freq);
                    const amplitude = 300 * Math.min(progress, 1);
                    currentX = x + (sineWindow * amplitude);
                    currentWidth = width * Math.max(0.5, 1 - progress * 0.7);
                } else if (level === 7) {
                    // Centrifugadora: Espiral polinomial que se estrecha exponencialmente
                    const progress = Math.abs(y - 100) / 30000; // 0 to 1+
                    const curve = Math.pow(progress, 2.5) * 4000; // Desplazamiento X muy fuerte hacia la derecha
                    currentX = x + curve;
                    currentWidth = width * Math.max(0.3, 1 - progress * 0.85); // Se estrecha hasta 30% del original
                }

                const ptLeft = { x: currentX - currentWidth / 2, y: y };
                const ptRight = { x: currentX + currentWidth / 2, y: y };

                if (prevLeft && prevRight) {
                    this.borders.push([prevLeft, ptLeft]);
                    this.borders.push([prevRight, ptRight]);
                }
                prevLeft = ptLeft;
                prevRight = ptRight;
            }
        } else if (level === 5) {
            // Zona Sísmica: Placas Tectónicas Desconectadas
            this.borders = [];
            for (let y = 1000; y >= -100000; y -= 1200) {
                // Pseudo-random shift basado en el índice de bloque
                const shiftX = Math.sin(y * 12.345) * 400;
                const currentX = x + shiftX;

                const plateLength = 900; // La placa mide 900px, el salto es de 300px
                const plateBottom = y;
                const plateTop = y - plateLength;

                const leftL = currentX - width / 2;
                const rightL = currentX + width / 2;

                // Las placas no están conectadas entre sí
                this.borders.push([{ x: leftL, y: plateBottom }, { x: leftL, y: plateTop }]);
                this.borders.push([{ x: rightL, y: plateBottom }, { x: rightL, y: plateTop }]);
            }
        } else {
            // Niveles 1, 2, 4 y 6 son de Autopista Recta normal.
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
            const progress = Math.abs(y - 100) / 25000;
            const freq = 600 - (Math.min(progress, 1) * 350);
            const amplitude = 300 * Math.min(progress, 1);
            const currentX = this.x + (Math.sin(y / freq) * amplitude);
            const currentWidth = this.width * Math.max(0.5, 1 - progress * 0.7);
            const dynamicLeft = currentX - currentWidth / 2;
            const laneWidth = currentWidth / this.laneCount;
            return dynamicLeft + laneWidth / 2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth;
        } else if (this.level === 7) {
            const progress = Math.abs(y - 100) / 30000;
            const curve = Math.pow(progress, 2.5) * 4000;
            const currentX = this.x + curve;
            const currentWidth = this.width * Math.max(0.3, 1 - progress * 0.85);
            const dynamicLeft = currentX - currentWidth / 2;
            const laneWidth = currentWidth / this.laneCount;
            return dynamicLeft + laneWidth / 2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth;
        } else if (this.level === 5) {
            // Encuentra el bloque tectónico correspondiente a esta 'y'
            // El step era de 1200. Tenemos que saber en qué bloque cae.
            const relativeY = 1000 - y;
            const blockIndex = Math.floor(relativeY / 1200);
            const blockY = 1000 - (blockIndex * 1200);
            const shiftX = Math.sin(blockY * 12.345) * 400;
            const currentX = this.x + shiftX;
            const dynamicLeft = currentX - this.width / 2;
            const laneWidth = this.width / this.laneCount;
            return dynamicLeft + laneWidth / 2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth;
        }

        const laneWidth = this.width / this.laneCount;
        return this.left + laneWidth / 2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"; // Paredes del circuito

        for (let i = 0; i <= this.laneCount; i++) {
            if (this.level === 3 || this.level === 5 || this.level === 6 || this.level === 7) continue; // Desactivar guiones en las fases complejas

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
        } else if (this.level === 5) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#eab308"; // Yellow tech glow
            ctx.strokeStyle = "rgba(234, 179, 8, 0.8)";
        } else if (this.level === 7) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#0ea5e9"; // Cyan centrifugal glow
            ctx.strokeStyle = "rgba(14, 165, 233, 0.9)";
        } else if (this.level === 6) {
            // Niebla Neuronal: Vuelve los bordes 100% invisibles. 
            // El usuario solo verá la carretera cuando los LÁSERES virtuales colisionen con los bordes y pinten el punto!
            ctx.strokeStyle = "transparent";
            ctx.shadowBlur = 0;
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
