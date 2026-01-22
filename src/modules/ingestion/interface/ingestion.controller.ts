import { Controller, Param, Post } from "@nestjs/common";
import { EnrichArticleUseCase } from "../use-cases/enrich-article.use-case";

@Controller("articles")
export class IngestionController {
  constructor(private readonly enrichArticleUseCase: EnrichArticleUseCase) {}

  @Post(":id/enrich")
  async enrich(@Param("id") id: string) {
    return this.enrichArticleUseCase.execute(id);
  }
}
