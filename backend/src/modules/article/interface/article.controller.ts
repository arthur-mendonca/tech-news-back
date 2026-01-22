import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateArticleUseCase } from "../use-cases/create-article.use-case";
import { GetArticleByIdUseCase } from "../use-cases/get-article-by-id.use-case";
import { Article } from "../domain/article.entity";

@Controller("articles")
export class ArticleController {
  constructor(
    private readonly createArticleUseCase: CreateArticleUseCase,
    private readonly getArticleByIdUseCase: GetArticleByIdUseCase
  ) {}

  @Post()
  async create(@Body() body: Partial<Article>) {
    return this.createArticleUseCase.execute(body);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.getArticleByIdUseCase.execute(id);
  }
}
