// src/lib/swarm/SwarmEngine.ts
import { SmartRocket } from './SmartRocket';

export type Wall = { p1: { x: number, y: number }, p2: { x: number, y: number } };

export class SwarmEngine {
    width: number;
    height: number;

    populationSize: number = 200;
    mutationRate: number = 0.1;
    lifespan: number = 400; // frames per generation

    generation: number = 1;
    currentTick: number = 0;

    rockets: SmartRocket[];
    walls: Wall[];

    spawnPoint: { x: number, y: number };
    target: { x: number, y: number };
    gravityWells: { x: number, y: number, radius: number, strength: number }[];

    constructor(width: number, height: number, popSize: number = 200, lifespan: number = 400) {
        this.width = width;
        this.height = height;
        this.populationSize = popSize;
        this.lifespan = lifespan;

        this.spawnPoint = { x: width / 2, y: height - 50 };
        this.target = { x: width / 2, y: 50 };

        this.rockets = [];
        this.walls = [];
        this.gravityWells = [];

        this.initPopulation();
    }

    setObstacles(walls: Wall[], wells: any[]) {
        this.walls = walls;
        this.gravityWells = wells;
    }

    initPopulation() {
        this.rockets = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.rockets.push(new SmartRocket(this.spawnPoint.x, this.spawnPoint.y));
        }
    }

    update() {
        this.currentTick++;

        // Actualizar física de los cohetes
        for (let r of this.rockets) {

            // Apply Gravity Wells
            for (let well of this.gravityWells) {
                if (!r.dead && !r.reachedTarget) {
                    const dist = Math.hypot(well.x - r.x, well.y - r.y);
                    if (dist < well.radius) {
                        r.dead = true; // Absorbed
                    } else if (dist < well.radius * 3) {
                        // Sucks them in
                        const pullX = (well.x - r.x) / dist * (well.strength / dist);
                        const pullY = (well.y - r.y) / dist * (well.strength / dist);
                        r.x += pullX;
                        r.y += pullY;
                    }
                }
            }

            r.update(this.walls, this.target, { w: this.width, h: this.height });
        }

        // Evaluar final de generación
        const allDeadOrWon = this.rockets.every(r => r.dead || r.reachedTarget);

        if (this.currentTick >= this.lifespan || allDeadOrWon) {
            this.evaluateAndEvolve();
        }
    }

    evaluateAndEvolve() {
        // 1. Calculate Fitness
        for (let r of this.rockets) {
            r.calculateFitness(this.target);
        }

        // 2. Sort by Fitness
        this.rockets.sort((a, b) => b.fitness - a.fitness);

        // 3. Selection (Mating Pool). Select top 10%
        const matingPoolSize = Math.max(2, Math.floor(this.populationSize * 0.1));
        const elite = this.rockets.slice(0, matingPoolSize);

        // 4. Crossover & Mutation
        const newGeneration: SmartRocket[] = [];

        // Mantener al absoluto mejor sin mutar (Elitism)
        const theBest = new SmartRocket(this.spawnPoint.x, this.spawnPoint.y, elite[0].brain);
        newGeneration.push(theBest);

        // Rellenar el resto mezclando
        for (let i = 1; i < this.populationSize; i++) {
            // Pick two random parents from the elite pool
            const pA = elite[Math.floor(Math.random() * elite.length)].brain;
            const pB = elite[Math.floor(Math.random() * elite.length)].brain;

            // Trick para acceder a la funcion statica de cruce (asumiendo que está exportada o replicada)
            // Ya que en TS el copy construct de classes no arrastra static facilmente sin importar 
            // Para simplificar la mutación profunda procedural, mutamos del padre A
            const childBrainRaw = JSON.parse(JSON.stringify(pA));

            // Applicamos la Mutacion Manual
            for (let l of childBrainRaw.levels) {
                for (let j = 0; j < l.biases.length; j++) {
                    if (Math.random() < this.mutationRate) l.biases[j] += (Math.random() * 2 - 1) * 0.5;
                }
                for (let j = 0; j < l.weights.length; j++) {
                    for (let k = 0; k < l.weights[j].length; k++) {
                        if (Math.random() < this.mutationRate) l.weights[j][k] += (Math.random() * 2 - 1) * 0.5;
                    }
                }
            }

            newGeneration.push(new SmartRocket(this.spawnPoint.x, this.spawnPoint.y, childBrainRaw));
        }

        this.rockets = newGeneration;
        this.generation++;
        this.currentTick = 0;
    }

    draw(ctx: CanvasRenderingContext2D) {

        // Draw Gravity Wells
        for (let well of this.gravityWells) {
            ctx.beginPath();
            ctx.arc(well.x, well.y, well.radius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#8b5cf6"; // Violet glow
            ctx.strokeStyle = "#8b5cf6";
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Event horizon
            ctx.beginPath();
            ctx.arc(well.x, well.y, well.radius * 3, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(139, 92, 246, 0.1)";
            ctx.stroke();
        }

        // Draw Walls
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        for (let w of this.walls) {
            ctx.beginPath();
            ctx.moveTo(w.p1.x, w.p1.y);
            ctx.lineTo(w.p2.x, w.p2.y);
            ctx.stroke();
        }
        ctx.lineWidth = 1;

        // Draw Spawn
        ctx.beginPath();
        ctx.arc(this.spawnPoint.x, this.spawnPoint.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fill();

        // Draw Target
        ctx.beginPath();
        ctx.arc(this.target.x, this.target.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.target.x, this.target.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#10b981";
        ctx.fill();

        // Draw Swarm
        for (let r of this.rockets) {
            r.draw(ctx);
        }
    }
}
