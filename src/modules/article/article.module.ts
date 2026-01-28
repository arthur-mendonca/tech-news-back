import { Module, forwardRef } from "@nestjs/common";
import { ArticleController } from "./interface/article.controller";
import { CreateArticleUseCase } from "./use-cases/create-article.use-case";
import { GetArticleByIdUseCase } from "./use-cases/get-article-by-id.use-case";
import { PrismaArticleRepository } from "./infra/prisma-article.repository";
import { IArticleRepository } from "./domain/article.repository.interface";
import { PrismaModule } from "../../core/prisma/prisma.module";
import { FindAllArticlesUseCase } from "./use-cases/find-all-articles.use-case";
import { EmbedArticleUseCase } from "./use-cases/embed-article.use-case";
import { ProcessorModule } from "../processor/processor.module";

@Module({
  imports: [PrismaModule, forwardRef(() => ProcessorModule)],
  controllers: [ArticleController],
  providers: [
    CreateArticleUseCase,
    FindAllArticlesUseCase,
    GetArticleByIdUseCase,
    EmbedArticleUseCase,
    {
      provide: IArticleRepository,
      useClass: PrismaArticleRepository,
    },
  ],
  exports: [CreateArticleUseCase, GetArticleByIdUseCase, IArticleRepository],
})
export class ArticleModule { }
