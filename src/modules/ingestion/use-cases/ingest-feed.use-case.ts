import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { CreateArticleUseCase } from "../../article/use-cases/create-article.use-case";
import { IFeedParserGateway } from "../domain/gateways/feed-parser.gateway.interface";
import { IFeedSourceRepository } from "../domain/repositories/feed-source.repository.interface";

@Injectable()
export class IngestFeedUseCase {
  private readonly logger = new Logger(IngestFeedUseCase.name);

  constructor(
    @Inject(IFeedSourceRepository)
    private readonly feedSourceRepository: IFeedSourceRepository,
    private readonly createArticleUseCase: CreateArticleUseCase,
    @Inject(IFeedParserGateway)
    private readonly feedParserGateway: IFeedParserGateway,
    @InjectQueue("article-processing")
    private readonly processingQueue: Queue,
  ) { }

  async execute() {
    this.logger.log("🤖 Starting RSS ingestion...");
    const sources = await this.feedSourceRepository.findAllActive();

    for (const source of sources) {
      this.logger.log(`🤖 Processing source: ${source.name} (${source.url})`);
      try {
        const items = await this.feedParserGateway.parseURL(source.url);

        for (const item of items.slice(0, 5)) {
          try {
            if (!item.title || !item.link) {
              continue;
            }

            const slug = this.generateSlug(item.title);
            const publishedDate = item.isoDate
              ? new Date(item.isoDate)
              : item.pubDate
                ? new Date(item.pubDate)
                : new Date();

            const articleData = {
              title: item.title,
              content: "",
              summary: item.contentSnippet || "",
              originalUrl: item.link,
              slug: slug,
              publishedAt: publishedDate,
              sourceUrls: [item.link],
              relevanceScore: 0,
            };

            const createdArticle = await this.createArticleUseCase.execute(articleData);
            this.logger.log(`Article created: ${item.title}`);

            try {
              await this.processingQueue.add("process-article", {
                articleId: createdArticle.id,
              });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              this.logger.error(`Error adding article to queue ${item.title}: ${errorMessage}`);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (
              error instanceof Error &&
              (error.message.includes("already exists") ||
                error.message.includes("Unique constraint"))
            ) {
              this.logger.warn(`Article already exists: ${item.title}`);
            } else {
              this.logger.error(`Error processing item ${item.title}: ${errorMessage}`);
            }
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error processing source ${source.name}: ${errorMessage}`);
      }
    }
    this.logger.log("RSS ingestion finished.");
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
