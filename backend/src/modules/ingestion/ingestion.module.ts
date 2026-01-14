import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ArticleModule } from '../article/article.module';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { ProcessorModule } from '../processor/processor.module';

@Module({
  imports: [
    ArticleModule,
    PrismaModule,
    ProcessorModule,
  ],
  providers: [IngestionService],
})
export class IngestionModule { }
