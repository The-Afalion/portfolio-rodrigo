// src/lib/ecosystem/Entity.ts

export type Diet = "HERBIVORE" | "CARNIVORE" | "SCAVENGER" | "CORPSE";
export type Trait = "AGGRESSIVE" | "TIMID";
export type Role = "BREEDER" | "DEFENDER";

export class Entity {
    // Spatial
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;

    // Genetics
    diet: Diet;
    trait: Trait;
    role: Role;
    speed: number;
    size: number;
    senseRadius: number;
    metabolism: number;

    // Combat & Life
    health: number;
    maxHealth: number;
    attackDamage: number;
    energy: number;
    isHidden: boolean;
    breedingTimer: number;

    // Nomenclatura & Taxonomía procedural
    species: string;
    parentHash: string;

    constructor(x: number, y: number, diet: Diet) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5);
        this.vy = (Math.random() - 0.5);
        this.angle = Math.random() * Math.PI * 2;

        this.diet = diet;

        // Random Trait & Role
        this.trait = Math.random() > 0.5 ? "AGGRESSIVE" : "TIMID";
        this.role = Math.random() > 0.6 ? "DEFENDER" : "BREEDER"; // Mayor supervivencia con defensores

        // Enforce Carnivores
        if (this.diet === "CARNIVORE") {
            this.trait = "AGGRESSIVE";
            // Carnivores pueden ser criadores o defensores de su nido
        }

        // Base Genetics
        this.speed = diet === "CARNIVORE" ? 3.5 : (diet === "HERBIVORE" ? 2.5 : 1.5);
        this.size = diet === "CARNIVORE" ? 8 : (diet === "HERBIVORE" ? 5 : 6);
        this.senseRadius = diet === "HERBIVORE" ? 150 : 200;

        this.maxHealth = this.size * 20;
        this.health = this.maxHealth;
        this.attackDamage = this.trait === "AGGRESSIVE" ? this.size * 0.8 : 0;
        this.metabolism = (this.speed * 0.3) + (this.size * 0.05) + (this.senseRadius * 0.002);

        this.energy = 800; // Empiezan fuertes
        this.isHidden = false;
        this.breedingTimer = 0;

        this.species = this.generateRootSpeciesName();
        this.parentHash = this.getGeneticsHash();
    }

    generateRootSpeciesName() {
        const pre = ["Velo", "Micro", "Megal", "Terra", "Chloro", "Carno", "Aero", "Nycto"];
        const post = ["poda", "rex", "don", "saur", "form", "zoa", "lith", "mimus"];
        return pre[Math.floor(Math.random() * pre.length)] + post[Math.floor(Math.random() * post.length)];
    }

    getGeneticsHash() {
        return `${this.speed.toFixed(1)}|${this.size.toFixed(1)}|${this.senseRadius.toFixed(0)}|${this.trait}|${this.role}`;
    }

    reproduce(): Entity {
        // Nace cerca del nido o del padre
        const child = new Entity(this.x + (Math.random() * 20 - 10), this.y + (Math.random() * 20 - 10), this.diet);

        child.speed = this.speed * (1 + (Math.random() * 0.3 - 0.15));
        child.size = this.size * (1 + (Math.random() * 0.2 - 0.1));
        child.senseRadius = this.senseRadius * (1 + (Math.random() * 0.4 - 0.2));

        // Inheredar rasgos lógicos con chance de mutación binaria
        child.trait = this.trait;
        child.role = this.role;
        if (Math.random() < 0.1) child.trait = child.trait === "AGGRESSIVE" ? "TIMID" : "AGGRESSIVE";
        if (Math.random() < 0.1) child.role = child.role === "BREEDER" ? "DEFENDER" : "BREEDER";

        if (child.diet === "CARNIVORE") child.trait = "AGGRESSIVE";

        // Limitadores físicos 
        child.speed = Math.max(0.5, Math.min(child.speed, 6));
        child.size = Math.max(3, Math.min(child.size, 15));
        child.senseRadius = Math.max(40, Math.min(child.senseRadius, 300));

        child.maxHealth = child.size * 20;
        child.health = child.maxHealth;
        child.attackDamage = child.trait === "AGGRESSIVE" ? child.size * 0.8 : 0;

        child.metabolism = (child.speed * 0.3) + (child.size * 0.05) + (child.senseRadius * 0.002);
        if (child.trait === "AGGRESSIVE") child.metabolism += 0.2; // La agresividad gasta más
        if (child.role === "DEFENDER") child.metabolism += 0.1;

        child.energy = 400; // Recién nacidos empiezan con algo de energía de la madre
        child.species = this.species;
        child.parentHash = this.parentHash;

        const speedDiff = Math.abs(child.speed - parseFloat(this.parentHash.split('|')[0]));
        if (speedDiff > 1.2 || child.trait !== this.parentHash.split('|')[3]) {
            child.species = "Neo-" + this.generateRootSpeciesName();
            child.parentHash = child.getGeneticsHash();
        }

        return child;
    }

    update(visibleEntities: Entity[], visiblePlants: { x: number, y: number }[], breedingZone: { x: number, y: number, radius: number } | undefined, width: number, height: number) {
        if (this.diet === "CORPSE") return;

        let forceX = 0;
        let forceY = 0;

        const predators = visibleEntities.filter(e => e.diet === "CARNIVORE" && e.diet !== "CORPSE");
        const threats = this.diet === "CARNIVORE" ? visibleEntities.filter(e => e.trait === "AGGRESSIVE" && e.diet !== "CARNIVORE" && e.diet !== "CORPSE") : predators;

        // ==========================
        //  COMPORTAMIENTO: DEFENSOR
        // ==========================
        if (this.role === "DEFENDER") {
            // Priority 1: Defend the zone against threats
            if (threats.length > 0 && this.trait === "AGGRESSIVE") {
                let closest = threats.reduce((prev, curr) =>
                    Math.hypot(prev.x - this.x, prev.y - this.y) < Math.hypot(curr.x - this.x, curr.y - this.y) ? prev : curr
                );
                const dist = Math.hypot(closest.x - this.x, closest.y - this.y);
                forceX += (closest.x - this.x) / dist * 1.5; // Ir a atacarlos
                forceY += (closest.y - this.y) / dist * 1.5;
            }
            else if (breedingZone) {
                // Priority 2: Patrol breeding zone perimeter
                const distToZone = Math.hypot(breedingZone.x - this.x, breedingZone.y - this.y);
                if (distToZone > breedingZone.radius * 0.7) {
                    forceX += (breedingZone.x - this.x) / distToZone;
                    forceY += (breedingZone.y - this.y) / distToZone;
                } else if (this.energy < 1000 && this.diet !== "CARNIVORE") {
                    // Tratar de comer si hay plantas cerca, pero no alejarse del nido
                    if (this.diet === "HERBIVORE" && visiblePlants.length > 0) {
                        let closest = visiblePlants.reduce((prev, curr) =>
                            Math.hypot(prev.x - this.x, prev.y - this.y) < Math.hypot(curr.x - this.x, curr.y - this.y) ? prev : curr
                        );
                        forceX += (closest.x - this.x) * 0.01; // Impulso muy débil
                        forceY += (closest.y - this.y) * 0.01;
                    }
                }
            }
        }

        // ======================================
        //  COMPORTAMIENTO: CRIADOR O CAZADOR
        // ======================================
        else if (this.role === "BREEDER" || this.diet === "CARNIVORE") {
            if (this.trait === "TIMID" && predators.length > 0) {
                // Flee from predators
                for (let p of predators) {
                    const dist = Math.max(1, Math.hypot(p.x - this.x, p.y - this.y));
                    forceX -= (p.x - this.x) / dist * (100 / dist);
                    forceY -= (p.y - this.y) / dist * (100 / dist);
                }
            } else if (this.trait === "AGGRESSIVE" && this.diet !== "CARNIVORE" && predators.length > 0) {
                // Presas agresivas atacan
                let closest = predators.reduce((prev, curr) =>
                    Math.hypot(prev.x - this.x, prev.y - this.y) < Math.hypot(curr.x - this.x, curr.y - this.y) ? prev : curr
                );
                const dist = Math.max(1, Math.hypot(closest.x - this.x, closest.y - this.y));
                forceX += (closest.x - this.x) / dist;
                forceY += (closest.y - this.y) / dist;
            } else if (this.diet === "CARNIVORE") {
                // Instinto Caza vs Cría
                const prey = visibleEntities.filter(e => e.diet !== "CARNIVORE" && e.diet !== "CORPSE" && !e.isHidden);

                if (prey.length > 0 && this.energy < 1800) {
                    // Caza si ve algo y no está super nutrido
                    let closest = prey.reduce((prev, curr) =>
                        Math.hypot(prev.x - this.x, prev.y - this.y) < Math.hypot(curr.x - this.x, curr.y - this.y) ? prev : curr
                    );
                    const dist = Math.max(1, Math.hypot(closest.x - this.x, closest.y - this.y));
                    forceX += (closest.x - this.x) / dist * 1.5;
                    forceY += (closest.y - this.y) / dist * 1.5;
                } else if (breedingZone && this.energy >= 1400) {
                    // Volver a la zona a reproducirse si tiene suficiente energía
                    const distToZone = Math.hypot(breedingZone.x - this.x, breedingZone.y - this.y);
                    if (distToZone > breedingZone.radius * 0.5) {
                        forceX += (breedingZone.x - this.x) / distToZone;
                        forceY += (breedingZone.y - this.y) / distToZone;
                    }
                } else {
                    // Patrulla browniana
                    forceX += (Math.random() - 0.5) * 0.2;
                    forceY += (Math.random() - 0.5) * 0.2;
                }
            } else {
                // Herbívoros & Carroñeros: Decidir si comer o ir a criar
                const repThreshold = this.diet === "SCAVENGER" ? 1200 : 1000;

                if (this.energy >= repThreshold && breedingZone) {
                    // Listos para criar, volver a la zona
                    const distToZone = Math.hypot(breedingZone.x - this.x, breedingZone.y - this.y);
                    if (distToZone > breedingZone.radius * 0.5) {
                        forceX += (breedingZone.x - this.x) / distToZone;
                        forceY += (breedingZone.y - this.y) / distToZone;
                    }
                } else if (this.diet === "HERBIVORE" && visiblePlants.length > 0) {
                    // Buscar comida incansablemente
                    let closest = visiblePlants.reduce((prev, curr) =>
                        Math.hypot(prev.x - this.x, prev.y - this.y) < Math.hypot(curr.x - this.x, curr.y - this.y) ? prev : curr
                    );
                    const dist = Math.hypot(closest.x - this.x, closest.y - this.y);
                    forceX += (closest.x - this.x) / dist;
                    forceY += (closest.y - this.y) / dist;
                } else if (this.diet === "SCAVENGER") {
                    // Carroña
                    const corpses = visibleEntities.filter(e => e.diet === "CORPSE");
                    if (corpses.length > 0) {
                        let closest = corpses.reduce((prev, curr) =>
                            Math.hypot(prev.x - this.x, prev.y - this.y) < Math.hypot(curr.x - this.x, curr.y - this.y) ? prev : curr
                        );
                        const dist = Math.hypot(closest.x - this.x, closest.y - this.y);
                        forceX += (closest.x - this.x) / dist;
                        forceY += (closest.y - this.y) / dist;
                    } else if (visiblePlants.length > 0) {
                        let closest = visiblePlants.reduce((prev, curr) =>
                            Math.hypot(prev.x - this.x, prev.y - this.y) < Math.hypot(curr.x - this.x, curr.y - this.y) ? prev : curr
                        );
                        const dist = Math.hypot(closest.x - this.x, closest.y - this.y);
                        forceX += (closest.x - this.x) / dist * 0.5;
                        forceY += (closest.y - this.y) / dist * 0.5;
                    }
                } else {
                    forceX += (Math.random() - 0.5) * 0.5;
                    forceY += (Math.random() - 0.5) * 0.5;
                }
            }
        }

        if (Math.abs(forceX) < 0.01 && Math.abs(forceY) < 0.01) {
            forceX += (Math.random() - 0.5) * 0.5;
            forceY += (Math.random() - 0.5) * 0.5;
        }

        this.vx += forceX * 0.1;
        this.vy += forceY * 0.1;

        this.vx *= 0.95;
        this.vy *= 0.95;
        const currentSpeed = Math.hypot(this.vx, this.vy);
        if (currentSpeed > this.speed) {
            this.vx = (this.vx / currentSpeed) * this.speed;
            this.vy = (this.vy / currentSpeed) * this.speed;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x > width) { this.x = width; this.vx *= -1; }
        if (this.y < 0) { this.y = 0; this.vy *= -1; }
        if (this.y > height) { this.y = height; this.vy *= -1; }

        if (currentSpeed > 0.1) {
            this.angle = Math.atan2(this.vy, this.vx);
        }

        // Metabolism - Dreno de calorías
        const frameDrain = this.metabolism * 0.05 + (currentSpeed * 0.02);
        this.energy -= frameDrain;

        // Healing biológico continuo
        if (this.health < this.maxHealth && this.energy > 300) {
            this.health += 0.2; // Cura lenta
            this.energy -= 0.5; // Consume alimento para curar
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (this.diet === "HERBIVORE") {
            ctx.fillStyle = this.isHidden ? "rgba(59, 130, 246, 0.3)" : "#3b82f6";
        } else if (this.diet === "CARNIVORE") {
            ctx.fillStyle = "#ef4444";
        } else if (this.diet === "SCAVENGER") {
            ctx.fillStyle = "#f59e0b";
        } else {
            ctx.fillStyle = "#555555";
        }

        ctx.strokeStyle = ctx.fillStyle;

        // Draw Defender Outline
        if (this.role === "DEFENDER" && this.diet !== "CORPSE") {
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            // Si además son agresivos, dibuja unos pinchos simulados
            if (this.trait === "AGGRESSIVE") {
                ctx.beginPath();
                ctx.moveTo(this.size * 2, 0);
                ctx.lineTo(this.size * 1.5, this.size * 0.5);
                ctx.lineTo(this.size * 1.5, -this.size * 0.5);
                ctx.fill();
            }
        }

        // Draw Breeder Vision Ring
        if (this.diet !== "CORPSE" && this.role === "BREEDER") {
            ctx.beginPath();
            ctx.arc(0, 0, this.senseRadius, 0, Math.PI * 2);
            ctx.globalAlpha = 0.05;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        // Draw Body Triangle
        ctx.beginPath();
        if (this.diet === "CORPSE") {
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();

            // Draw health bar for corpses (energy)
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(-this.size, -this.size - 5, (this.energy / (this.size * 50)) * (this.size * 2), 2);
        } else {
            ctx.moveTo(this.size * 1.5, 0);
            ctx.lineTo(-this.size, this.size);
            ctx.lineTo(-this.size, -this.size);
            ctx.closePath();
            ctx.fill();

            // Health Bar
            ctx.fillStyle = "rgba(40, 200, 40, 0.8)";
            ctx.fillRect(-this.size, -this.size - 5, (this.health / this.maxHealth) * (this.size * 2), 2);
        }

        // Speciation Halo
        if (this.species.startsWith("Neo-") && this.diet !== "CORPSE") {
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            ctx.stroke();
        }

        ctx.restore();
    }
}
