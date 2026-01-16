import { Module } from "@nestjs/common";
import { ArticleController } from "./interface/article.controller";
import { CreateArticleUseCase } from "./use-cases/create-article.use-case";
import { PrismaArticleRepository } from "./infra/prisma-article.repository";
import { IArticleRepository } from "./domain/article.repository.interface";
import { PrismaModule } from "../../core/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ArticleController],
  providers: [
    CreateArticleUseCase,
    {
      provide: IArticleRepository,
      useClass: PrismaArticleRepository,
    },
  ],
  exports: [CreateArticleUseCase, IArticleRepository],
})
export class ArticleModule {}
