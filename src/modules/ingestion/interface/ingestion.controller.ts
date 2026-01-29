import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { EnrichArticleUseCase } from "../use-cases/enrich-article.use-case";
import { IngestionService } from "../ingestion.service";
import { JwtAuthGuard } from "../../auth/infra/jwt-auth.guard";

@Controller("ingestion")
@UseGuards(JwtAuthGuard)
export class IngestionController {
  constructor(
    private readonly enrichArticleUseCase: EnrichArticleUseCase,
    private readonly ingestionService: IngestionService
  ) { }

  @Post("trigger")
  async triggerIngestion() {
    // Force run even if disabled in env, since it's a manual trigger
    await this.ingestionService.runIngestion(true);
    return { message: "Ingestion process triggered successfully" };
  }

  @Post(":id/enrich")
  async enrich(@Param("id") id: string) {
    return await this.enrichArticleUseCase.execute(id);
  }
}
