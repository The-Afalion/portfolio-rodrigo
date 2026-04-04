// src/lib/swarm/SmartRocket.ts

class SwarmNN {
    levels: Level[];

    constructor(neuronCounts: number[]) {
        this.levels = [];
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
        }
    }

    static feedForward(givenInputs: number[], network: SwarmNN) {
        let outputs = Level.feedForward(givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }
        return outputs;
    }

    static mutate(network: SwarmNN, amount: number = 0.1) {
        network.levels.forEach(level => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] += (Math.random() * 2 - 1) * amount;
            }
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] += (Math.random() * 2 - 1) * amount;
                }
            }
        });
    }

    static crossover(parentA: SwarmNN, parentB: SwarmNN): SwarmNN {
        const child = new SwarmNN([5, 6, 2]); // Inputs: 5 sensors, Hidden: 6, Outputs: 2 (Rotate L, Rotate R)
        for (let i = 0; i < child.levels.length; i++) {
            for (let j = 0; j < child.levels[i].biases.length; j++) {
                child.levels[i].biases[j] = Math.random() > 0.5 ? parentA.levels[i].biases[j] : parentB.levels[i].biases[j];
            }
            for (let j = 0; j < child.levels[i].weights.length; j++) {
                for (let k = 0; k < child.levels[i].weights[j].length; k++) {
                    child.levels[i].weights[j][k] = Math.random() > 0.5 ? parentA.levels[i].weights[j][k] : parentB.levels[i].weights[j][k];
                }
            }
        }
        return child;
    }
}

class Level {
    inputs: number[];
    outputs: number[];
    biases: number[];
    weights: number[][];

    constructor(inputCount: number, outputCount: number) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);
        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }
        Level.randomize(this);
    }

    static randomize(level: Level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedForward(givenInputs: number[], level: Level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }
            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }
}

// Intersección de líneas para el Raycasting
function getIntersection(A: { x: number, y: number }, B: { x: number, y: number }, C: { x: number, y: number }, D: { x: number, y: number }) {
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
                offset: t
            }
        }
    }
    return null;
}

function lerp(A: number, B: number, t: number) {
    return A + (B - A) * t;
}

export class SmartRocket {
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    speed: number;

    dead: boolean;
    reachedTarget: boolean;
    fitness: number;

    brain: SwarmNN;
    rayCount: number = 5;
    rayLength: number = 100;
    raySpread: number = Math.PI / 1.5;
    sensorReadings: number[] = [];

    constructor(x: number, y: number, copyBrain?: SwarmNN) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        // Apuntan hacia arriba por defecto
        this.angle = -Math.PI / 2;
        this.speed = 4;

        this.dead = false;
        this.reachedTarget = false;
        this.fitness = 0;

        // 5 Sensors, 6 Hidden, 2 Outputs (Turn Left, Turn Right)
        if (copyBrain) {
            this.brain = JSON.parse(JSON.stringify(copyBrain)); // Deep copy rough
            // Proper reinstantiation would be needed if methods were heavily used, but static methods bypass this.
        } else {
            this.brain = new SwarmNN([this.rayCount, 6, 2]);
        }
    }

    update(walls: { p1: { x: number, y: number }, p2: { x: number, y: number } }[], target: { x: number, y: number }, bounds: { w: number, h: number }) {
        if (this.dead || this.reachedTarget) return;

        // 1. Raycast Obstáculos
        this.sensorReadings = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.angle;

            const rayEnd = {
                x: this.x - Math.sin(rayAngle) * this.rayLength,
                y: this.y - Math.cos(rayAngle) * this.rayLength
            };

            let closestOffset = 1;

            // Check walls
            for (let w of walls) {
                const intersect = getIntersection(
                    { x: this.x, y: this.y }, rayEnd,
                    w.p1, w.p2
                );
                if (intersect && intersect.offset < closestOffset) {
                    closestOffset = intersect.offset;
                }
            }

            // Check bounds (pantalla)
            const mapBounds = [
                { p1: { x: 0, y: 0 }, p2: { x: bounds.w, y: 0 } },
                { p1: { x: bounds.w, y: 0 }, p2: { x: bounds.w, y: bounds.h } },
                { p1: { x: bounds.w, y: bounds.h }, p2: { x: 0, y: bounds.h } },
                { p1: { x: 0, y: bounds.h }, p2: { x: 0, y: 0 } },
            ];

            for (let w of mapBounds) {
                const intersect = getIntersection(
                    { x: this.x, y: this.y }, rayEnd,
                    w.p1, w.p2
                );
                if (intersect && intersect.offset < closestOffset) {
                    closestOffset = intersect.offset;
                }
            }

            // Lectura: 0 es lejos/nada, 1 es obstáculo en la cara
            this.sensorReadings.push(1 - closestOffset);
        }

        // 2. Feedforward Red Neuronal
        // Inputs: [SensorLeft, SensorMidLeft, SensorCenter, SensorMidRight, SensorRight]
        const outputs = SwarmNN.feedForward(this.sensorReadings, this.brain);

        // Outputs: [RotateLeft, RotateRight]
        if (outputs[0] > 0) this.angle += 0.1;
        if (outputs[1] > 0) this.angle -= 0.1;

        // 3. Move forward constantly (Acelerador automático guiado por la rotación de la IA)
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;

        // 4. Collision Detection (Física de impacto)
        // Walls
        for (let w of walls) {
            const intersect1 = getIntersection(
                { x: this.x - 2, y: this.y - 2 }, { x: this.x + 2, y: this.y + 2 },
                w.p1, w.p2
            );
            const intersect2 = getIntersection(
                { x: this.x + 2, y: this.y - 2 }, { x: this.x - 2, y: this.y + 2 },
                w.p1, w.p2
            );
            if (intersect1 || intersect2) {
                this.dead = true;
            }
        }
        // Bounds
        if (this.x < 0 || this.x > bounds.w || this.y < 0 || this.y > bounds.h) {
            this.dead = true;
        }

        // 5. Target Check
        const distToTarget = Math.hypot(target.x - this.x, target.y - this.y);
        if (distToTarget < 20) {
            this.reachedTarget = true;
        }
    }

    calculateFitness(target: { x: number, y: number }) {
        const distToTarget = Math.hypot(target.x - this.x, target.y - this.y);
        this.fitness = 1000 / (distToTarget + 1); // Fitness base inversamente proporcional a la distancia

        if (this.reachedTarget) {
            this.fitness *= 10; // Massive bonus if they won
        }
        if (this.dead) {
            this.fitness *= 0.1; // Penalty for crashing, to heavily encourage wall avoidance over rushing
        }

        // Fitness cuadrado para magnificar diferencias entre mediocres y buenos
        this.fitness = Math.pow(this.fitness, 2);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-4, 6);
        ctx.lineTo(4, 6);
        ctx.closePath();

        if (this.reachedTarget) {
            ctx.fillStyle = "#10b981"; // Win = Green
            ctx.shadowColor = "#10b981";
            ctx.shadowBlur = 10;
        } else if (this.dead) {
            ctx.fillStyle = "#ef4444"; // Crash = Red
            ctx.globalAlpha = 0.5;
        } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // Alive = White Translucent
        }

        ctx.fill();

        // Optional: Draw sensors if not dead
        if (!this.dead && !this.reachedTarget) {
            for (let i = 0; i < this.rayCount; i++) {
                const rayAngle = lerp(
                    this.raySpread / 2,
                    -this.raySpread / 2,
                    this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
                );

                const length = this.rayLength * (1 - this.sensorReadings[i]);

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(
                    -Math.sin(rayAngle) * length,
                    -Math.cos(rayAngle) * length
                );
                ctx.strokeStyle = "rgba(251, 191, 36, 0.2)"; // Yellow laser
                ctx.stroke();
            }
        }

        ctx.restore();
    }
}
