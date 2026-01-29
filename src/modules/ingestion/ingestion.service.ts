import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { IngestFeedUseCase } from "./use-cases/ingest-feed.use-case";

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly ingestFeedUseCase: IngestFeedUseCase,
  ) {}

  @Cron(CronExpression.EVERY_10_HOURS)
  async handleCron() {
    await this.runIngestion(false);
  }

  async runIngestion(force = false) {
    const isEnabled = this.configService.get<string>("INGESTION_ENABLED") === "true";
    if (!isEnabled && !force) {
      this.logger.warn("🚫 RSS ingestion skipped: INGESTION_ENABLED is not true.");
      return;
    }

    this.logger.log(`🤖 Triggering ingestion... ${force ? "(Manual Trigger)" : ""}`);
    await this.ingestFeedUseCase.execute();
  }
}
