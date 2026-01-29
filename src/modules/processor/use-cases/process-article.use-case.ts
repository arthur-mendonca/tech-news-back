import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  IContentGeneratorGateway,
} from "../domain/gateways/content-generator.gateway.interface";
import { IEmbeddingsGateway } from "../domain/gateways/embeddings.gateway.interface";
import { IScraperGateway } from "../domain/gateways/scraper.gateway.interface";
import { IEnrichmentGateway } from "../domain/gateways/enrichment.gateway.interface";
import {
  IArticleProcessorRepository,
} from "../domain/repositories/article-processor.repository.interface";

@Injectable()
export class ProcessArticleUseCase {
  private readonly logger = new Logger(ProcessArticleUseCase.name);

  constructor(
    @Inject(IArticleProcessorRepository)
    private readonly repository: IArticleProcessorRepository,
    @Inject(IEnrichmentGateway)
    private readonly enrichmentGateway: IEnrichmentGateway,
    @Inject(IScraperGateway)
    private readonly scraperGateway: IScraperGateway,
    @Inject(IContentGeneratorGateway)
    private readonly contentGenerator: IContentGeneratorGateway,
    @Inject(IEmbeddingsGateway)
    private readonly embeddingsGateway: IEmbeddingsGateway,
  ) { }

  async execute(articleId: string): Promise<void> {
    const article = await this.repository.findById(articleId);
    if (!article) {
      this.logger.error(`Article not found: ${articleId}`);
      return;
    }

    this.logger.log(`🤖 Processing article: ${article.title}`);

    try {
      // 0. Enriquecimento
      let processingArticle = article;
      const enriched = await this.enrichmentGateway.enrich(articleId);
      if (enriched) {
        processingArticle = enriched;
      }

      // 1. Leitura (Scraping)
      const urlsToScrape = [
        processingArticle.originalUrl,
        ...(processingArticle.sourceUrls || []),
      ].slice(0, 4);

      this.logger.debug(`🕷️ Scraping ${urlsToScrape.length} URLs for context...`);
      const scrapedContents = await Promise.all(
        urlsToScrape.map((url) => this.scraperGateway.scrape(url)),
      );

      const fullContext = scrapedContents.filter((c) => !!c).join("\n\n---\n\n");
      const finalContext = fullContext || processingArticle.summary;

      if (!fullContext) {
        this.logger.warn(`⚠️ No content scraped for ${article.title}. Using summary.`);
      }

      // 2 & 3. Geração de Conteúdo e Metadados
      this.logger.debug(`✍️ Generating content and metadata...`);
      const existingTags = await this.repository.getExistingTags();
      const generationResult = await this.contentGenerator.generateArticle(
        finalContext,
        article.title,
        existingTags,
      );

      // 4. Atualiza Artigo e Tags
      await this.repository.updateProcessedArticle(articleId, generationResult);

      // 5. Gerar Embedding
      this.logger.debug(`▶️ Generating embedding...`);
      const embedding = await this.embeddingsGateway.generate(
        `${article.title} \n ${generationResult.summary}`,
      );

      // 6. Salvar Embedding
      await this.repository.saveEmbedding(articleId, embedding);

      this.logger.log(`✅ Article processed successfully: ${article.title}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Failed to process article ${articleId}: ${errorMessage}`);
      throw error;
    }
  }
}
