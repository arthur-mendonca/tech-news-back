import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { ProcessArticleUseCase } from "./use-cases/process-article.use-case";

@Processor("article-processing")
export class ProcessorConsumer extends WorkerHost {
  private readonly logger = new Logger(ProcessorConsumer.name);

  constructor(
    private readonly processArticleUseCase: ProcessArticleUseCase,
  ) {
    super();
  }

  async process(job: Job<{ articleId: string }>): Promise<void> {
    if (job.name === "process-article") {
      await this.handleProcessArticle(job);
    } else {
      this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleProcessArticle(job: Job<{ articleId: string }>) {
    this.logger.log(`************ Processing job ${job.id} for article ${job.data.articleId} ************`);
    try {
      await this.processArticleUseCase.execute(job.data.articleId);
      this.logger.log(`************ Job ${job.id} completed ************`);
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${error}`);
      throw error;
    }
  }
}
