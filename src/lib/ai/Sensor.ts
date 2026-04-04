// src/lib/ai/Sensor.ts
import { getIntersection, lerp } from './math';
import { Car } from './Car';

export class Sensor {
    car: Car;
    rayCount: number;
    rayLength: number;
    raySpread: number;
    rays: { x: number, y: number }[][]; // Arreglo de segmentos (A a B)
    readings: { x: number, y: number, offset: number }[];

    constructor(car: Car) {
        this.car = car;
        this.rayCount = 5; // Cantidad de radares
        this.rayLength = 250; // Aumentado a 25m para ver trafico y preparar el adelantamiento
        this.raySpread = Math.PI / 1.5; // Mayor apertura lateral (120grados)
        this.rays = [];
        this.readings = [];
    }

    update(roadBorders: { x: number, y: number }[][]) {
        this.#castRays();
        this.readings = [];

        // Calcular colisión de cada rayo contra todos los bordes
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReading(this.rays[i], roadBorders) as any // Permitimos undefined/null si no golpea
            )
        }
    }

    #getReading(ray: { x: number, y: number }[], roadBorders: { x: number, y: number }[][]) {
        let touches: { x: number, y: number, offset: number }[] = [];

        for (let i = 0; i < roadBorders.length; i++) {
            const poly = roadBorders[i];
            for (let j = 0; j < poly.length; j++) {
                const A = poly[j];
                const B = poly[(j + 1) % poly.length];
                const touch = getIntersection(ray[0], ray[1], A, B);
                if (touch) {
                    touches.push(touch);
                }
            }
        }

        if (touches.length === 0) {
            return null; // El radar no detecta pared en 150px
        } else {
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e => e.offset === minOffset); // Devolvemos el punto de impacto más cercano a nosotros
        }
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle;

            const start = { x: this.car.x, y: this.car.y };
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength
            };
            this.rays.push([start, end]);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1];
            if (this.readings[i]) {
                end = this.readings[i];
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(255, 255, 0, 0.5)"; // Rayo Amarillo visible
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }
}
