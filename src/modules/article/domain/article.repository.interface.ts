import { Article } from "./article.entity";
import { PaginationParams, PaginatedResult } from "../../../shared/interfaces/pagination.interface";

export interface IArticleRepository {
  create(article: Partial<Article>): Promise<Article>;
  findById(id: string): Promise<Article | null>;
  update(id: string, article: Partial<Article>): Promise<Article>;
  findBySlug(slug: string): Promise<Article | null>;
  findAll(params: PaginationParams): Promise<PaginatedResult<Article>>;
  updateEmbedding(id: string, embedding: number[]): Promise<void>;
}

export const IArticleRepository = Symbol("IArticleRepository");
