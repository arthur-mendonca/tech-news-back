import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../core/prisma/prisma.service";
import { IArticleProcessorRepository } from "../../domain/repositories/article-processor.repository.interface";
import { Article } from "../../../article/domain/article.entity";

@Injectable()
export class PrismaArticleProcessorRepository implements IArticleProcessorRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<Article | null> {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });
    return article as Article | null;
  }

  async updateProcessedArticle(
    id: string,
    data: {
      content: string;
      summary: string;
      relevanceScore: number;
      tags: string[];
    },
  ): Promise<void> {
    await this.prisma.article.update({
      where: { id },
      data: {
        content: data.content,
        summary: data.summary,
        relevanceScore: Math.round(data.relevanceScore),
        tags: {
          connectOrCreate: data.tags.map((tag) => ({
            where: { name: tag.trim() },
            create: { name: tag.trim() },
          })),
        },
      },
    });
  }

  async saveEmbedding(id: string, embedding: number[]): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "Article"
      SET embedding = ${JSON.stringify(embedding)}::vector
      WHERE id = ${id}
    `;
  }

  async getExistingTags(): Promise<string[]> {
    const tags = await this.prisma.tag.findMany({
      select: { name: true },
    });
    return tags.map((t) => t.name);
  }
}
