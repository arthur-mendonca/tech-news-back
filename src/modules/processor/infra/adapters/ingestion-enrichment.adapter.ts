import { Injectable } from "@nestjs/common";
import { EnrichArticleUseCase } from "../../../ingestion/use-cases/enrich-article.use-case";
import { IEnrichmentGateway } from "../../domain/gateways/enrichment.gateway.interface";
import { Article } from "../../../article/domain/article.entity";

@Injectable()
export class IngestionEnrichmentAdapter implements IEnrichmentGateway {
  constructor(private readonly enrichArticleUseCase: EnrichArticleUseCase) { }

  async enrich(articleId: string): Promise<Article | null> {
    try {
      return await this.enrichArticleUseCase.execute(articleId);
    } catch {
      return null;
    }
  }
}
