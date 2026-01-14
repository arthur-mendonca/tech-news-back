import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ArticleModule } from '../article/article.module';
import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [
    ArticleModule,
    PrismaModule,
  ],
  providers: [IngestionService],
})
export class IngestionModule {}
