import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { ProcessorService } from "./processor.service";
import { PrismaService } from "../../core/prisma/prisma.service";

@Processor("article-processing")
export class ProcessorConsumer extends WorkerHost {
  private readonly logger = new Logger(ProcessorConsumer.name);

  constructor(
    private readonly processorService: ProcessorService,
    private readonly prisma: PrismaService,
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
    this.logger.log(`Processing job ${job.id} for article ${job.data.articleId}`);
    try {
      const article = await this.prisma.article.findUnique({
        where: { id: job.data.articleId },
      });

      if (!article) {
        this.logger.error(`Article not found: ${job.data.articleId}`);
        return;
      }

      await this.processorService.processArticle(article);
      this.logger.log(`Job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${error}`);
      throw error;
    }
  }
}
