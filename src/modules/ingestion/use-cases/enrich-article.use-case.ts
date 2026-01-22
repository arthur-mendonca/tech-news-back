import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IArticleRepository } from "../../article/domain/article.repository.interface";
import { SearchService } from "../services/search.service";
import { Article } from "../../article/domain/article.entity";

@Injectable()
export class EnrichArticleUseCase {
  private readonly logger = new Logger(EnrichArticleUseCase.name);

  constructor(
    @Inject(IArticleRepository)
    private readonly articleRepository: IArticleRepository,
    private readonly searchService: SearchService,
  ) {}

  async execute(articleId: string): Promise<Article> {
    const article = await this.articleRepository.findById(articleId);

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    this.logger.log(`Enriching article: ${article.title}`);

    const relatedUrls = await this.searchService.findRelatedArticles(
      article.title,
      article.originalUrl,
    );

    if (relatedUrls.length === 0) {
      this.logger.warn(`No related articles found for: ${article.title}`);
      return article;
    }

    const filteredUrls = relatedUrls.filter((url) => url && url !== article.originalUrl);
    const uniqueNewUrls = [...new Set(filteredUrls)];

    const currentUrls = article.sourceUrls || [];
    let allUrls = [...new Set([...currentUrls, ...uniqueNewUrls])];

    // Final safety check: ensure originalUrl is NOT in the list
    if (article.originalUrl) {
      allUrls = allUrls.filter((u) => u !== article.originalUrl);
    }

    // Ensure we have at least 2 sources if possible (best effort warning)
    if (allUrls.length < 2) {
      this.logger.warn(
        `Could not find enough unique sources for article ${article.title}. Found: ${allUrls.length}`,
      );
    }

    const updatedArticle = await this.articleRepository.update(articleId, {
      sourceUrls: allUrls,
    });

    this.logger.log(`Article enriched with ${uniqueNewUrls.length} new sources`);
    return updatedArticle;
  }
}
