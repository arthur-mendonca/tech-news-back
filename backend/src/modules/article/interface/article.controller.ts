import { Body, Controller, Post } from '@nestjs/common';
import { CreateArticleUseCase } from '../use-cases/create-article.use-case';
import { Article } from '../domain/article.entity';

@Controller('articles')
export class ArticleController {
    constructor(private readonly createArticleUseCase: CreateArticleUseCase) { }

    @Post()
    async create(@Body() body: Partial<Article>) {
        return this.createArticleUseCase.execute(body);
    }
}
