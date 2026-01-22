import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { IArticleRepository } from "../domain/article.repository.interface";
import { Article } from "../domain/article.entity";

@Injectable()
export class GetArticleByIdUseCase {
  constructor(
    @Inject(IArticleRepository)
    private readonly articleRepository: IArticleRepository
  ) {}

  async execute(id: string): Promise<Article> {
    const article = await this.articleRepository.findById(id);
    
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
  }
}
