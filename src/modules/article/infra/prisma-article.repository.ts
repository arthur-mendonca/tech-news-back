import { Injectable } from "@nestjs/common";
import { IArticleRepository } from "../domain/article.repository.interface";
import { Article } from "../domain/article.entity";
import { PrismaService } from "../../../core/prisma/prisma.service";

@Injectable()
export class PrismaArticleRepository implements IArticleRepository {
  constructor(private prisma: PrismaService) {}

  async create(articleData: Partial<Article>): Promise<Article> {
    const created = await this.prisma.article.create({
      data: {
        title: articleData.title!,
        slug: articleData.slug!,
        summary: articleData.summary!,
        content: articleData.content!,
        originalUrl: articleData.originalUrl!,
        sourceUrls: articleData.sourceUrls || [],
        relevanceScore: articleData.relevanceScore || 0,
        published: articleData.published || false,
      },
    });
    return new Article(created);
  }

  async findById(id: string): Promise<Article | null> {
    const found = await this.prisma.article.findUnique({
      where: { id },
      include: { tags: true },
    });
    return found ? new Article({ ...found, content: found.content }) : null;
  }

  async update(id: string, articleData: Partial<Article>): Promise<Article> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tags, ...data } = articleData;

    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        ...data,
      },
      include: { tags: true },
    });
    return new Article({ ...updated, content: updated.content });
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const found = await this.prisma.article.findUnique({
      where: { slug },
      include: { tags: true },
    });
    return found ? new Article({ ...found, content: found.content }) : null;
  }

  async findAll(): Promise<Article[]> {
    const all = await this.prisma.article.findMany({
      include: { tags: true },
    });
    return all.map((a) => new Article({ ...a, content: a.content }));
  }

  async updateEmbedding(id: string, embedding: number[]): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "Article"
      SET embedding = ${JSON.stringify(embedding)}::vector
      WHERE id = ${id}
    `;
  }
}
