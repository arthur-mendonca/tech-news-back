import { Article } from "../../../article/domain/article.entity";

export interface IArticleProcessorRepository {
  findById(id: string): Promise<Article | null>;
  updateProcessedArticle(
    id: string,
    data: {
      content: string;
      summary: string;
      relevanceScore: number;
      tags: string[];
    },
  ): Promise<void>;
  saveEmbedding(id: string, embedding: number[]): Promise<void>;
  getExistingTags(): Promise<string[]>;
}

export const IArticleProcessorRepository = Symbol("IArticleProcessorRepository");
