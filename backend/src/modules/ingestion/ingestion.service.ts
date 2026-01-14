import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Parser from 'rss-parser';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateArticleUseCase } from '../article/use-cases/create-article.use-case';
import { ProcessorService } from '../processor/processor.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly parser: Parser;

  constructor(
    private readonly prisma: PrismaService,
    private readonly createArticleUseCase: CreateArticleUseCase,
    private readonly processorService: ProcessorService,
  ) {
    this.parser = new Parser();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    this.logger.log('🤖 Starting RSS ingestion...');
    const sources = await this.prisma.feedSource.findMany({
      where: { isActive: true },
    });

    for (const source of sources) {
      this.logger.log(`🤖 Processing source: ${source.name} (${source.url})`);
      try {
        const feed = await this.parser.parseURL(source.url);

        for (const item of feed.items) {
          try {
            if (!item.title || !item.link) {
              continue;
            }

            const slug = this.generateSlug(item.title);

            const articleData = {
              title: item.title,
              content: item.content || item.contentSnippet || '',
              summary: item.contentSnippet || '',
              originalUrl: item.link,
              slug: slug,
              published: true,
              sourceUrls: [item.link],
              relevanceScore: 0,
            };

            const createdArticle = await this.createArticleUseCase.execute(articleData);
            this.logger.log(`Article created: ${item.title}`);

            try {
              await this.processorService.processArticle(createdArticle);
            } catch (error) {
              this.logger.error(`Error processing article ${item.title}: ${error}`);
            }

          } catch (error) {
            if (error instanceof Error && (error.message.includes('already exists') || error.message.includes('Unique constraint'))) {
              this.logger.warn(`Article already exists: ${item.title}`);
            } else {
              this.logger.error(`Error processing item ${item.title}: ${error}`);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Error processing source ${source.name}: ${error}`);
      }
    }
    this.logger.log('RSS ingestion finished.');
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
