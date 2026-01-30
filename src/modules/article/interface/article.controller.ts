import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { CreateArticleUseCase } from "../use-cases/create-article.use-case";
import { GetArticleByIdUseCase } from "../use-cases/get-article-by-id.use-case";
import { Article } from "../domain/article.entity";
import { FindAllArticlesUseCase } from "../use-cases/find-all-articles.use-case";
import { EmbedArticleUseCase } from "../use-cases/embed-article.use-case";
import { JwtAuthGuard } from "../../auth/infra/jwt-auth.guard";

@Controller("articles")
export class ArticleController {
  constructor(
    private readonly createArticleUseCase: CreateArticleUseCase,
    private readonly getArticleByIdUseCase: GetArticleByIdUseCase,
    private readonly findAllArticlesUseCase: FindAllArticlesUseCase,
    private readonly embedArticleUseCase: EmbedArticleUseCase,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: Partial<Article>) {
    return this.createArticleUseCase.execute(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/embed")
  @HttpCode(HttpStatus.OK)
  async embed(@Param("id") id: string) {
    await this.embedArticleUseCase.execute(id);
    return { message: "Embedding generated and saved successfully" };
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.getArticleByIdUseCase.execute(id);
  }

  @Get()
  async findAll() {
    return this.findAllArticlesUseCase.execute();
  }
} 
