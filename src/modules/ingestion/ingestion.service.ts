import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Parser from 'rss-parser';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateArticleUseCase } from '../article/use-cases/create-article.use-case';

@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);
  private readonly parser: Parser;
  private hasRunOnce = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly createArticleUseCase: CreateArticleUseCase,
    @InjectQueue('article-processing') private readonly processingQueue: Queue,
  ) {
    this.parser = new Parser();
  }

  async onModuleInit() {
    if (this.hasRunOnce) {
      return;
    }
    await this.handleCron();
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  async handleCron() {
    if (this.hasRunOnce) {
      this.logger.log('RSS ingestion already executed once, skipping.');
      return;
    }
    this.hasRunOnce = true;
    this.logger.log('🤖 Starting RSS ingestion...');
    const sources = await this.prisma.feedSource.findMany({
      where: { isActive: true },
    });

    for (const source of sources) {
      this.logger.log(`🤖 Processing source: ${source.name} (${source.url})`);
      try {
        const feed = await this.parser.parseURL(source.url);

        for (const item of feed.items.slice(0, 5)) {
          try {
            if (!item.title || !item.link) {
              continue;
            }

            const slug = this.generateSlug(item.title);
            const publishedDate = item.isoDate ?
              new Date(item.isoDate) :
              (item.pubDate ?
                new Date(item.pubDate) :
                new Date());

            const articleData = {
              title: item.title,
              content: "",
              summary: item.contentSnippet || "",
              originalUrl: item.link,
              slug: slug,
              published: true,
              publishedAt: publishedDate,
              sourceUrls: [item.link],
              relevanceScore: 0,
            };

            const createdArticle = await this.createArticleUseCase.execute(articleData);
            this.logger.log(`Article created: ${item.title}`);

            try {
              await this.processingQueue.add('process-article', {
                articleId: createdArticle.id
              });
            } catch (error) {
              this.logger.error(`Error adding article to queue ${item.title}: ${error}`);
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
