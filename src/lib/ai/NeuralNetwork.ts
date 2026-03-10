// src/lib/ai/NeuralNetwork.ts
import { randomRange, tanh, sigmoid } from './math';

export class Level {
    inputs: number[];
    outputs: number[];
    weights: number[][]; // [inputIndex][outputIndex]
    biases: number[];

    constructor(inputCount: number, outputCount: number) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);
        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        // Iniciar el cerebro con valores aleatorios (-1 a 1)
        for (let i = 0; i < inputCount; i++) {
            for (let j = 0; j < outputCount; j++) {
                this.weights[i][j] = randomRange(-1, 1);
            }
        }
        for (let i = 0; i < outputCount; i++) {
            this.biases[i] = randomRange(-1, 1);
        }
    }

    // Alimentar la capa (Feed Forward)
    static feedForward(givenInputs: number[], level: Level, actFunc: 'sigmoid' | 'tanh') {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            if (sum > level.biases[i]) {
                level.outputs[i] = 1; // Simplificación de activación (Step func) si actFunc no es necesario o
                // Opcionalmente podemos usar las tanh/sigmoid para salidas suaves.
                // level.outputs[i] = actFunc === 'sigmoid' ? sigmoid(sum - level.biases[i]) : tanh(sum - level.biases[i]);
                // Para controles básicos de coche (W,A,S,D), step function (0 o 1) funciona perfecto.
            } else {
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }
}

export class NeuralNetwork {
    levels: Level[];

    constructor(neuronCounts: number[]) {
        this.levels = [];
        // Crear capas ocultas y de salida dinámicamente
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
        }
    }

    static feedForward(givenInputs: number[], network: NeuralNetwork) {
        let outputs = Level.feedForward(givenInputs, network.levels[0], 'tanh');
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i], 'tanh');
        }
        return outputs;
    }

    // Muta la red neuronal (Algoritmo Genético)
    static mutate(network: NeuralNetwork, amount: number = 0.1) {
        network.levels.forEach(level => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(level.biases[i], randomRange(-1, 1), amount);
            }
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(level.weights[i][j], randomRange(-1, 1), amount);
                }
            }
        });
    }

    // Clona una red neuronal estructuralmente igual
    static clone(network: NeuralNetwork): NeuralNetwork {
        const neuronCounts = [network.levels[0].inputs.length];
        for (let l of network.levels) {
            neuronCounts.push(l.outputs.length);
        }

        const cloneNet = new NeuralNetwork(neuronCounts);
        for (let i = 0; i < network.levels.length; i++) {
            for (let j = 0; j < network.levels[i].biases.length; j++) {
                cloneNet.levels[i].biases[j] = network.levels[i].biases[j];
            }
            for (let j = 0; j < network.levels[i].weights.length; j++) {
                for (let k = 0; k < network.levels[i].weights[j].length; k++) {
                    cloneNet.levels[i].weights[j][k] = network.levels[i].weights[j][k];
                }
            }
        }
        return cloneNet;
    }
}

function lerp(A: number, B: number, t: number): number {
    return A + (B - A) * t;
}
