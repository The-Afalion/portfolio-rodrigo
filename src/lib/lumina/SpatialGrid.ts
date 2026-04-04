// src/lib/lumina/SpatialGrid.ts

import { Lumina } from "./Lumina";

export class SpatialGrid {
    cellSize: number;
    cols: number;
    rows: number;
    grid: Lumina[][][];

    constructor(width: number, height: number, cellSize: number) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);

        // Inicializar grid 2D
        this.grid = new Array(this.cols);
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = new Array(this.rows);
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = [];
            }
        }
    }

    clear() {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j].length = 0; // Vaciado muy rapido
            }
        }
    }

    insert(particle: Lumina) {
        const col = Math.floor(particle.x / this.cellSize);
        const row = Math.floor(particle.y / this.cellSize);

        // Check bounds due to floating points right on edges
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            this.grid[col][row].push(particle);
        }
    }

    getNeighbors(particle: Lumina): Lumina[] {
        const col = Math.floor(particle.x / this.cellSize);
        const row = Math.floor(particle.y / this.cellSize);

        const neighbors: Lumina[] = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                // Wrap around logic (Mundo toroide / Pacman)
                let c = (col + i + this.cols) % this.cols;
                let r = (row + j + this.rows) % this.rows;

                neighbors.push(...this.grid[c][r]);
            }
        }

        return neighbors;
    }
}
