import { Article } from "./article.entity";

export interface IArticleRepository {
  create(article: Partial<Article>): Promise<Article>;
  findById(id: string): Promise<Article | null>;
  update(id: string, article: Partial<Article>): Promise<Article>;
  findBySlug(slug: string): Promise<Article | null>;
  findAll(): Promise<Article[]>;
}

export const IArticleRepository = Symbol("IArticleRepository");
