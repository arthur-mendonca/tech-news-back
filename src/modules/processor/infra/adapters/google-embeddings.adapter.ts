import { Injectable, Logger } from "@nestjs/common";
import { embed } from "ai";
import { IEmbeddingsGateway } from "../../domain/gateways/embeddings.gateway.interface";
import { google } from "@ai-sdk/google";

@Injectable()
export class GoogleEmbeddingsAdapter implements IEmbeddingsGateway {
  private readonly logger = new Logger(GoogleEmbeddingsAdapter.name);

  async generate(text: string): Promise<number[]> {
    try {
      const embeddingModel = google.embedding("gemini-embedding-001");

      const { embedding } = await embed({
        model: embeddingModel,
        value: text,
      });

      return embedding;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
