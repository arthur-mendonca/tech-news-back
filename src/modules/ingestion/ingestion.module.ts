import { Module, forwardRef } from "@nestjs/common";
import { IngestionService } from "./ingestion.service";
import { ArticleModule } from "../article/article.module";
import { PrismaModule } from "../../core/prisma/prisma.module";
import { ProcessorModule } from "../processor/processor.module";
import { IngestionController } from "./interface/ingestion.controller";
import { EnrichArticleUseCase } from "./use-cases/enrich-article.use-case";
import { IngestFeedUseCase } from "./use-cases/ingest-feed.use-case";
import { IScraperGateway } from "./domain/gateways/scraper.gateway.interface";
import { ISearchGateway } from "./domain/gateways/search.gateway.interface";
import { IFeedParserGateway } from "./domain/gateways/feed-parser.gateway.interface";
import { JinaScraperAdapter } from "./infra/adapters/jina-scraper.adapter";
import { DdgSearchAdapter } from "./infra/adapters/ddg-search.adapter";
import { RssParserAdapter } from "./infra/adapters/rss-parser.adapter";
import { IFeedSourceRepository } from "./domain/repositories/feed-source.repository.interface";
import { PrismaFeedSourceRepository } from "./infra/repositories/prisma-feed-source.repository";

@Module({
  imports: [ArticleModule, PrismaModule, forwardRef(() => ProcessorModule)],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    EnrichArticleUseCase,
    IngestFeedUseCase,
    {
      provide: IScraperGateway,
      useClass: JinaScraperAdapter,
    },
    {
      provide: ISearchGateway,
      useClass: DdgSearchAdapter,
    },
    {
      provide: IFeedParserGateway,
      useClass: RssParserAdapter,
    },
    {
      provide: IFeedSourceRepository,
      useClass: PrismaFeedSourceRepository,
    },
  ],
  exports: [
    IScraperGateway,
    ISearchGateway,
    IFeedParserGateway,
    IFeedSourceRepository,
    EnrichArticleUseCase,
    IngestFeedUseCase,
  ],
})
export class IngestionModule { }
