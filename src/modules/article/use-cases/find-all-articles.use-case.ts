import { Injectable, Inject } from "@nestjs/common";
import { IArticleRepository } from "../domain/article.repository.interface";
import { Article } from "../domain/article.entity";
import { PaginationParams, PaginatedResult } from "../../../shared/interfaces/pagination.interface";

@Injectable()
export class FindAllArticlesUseCase {
    constructor(
        @Inject(IArticleRepository)
        private readonly articleRepository: IArticleRepository
    ) { }

    async execute(params: PaginationParams): Promise<PaginatedResult<Article>> {
        return this.articleRepository.findAll(params);
    }
}
