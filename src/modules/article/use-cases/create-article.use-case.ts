import { Inject, Injectable } from "@nestjs/common";
import { IArticleRepository } from "../domain/article.repository.interface";
import { Article } from "../domain/article.entity";

@Injectable()
export class CreateArticleUseCase {
  constructor(
    @Inject(IArticleRepository)
    private readonly articleRepository: IArticleRepository,
  ) {}

  async execute(data: Partial<Article>): Promise<Article> {
    if (!data.slug) {
      throw new Error("Slug is required");
    }
    const existing = await this.articleRepository.findBySlug(data.slug);
    if (existing) {
      throw new Error("Article with this slug already exists");
    }
    return this.articleRepository.create(data);
  }
}
