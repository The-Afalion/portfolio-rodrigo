// src/lib/lumina/LuminaEngine.ts

import { Lumina } from "./Lumina";
import { SpatialGrid } from "./SpatialGrid";

export class LuminaEngine {
    width: number;
    height: number;
    particles: Lumina[];
    grid: SpatialGrid;

    // Visuals
    colorCycle: number = 200; // Start at Blue
    lastTick: number = 0;

    // Interaction 
    attractor: { x: number, y: number, force: number } | null = null;

    // Config
    particleCount: number = 1500;
    particleSize: number = 2;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.particles = [];

        // El radio de visión de un Boid suele ser 50. Hacemos celdas de 50.
        this.grid = new SpatialGrid(width, height, 50);

        this.initSwarm();
    }

    initSwarm() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Lumina(Math.random() * this.width, Math.random() * this.height));
        }
    }

    setAttractor(x: number, y: number, force: number = 1.0) {
        this.attractor = { x, y, force };
    }

    clearAttractor() {
        this.attractor = null;
    }

    update() {
        // 1. Rebuild Spatial Grid O(N)
        this.grid.clear();
        for (let p of this.particles) {
            this.grid.insert(p);
        }

        // 2. Calculate Flocking using the Grid 
        for (let p of this.particles) {
            const neighbors = this.grid.getNeighbors(p);
            p.flock(neighbors);

            if (this.attractor) {
                p.addAttractor(this.attractor.x, this.attractor.y, this.attractor.force);
            }

            p.update(this.width, this.height);
        }

        // 3. Shift colors over time slowly (Generative Art)
        this.lastTick++;
        if (this.lastTick % 5 === 0) {
            this.colorCycle = (this.colorCycle + 0.1) % 360;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // MAGIC TRICK: Trail Fading
        // En vez de clearRect, dibujamos un fondo negro casi transparente.
        // Esto crea el efecto de estelas sedosas en la luz.
        ctx.fillStyle = "rgba(5, 5, 10, 0.1)";
        ctx.fillRect(0, 0, this.width, this.height);

        // Opcional: El attractor visualmente
        if (this.attractor && this.attractor.force > 0) {
            ctx.beginPath();
            ctx.arc(this.attractor.x, this.attractor.y, 40, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.colorCycle}, 80%, 60%, 0.05)`;
            ctx.fill();
        } else if (this.attractor && this.attractor.force < 0) {
            ctx.beginPath();
            ctx.arc(this.attractor.x, this.attractor.y, 60, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${this.colorCycle + 180}, 80%, 60%, 0.1)`;
            ctx.stroke();
        }

        // Pintar partículas super fluorescentes
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${this.colorCycle}, 80%, 60%)`;

        for (let p of this.particles) {
            // Darles ligeras variaciones de color a individous para riqueza visual
            const localColor = this.colorCycle + ((p.x / this.width) * 20);
            p.draw(ctx, this.particleSize, localColor);
        }

        ctx.shadowBlur = 0; // reset
    }
}
