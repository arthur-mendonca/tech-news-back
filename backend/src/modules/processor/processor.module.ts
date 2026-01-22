import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProcessorService } from './processor.service';
import { ProcessorConsumer } from './processor.consumer';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { ArticleModule } from '../article/article.module';
import { SearchService } from '../ingestion/services/search.service';
import { EnrichArticleUseCase } from '../ingestion/use-cases/enrich-article.use-case';
import { ScraperService } from '../ingestion/services/scraper.service';

@Module({
  imports: [
    PrismaModule,
    ArticleModule,
    BullModule.registerQueue({ name: 'article-processing' }),
  ],
  providers: [
    ProcessorService,
    ProcessorConsumer,
    SearchService,
    EnrichArticleUseCase,
    ScraperService,
  ],
  exports: [ProcessorService, BullModule, EnrichArticleUseCase],
})
export class ProcessorModule {}
