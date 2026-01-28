import { Module } from "@nestjs/common";
import { ArticleController } from "./interface/article.controller";
import { CreateArticleUseCase } from "./use-cases/create-article.use-case";
import { GetArticleByIdUseCase } from "./use-cases/get-article-by-id.use-case";
import { PrismaArticleRepository } from "./infra/prisma-article.repository";
import { IArticleRepository } from "./domain/article.repository.interface";
import { PrismaModule } from "../../core/prisma/prisma.module";
import { FindAllArticlesUseCase } from "./use-cases/find-all-articles.use-case";

@Module({
  imports: [PrismaModule],
  controllers: [ArticleController],
  providers: [
    CreateArticleUseCase,
    FindAllArticlesUseCase,
    GetArticleByIdUseCase,
    {
      provide: IArticleRepository,
      useClass: PrismaArticleRepository,
    },
  ],
  exports: [CreateArticleUseCase, GetArticleByIdUseCase, IArticleRepository],
})
export class ArticleModule { }
