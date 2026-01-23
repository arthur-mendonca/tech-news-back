import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { IArticleRepository } from "../domain/article.repository.interface";
import { Article } from "../domain/article.entity";

@Injectable()
export class FindAllArticlesUseCase {
    constructor(
        @Inject(IArticleRepository)
        private readonly articleRepository: IArticleRepository
    ) { }

    async execute(): Promise<Article[]> {
        const articles = await this.articleRepository.findAll();

        if (!articles) {
            throw new NotFoundException(`No articles found`);
        }

        return articles;
    }
}
