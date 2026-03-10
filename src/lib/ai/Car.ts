// src/lib/ai/Car.ts
import { Controls } from './Controls';
import { Sensor } from './Sensor';
import { NeuralNetwork } from './NeuralNetwork';
import { getIntersection } from './math';

export class Car {
    x: number;
    y: number;
    width: number;
    height: number;

    speed: number;
    acceleration: number;
    maxSpeed: number;
    friction: number;
    angle: number;
    damaged: boolean;

    controls: Controls;
    sensor?: Sensor;
    brain?: NeuralNetwork;
    useBrain: boolean;
    targetX?: number;
    laneChangeTimer: number;

    polygon: { x: number, y: number }[];
    targetPolygon: { x: number, y: number }[]; // Holograma del futuro

    constructor(x: number, y: number, width: number, height: number, controlType: 'KEYS' | 'DUMMY' | 'AI', maxSpeed: number = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType === "AI";
        this.polygon = [];
        this.targetPolygon = [];
        this.laneChangeTimer = 0;

        if (controlType !== "DUMMY") {
            this.sensor = new Sensor(this);
            // [Inputs = 5 Radares, Hidden = 6, Outputs = 4 (Adelante, Atras, Izquierda, Derecha)]
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }
        this.controls = new Controls(controlType);
    }

    update(roadBorders: { x: number, y: number }[][]) {
        if (!this.damaged) {
            this.#move();

            // Lógica lateral directa para DUMMYs simulando cambios de carril sin rotar (diagonal)
            if (!this.useBrain && this.targetX !== undefined) {
                this.angle = 0; // Sin giro, bloqueamos el ángulo

                // Proyecta el holograma físico en el carril destino
                this.targetPolygon = this.#createPolygonAt(this.targetX, this.y, this.angle);

                if (this.laneChangeTimer > 0) {
                    this.laneChangeTimer--;
                } else {
                    const diffX = this.targetX - this.x;
                    if (Math.abs(diffX) > 2) {
                        this.x += Math.sign(diffX) * 2; // Deslizamiento diagonal sumado a la Y de move()
                        this.controls.forward = true;
                    } else {
                        this.x = this.targetX;
                        this.targetX = undefined;
                        this.targetPolygon = []; // Destruye el holograma una vez llegado
                    }
                }
            }

            this.polygon = this.#createPolygonAt(this.x, this.y, this.angle);
            this.damaged = this.#assessDamage(roadBorders);
        }

        if (this.sensor && this.brain && !this.damaged) {
            this.sensor.update(roadBorders);
            // Parsear distancias del radar de 0 a 1 para alimentar la IA
            const offsets = this.sensor.readings.map(s => s === null ? 0 : 1 - s.offset);

            // Feed al cerebro
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            // El cerebro toma el control direccional si es un modelo AI
            if (this.useBrain) {
                // Forzamos aceleración constante para obligar a la IA a aprender a esquivar (adelantar)
                // Eliminamos su capacidad de frenar o igualar la velocidad del tráfico.
                this.controls.forward = true;
                this.controls.left = outputs[1] === 1;
                this.controls.right = outputs[2] === 1;
                this.controls.reverse = false;
            }
        }
    }

    #assessDamage(roadBorders: { x: number, y: number }[][]) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (this.#polyIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        return false;
    }

    #polyIntersect(poly1: { x: number, y: number }[], poly2: { x: number, y: number }[]) {
        for (let i = 0; i < poly1.length; i++) {
            for (let j = 0; j < poly2.length; j++) {
                const touch = getIntersection(
                    poly1[i], poly1[(i + 1) % poly1.length],
                    poly2[j], poly2[(j + 1) % poly2.length]
                );
                if (touch) {
                    return true;
                }
            }
        }
        return false;
    }

    // Define las esquinas del coche (geometría para calcular choques exactos)
    #createPolygonAt(x: number, y: number, angle: number) {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);

        points.push({
            x: x - Math.sin(angle - alpha) * rad,
            y: y - Math.cos(angle - alpha) * rad
        });
        points.push({
            x: x - Math.sin(angle + alpha) * rad,
            y: y - Math.cos(angle + alpha) * rad
        });
        points.push({
            x: x - Math.sin(Math.PI + angle - alpha) * rad,
            y: y - Math.cos(Math.PI + angle - alpha) * rad
        });
        points.push({
            x: x - Math.sin(Math.PI + angle + alpha) * rad,
            y: y - Math.cos(Math.PI + angle + alpha) * rad
        });
        return points;
    }

    #move() {
        // Cinemática 1. Aceleración
        if (this.controls.forward) this.speed += this.acceleration;
        if (this.controls.reverse) this.speed -= this.acceleration;

        // Cinemática 2. Límites de velocidad
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2; // Reversa mas lenta

        // Cinemática 3. Fricción al soltar controles
        if (this.speed > 0) this.speed -= this.friction;
        if (this.speed < 0) this.speed += this.friction;
        if (Math.abs(this.speed) < this.friction) this.speed = 0;

        // Cinemática 4. Rotación dependiente de velociad
        if (this.speed !== 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) this.angle += 0.03 * flip;
            if (this.controls.right) this.angle -= 0.03 * flip;
        }

        // Actualizar Coordenadas
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx: CanvasRenderingContext2D, color: string = "blue", drawSensor: boolean = false) {
        if (this.damaged) ctx.fillStyle = "gray";
        else ctx.fillStyle = color;

        ctx.beginPath();
        // Renderizamos el coche usando las esquinas precisas del polígono
        if (this.polygon.length > 0) {
            ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
            for (let i = 1; i < this.polygon.length; i++) {
                ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
            }
            ctx.fill();
        }

        // Renderizar Holograma Predictivo si existe
        if (this.targetPolygon.length > 0) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.beginPath();
            ctx.moveTo(this.targetPolygon[0].x, this.targetPolygon[0].y);
            for (let i = 1; i < this.targetPolygon.length; i++) {
                ctx.lineTo(this.targetPolygon[i].x, this.targetPolygon[i].y);
            }
            ctx.fill();

            // Efecto visual: Linea punteada conectando coche real con holograma
            ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.targetX || this.x, this.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Solo dibujamos los radares láser para el coche líder para no ensuciar la pantalla
        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }
}
