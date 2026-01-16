import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ArticleModule } from '../article/article.module';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { ProcessorModule } from '../processor/processor.module';
import { SearchService } from './services/search.service';
import { EnrichArticleUseCase } from './use-cases/enrich-article.use-case';
import { IngestionController } from './interface/ingestion.controller';

@Module({
  imports: [
    ArticleModule,
    PrismaModule,
    ProcessorModule,
  ],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    SearchService,
    EnrichArticleUseCase,
  ],
})
export class IngestionModule { }
