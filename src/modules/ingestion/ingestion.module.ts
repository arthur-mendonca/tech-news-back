import { Module } from "@nestjs/common";
import { IngestionService } from "./ingestion.service";
import { ArticleModule } from "../article/article.module";
import { PrismaModule } from "../../core/prisma/prisma.module";
import { ProcessorModule } from "../processor/processor.module";
import { IngestionController } from "./interface/ingestion.controller";
import { ScraperService } from "./services/scraper.service";

@Module({
  imports: [ArticleModule, PrismaModule, ProcessorModule],
  controllers: [IngestionController],
  providers: [IngestionService, ScraperService],
  exports: [ScraperService],
})
export class IngestionModule {}
