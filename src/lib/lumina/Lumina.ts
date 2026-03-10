// src/lib/lumina/Lumina.ts

export class Lumina {
    x: number;
    y: number;
    vx: number;
    vy: number;

    maxForce: number = 0.05;
    maxSpeed: number = 2.5;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;

        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    flock(boids: Lumina[]) {
        let alignX = 0, alignY = 0;
        let cohesionX = 0, cohesionY = 0;
        let separationX = 0, separationY = 0;

        let total = 0;

        for (let other of boids) {
            const dist = Math.hypot(this.x - other.x, this.y - other.y);
            // Ignore self
            if (dist > 0 && dist < 50) {

                // Alignment
                alignX += other.vx;
                alignY += other.vy;

                // Cohesion
                cohesionX += other.x;
                cohesionY += other.y;

                // Separation
                if (dist < 25) {
                    const diffX = this.x - other.x;
                    const diffY = this.y - other.y;
                    separationX += diffX / (dist * dist);
                    separationY += diffY / (dist * dist);
                }

                total++;
            }
        }

        if (total > 0) {
            alignX /= total; alignY /= total;
            cohesionX /= total; cohesionY /= total;

            // Steer towards target cohesion
            cohesionX -= this.x; cohesionY -= this.y;

            // Normalize and limit cohesion & alignment forces
            const magA = Math.hypot(alignX, alignY) + 0.001;
            alignX = (alignX / magA) * this.maxSpeed - this.vx;
            alignY = (alignY / magA) * this.maxSpeed - this.vy;
            const magC = Math.hypot(cohesionX, cohesionY) + 0.001;
            cohesionX = (cohesionX / magC) * this.maxSpeed - this.vx;
            cohesionY = (cohesionY / magC) * this.maxSpeed - this.vy;
        }

        // Steer Separation
        const magS = Math.hypot(separationX, separationY) + 0.001;
        if (magS > 0.001) {
            separationX = (separationX / magS) * this.maxSpeed - this.vx;
            separationY = (separationY / magS) * this.maxSpeed - this.vy;
        }

        // Limit steering forces
        alignX = this.limit(alignX, alignY, this.maxForce).x * 1.0;
        alignY = this.limit(alignX, alignY, this.maxForce).y * 1.0;

        cohesionX = this.limit(cohesionX, cohesionY, this.maxForce).x * 1.0;
        cohesionY = this.limit(cohesionX, cohesionY, this.maxForce).y * 1.0;

        separationX = this.limit(separationX, separationY, this.maxForce).x * 1.5;
        separationY = this.limit(separationX, separationY, this.maxForce).y * 1.5;

        // Apply
        this.vx += alignX + cohesionX + separationX;
        this.vy += alignY + cohesionY + separationY;
    }

    addAttractor(targetX: number, targetY: number, pullForce: number) {
        let diffX = targetX - this.x;
        let diffY = targetY - this.y;
        const dist = Math.hypot(diffX, diffY) + 1;

        const forceMag = pullForce / dist;
        const magD = Math.hypot(diffX, diffY);
        diffX = (diffX / magD) * this.maxSpeed - this.vx;
        diffY = (diffY / magD) * this.maxSpeed - this.vy;

        const steer = this.limit(diffX, diffY, Math.abs(forceMag));

        this.vx += steer.x * Math.sign(pullForce); // Positivo atrae, Negativo repele
        this.vy += steer.y * Math.sign(pullForce);
    }

    update(width: number, height: number) {
        // Limit total speed
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        } else if (speed < 1.0) { // Keep them moving slightly
            this.vx = (this.vx / speed) * 1.0 || 1.0;
            this.vy = (this.vy / speed) * 1.0 || 0;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Space Wrapping
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw(ctx: CanvasRenderingContext2D, size: number, colorHsl: number) {
        const angle = Math.atan2(this.vy, this.vx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        ctx.fillStyle = `hsla(${colorHsl}, 80%, 60%, 0.8)`;
        ctx.beginPath();
        ctx.moveTo(size * 2, 0); // Punta
        ctx.lineTo(-size, size);
        ctx.lineTo(-size, -size);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    private limit(x: number, y: number, max: number) {
        const mag = Math.hypot(x, y);
        if (mag > max) {
            return { x: (x / mag) * max, y: (y / mag) * max };
        }
        return { x, y };
    }
}
