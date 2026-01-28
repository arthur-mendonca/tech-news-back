import { Injectable } from "@nestjs/common";
import { google } from "@ai-sdk/google";
import { embed } from "ai";
import { IEmbeddingsGateway } from "../../domain/gateways/embeddings.gateway.interface";

@Injectable()
export class GoogleEmbeddingsAdapter implements IEmbeddingsGateway {
  async generate(text: string): Promise<number[]> {
    const embeddingModel = google.embedding("text-embedding-004");
    const { embedding } = await embed({
      model: embeddingModel,
      value: text,
    });
    return embedding;
  }
}
