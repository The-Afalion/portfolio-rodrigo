import * as tf from "@tensorflow/tfjs";

export class NeuralNetwork {
  model: tf.Sequential;
  inputNodes: number;
  outputNodes: number;

  static modelCount = 0; // Contador estático para nombres únicos

  constructor(inputNodes: number, outputNodes: number) {
    this.inputNodes = inputNodes;
    this.outputNodes = outputNodes;
    this.model = this.createModel();
    NeuralNetwork.modelCount++; // Incrementar el contador con cada nuevo cerebro
  }

  // Crea un modelo de red neuronal secuencial con nombres de capa únicos
  createModel(): tf.Sequential {
    const model = tf.sequential();
    const modelId = NeuralNetwork.modelCount;

    // Capa oculta
    model.add(tf.layers.dense({
      name: `hidden_layer_${modelId}`, // Nombre único
      inputShape: [this.inputNodes],
      units: 10,
      activation: "sigmoid",
    }));
    // Capa de salida
    model.add(tf.layers.dense({
      name: `output_layer_${modelId}`, // Nombre único
      units: this.outputNodes,
      activation: "tanh",
    }));
    return model;
  }

  // Predice una acción a partir de las entradas (sensores)
  predict(inputs: number[]): number[] {
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs) as tf.Tensor;
      const outputs = ys.dataSync();
      return Array.from(outputs);
    });
  }

  // Muta los pesos de la red neuronal para la evolución
  mutate(rate: number) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        const tensor = weights[i];
        const shape = tensor.shape;
        const values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (Math.random() < rate) {
            values[j] += Math.random() * 2 - 1;
          }
        }
        const newTensor = tf.tensor(values, shape);
        mutatedWeights.push(newTensor);
      }
      this.model.setWeights(mutatedWeights);
    });
  }

  // Copia la red neuronal (para crear descendencia)
  copy(): NeuralNetwork {
    return tf.tidy(() => {
      const newNetwork = new NeuralNetwork(this.inputNodes, this.outputNodes);
      const weights = this.model.getWeights();
      const weightCopies = weights.map(tensor => tensor.clone());
      newNetwork.model.setWeights(weightCopies);
      return newNetwork;
    });
  }
}
