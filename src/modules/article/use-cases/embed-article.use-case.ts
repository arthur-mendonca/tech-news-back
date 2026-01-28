import { Inject, Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { IArticleRepository } from "../domain/article.repository.interface";
import { IEmbeddingsGateway } from "../../processor/domain/gateways/embeddings.gateway.interface";

@Injectable()
export class EmbedArticleUseCase {
  private readonly logger = new Logger(EmbedArticleUseCase.name);

  constructor(
    @Inject(IArticleRepository)
    private readonly articleRepository: IArticleRepository,
    @Inject(IEmbeddingsGateway)
    private readonly embeddingsGateway: IEmbeddingsGateway,
  ) { }

  async execute(articleId: string): Promise<void> {
    const article = await this.articleRepository.findById(articleId);

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    if (!article.content) {
      throw new BadRequestException(`Article with ID ${articleId} has no content to embed`);
    }

    this.logger.log(`------- Generating embedding for article: ${article.title} (${articleId}) -------`);

    try {
      const embedding = await this.embeddingsGateway.generate(article.content);

      await this.articleRepository.updateEmbedding(articleId, embedding);

      this.logger.log(`Embedding updated successfully for article ${articleId}`);
    } catch (error) {
      this.logger.error(`Failed to generate or save embedding for article ${articleId}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
