export interface IEmbeddingsGateway {
  generate(text: string): Promise<number[]>;
}

export const IEmbeddingsGateway = Symbol("IEmbeddingsGateway");
