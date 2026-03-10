// src/lib/ecosystem/Ecosystem.ts
import { Entity, Diet } from './Entity';

export class Ecosystem {
    width: number;
    height: number;
    entities: Entity[];
    plants: { x: number, y: number, energy: number }[];
    hidingSpots: { x: number, y: number, radius: number }[];
    breedingZones: { diet: Diet, x: number, y: number, radius: number, color: string }[];

    discoveredSpecies: Set<string>;
    onSpeciation?: (name: string, diet: Diet) => void;

    constructor(width: number, height: number, onSpeciation?: (name: string, diet: Diet) => void) {
        this.width = width;
        this.height = height;
        this.entities = [];
        this.plants = [];
        this.hidingSpots = [];
        this.breedingZones = [];
        this.discoveredSpecies = new Set();
        this.onSpeciation = onSpeciation;

        this.generateEnvironment();
        this.seedInitialPopulation();
    }

    generateEnvironment() {
        // Zonas de maleza
        for (let i = 0; i < 15; i++) {
            this.hidingSpots.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 40 + Math.random() * 80
            });
        }

        // Zonas de Cría (3 biomas territoriales)
        this.breedingZones = [
            { diet: "HERBIVORE", x: this.width * 0.25, y: this.height * 0.25, radius: 150, color: "rgba(59, 130, 246, 0.2)" }, // Blue zone
            { diet: "CARNIVORE", x: this.width * 0.75, y: this.height * 0.75, radius: 150, color: "rgba(239, 68, 68, 0.2)" }, // Red zone
            { diet: "SCAVENGER", x: this.width * 0.25, y: this.height * 0.75, radius: 150, color: "rgba(245, 158, 11, 0.2)" } // Yellow zone
        ];
    }

    seedInitialPopulation() {
        for (let i = 0; i < 30; i++) {
            const bz = this.breedingZones.find(z => z.diet === "HERBIVORE")!;
            const ent = new Entity(bz.x + (Math.random() * 100 - 50), bz.y + (Math.random() * 100 - 50), "HERBIVORE");
            this.entities.push(ent);
        }

        for (let i = 0; i < 8; i++) {
            const bz = this.breedingZones.find(z => z.diet === "CARNIVORE")!;
            const ent = new Entity(bz.x + (Math.random() * 100 - 50), bz.y + (Math.random() * 100 - 50), "CARNIVORE");
            this.entities.push(ent);
        }

        for (let i = 0; i < 6; i++) {
            const bz = this.breedingZones.find(z => z.diet === "SCAVENGER")!;
            const ent = new Entity(bz.x + (Math.random() * 100 - 50), bz.y + (Math.random() * 100 - 50), "SCAVENGER");
            this.entities.push(ent);
        }
    }

    spawnPlant() {
        if (this.plants.length < 250) {
            this.plants.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                energy: 30 + Math.random() * 30
            });
        }
    }

    update() {
        if (Math.random() < 0.25) this.spawnPlant();

        this.entities.forEach(e => e.isHidden = false);

        this.entities.forEach(e => {
            if (e.diet !== "CARNIVORE") {
                for (let spot of this.hidingSpots) {
                    const dx = spot.x - e.x;
                    const dy = spot.y - e.y;
                    if (Math.sqrt(dx * dx + dy * dy) < spot.radius) {
                        e.isHidden = true;
                        break;
                    }
                }
            }
        });

        // Loop de Percepción y Física
        for (let i = 0; i < this.entities.length; i++) {
            const e = this.entities[i];

            const visibleEntities = this.entities.filter(other => {
                if (other === e) return false;
                if (other.isHidden && e.diet === "CARNIVORE") return false;
                const distance = Math.hypot(other.x - e.x, other.y - e.y);
                return distance < e.senseRadius;
            });

            const visiblePlants = this.plants.filter(p => {
                return Math.hypot(p.x - e.x, p.y - e.y) < e.senseRadius;
            });

            const bz = this.breedingZones.find(z => z.diet === e.diet);
            e.update(visibleEntities, visiblePlants, bz, this.width, this.height);
        }

        // Resolución de Combates y Alimentación por proximidad
        for (let i = 0; i < this.entities.length; i++) {
            const e1 = this.entities[i];
            if (e1.diet === "CORPSE") continue;

            // Combat & Defense
            for (let j = i + 1; j < this.entities.length; j++) {
                const e2 = this.entities[j];
                if (e2.diet === "CORPSE") continue;

                const dist = Math.hypot(e1.x - e2.x, e1.y - e2.y);
                if (dist < e1.size + e2.size) {
                    // Si un Carnivoro toca a una presa
                    if (e1.diet === "CARNIVORE" && e2.diet !== "CARNIVORE") {
                        e2.health -= e1.attackDamage * 0.1;
                        // Si la presa es agresiva, se defiende haciendo parry
                        if (e2.trait === "AGGRESSIVE") e1.health -= e2.attackDamage * 0.1;
                    }
                    else if (e2.diet === "CARNIVORE" && e1.diet !== "CARNIVORE") {
                        e1.health -= e2.attackDamage * 0.1;
                        if (e1.trait === "AGGRESSIVE") e2.health -= e1.attackDamage * 0.1;
                    }
                }
            }

            // Consumición de Cadáveres (Lenta)
            if (e1.diet === "CARNIVORE" || e1.diet === "SCAVENGER") {
                const corpses = this.entities.filter(c => c.diet === "CORPSE");
                for (let c of corpses) {
                    const dist = Math.hypot(e1.x - c.x, e1.y - c.y);
                    if (dist < e1.size + c.size) {
                        if (c.energy > 0) {
                            e1.energy += 3; // Lento para prevenir explosión demográfica
                            e1.health = Math.min(e1.maxHealth, e1.health + 0.5);
                            c.energy -= 3;
                        }
                    }
                }
            }

            // Consumición de Plantas
            if (e1.diet === "HERBIVORE" || e1.diet === "SCAVENGER") {
                for (let p of this.plants) {
                    const dist = Math.hypot(e1.x - p.x, e1.y - p.y);
                    if (dist < e1.size + 5) {
                        p.energy -= 10;
                        e1.energy += 10;
                        e1.health = Math.min(e1.maxHealth, e1.health + 2);
                    }
                }
            }
        }

        // Limpiamos la basura invisible
        this.plants = this.plants.filter(p => p.energy > 0);

        // Control de Muertes
        for (let e of this.entities) {
            if (e.diet !== "CORPSE" && (e.health <= 0 || e.energy <= 0)) {
                e.diet = "CORPSE";
                // Dejar valor calórico al morir proporcional al tamaño. 
                e.energy = e.size * 50;
                e.health = 0;
            }
        }

        // Limpiar cadáveres secos
        this.entities = this.entities.filter(e => e.diet !== "CORPSE" || e.energy > 0);

        // =======================
        //  REPRODUCCIÓN Y CRÍA
        // =======================
        const newBirths: Entity[] = [];
        for (let e of this.entities) {
            if (e.diet === "CORPSE" || e.role === "DEFENDER") {
                e.breedingTimer = 0;
                continue;
            }

            const repThreshold = e.diet === "CARNIVORE" ? 2000 : 1000;
            const bz = this.breedingZones.find(z => z.diet === e.diet);
            const inZone = bz && Math.hypot(bz.x - e.x, bz.y - e.y) < bz.radius;

            // Arreglo de Error Explosión Demográfica Carnívora:
            // Ahora la reproducción no es libre. EXIGE estar dentro del "nido" de la facción,
            // tener la energía altísima, ser un CRIADOR, y esperar 90 "frames" empollando sin ser atacado o asustado.
            if (e.energy > repThreshold && inZone) {
                e.breedingTimer++;
                if (e.breedingTimer > 90) {
                    e.energy -= (repThreshold * 0.6); // Drenaje colosal para parir 
                    e.breedingTimer = 0;

                    const child = e.reproduce();
                    newBirths.push(child);

                    if (child.species !== e.species) {
                        if (!this.discoveredSpecies.has(child.species)) {
                            this.discoveredSpecies.add(child.species);
                            if (this.onSpeciation) this.onSpeciation(child.species, child.diet);
                        }
                    }
                }
            } else {
                e.breedingTimer = 0; // Si es forzado a huir del nido o pierde energía, pierde el ciclo
            }
        }
        this.entities.push(...newBirths);

        // Capping absoluto para que la app no explote la RAM si se bugea el balance
        if (this.entities.length > 500) {
            const oldest = this.entities.findIndex(e => e.diet === "CORPSE");
            if (oldest !== -1) {
                this.entities.splice(oldest, 1);
            } else {
                // Mata de un rayo divino al más débil (baja energía) para liberar RAM
                this.entities.sort((a, b) => a.energy - b.energy);
                this.entities.splice(0, 1);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // ZONAS DE ESCONDITE
        ctx.fillStyle = "rgba(4, 120, 87, 0.1)";
        for (let spot of this.hidingSpots) {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // ZONAS DE CRIA Y DEFENSA TERRITORIAL
        for (let bz of this.breedingZones) {
            ctx.beginPath();
            ctx.arc(bz.x, bz.y, bz.radius, 0, Math.PI * 2);
            ctx.strokeStyle = bz.color;
            ctx.fillStyle = bz.color;
            ctx.lineWidth = 1;
            ctx.setLineDash([10, 10]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 0.05;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Label text in the center
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.fillText(`[ ${bz.diet} BREEDING ZONE ]`, bz.x, bz.y);
        }

        // PLANTAS
        ctx.fillStyle = "#10b981";
        for (let p of this.plants) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.min(2 + p.energy / 10, 5), 0, Math.PI * 2);
            ctx.fill();
        }

        // ENTIDADES (con roles definidos)
        for (let e of this.entities) {
            e.draw(ctx);
            // Dibujar círculo de "crianza" alrededor si están incubando
            if (e.breedingTimer > 0) {
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.size * 2, 0, (e.breedingTimer / 90) * Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "white";
                ctx.stroke();
            }
        }
    }
}
