import { Article } from "../../../article/domain/article.entity";

export interface IEnrichmentGateway {
  enrich(articleId: string): Promise<Article | null>;
}

export const IEnrichmentGateway = Symbol("IEnrichmentGateway");
