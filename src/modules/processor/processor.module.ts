import { Module, forwardRef } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IngestionModule } from "../ingestion/ingestion.module";
import { LLMModule } from "../../core/llm/llm.module";
import { ProcessorConsumer } from "./processor.consumer";
import { ProcessArticleUseCase } from "./use-cases/process-article.use-case";
import { IContentGeneratorGateway } from "./domain/gateways/content-generator.gateway.interface";
import { LLMContentGeneratorAdapter } from "./infra/adapters/llm-content-generator.adapter";
import { IEmbeddingsGateway } from "./domain/gateways/embeddings.gateway.interface";
import { GoogleEmbeddingsAdapter } from "./infra/adapters/google-embeddings.adapter";
import { IScraperGateway } from "./domain/gateways/scraper.gateway.interface";
import { IngestionScraperAdapter } from "./infra/adapters/ingestion-scraper.adapter";
import { IEnrichmentGateway } from "./domain/gateways/enrichment.gateway.interface";
import { IngestionEnrichmentAdapter } from "./infra/adapters/ingestion-enrichment.adapter";
import { IArticleProcessorRepository } from "./domain/repositories/article-processor.repository.interface";
import { PrismaArticleProcessorRepository } from "./infra/repositories/prisma-article-processor.repository";

@Module({
  imports: [
    forwardRef(() => IngestionModule),
    LLMModule,
    BullModule.registerQueue({ name: "article-processing" }),
  ],
  providers: [
    ProcessorConsumer,
    ProcessArticleUseCase,
    {
      provide: IContentGeneratorGateway,
      useClass: LLMContentGeneratorAdapter,
    },
    {
      provide: IEmbeddingsGateway,
      useClass: GoogleEmbeddingsAdapter,
    },
    {
      provide: IScraperGateway,
      useClass: IngestionScraperAdapter,
    },
    {
      provide: IEnrichmentGateway,
      useClass: IngestionEnrichmentAdapter,
    },
    {
      provide: IArticleProcessorRepository,
      useClass: PrismaArticleProcessorRepository,
    },
  ],
  exports: [ProcessArticleUseCase, BullModule],
})
export class ProcessorModule { }
