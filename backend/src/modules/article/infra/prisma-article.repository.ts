import { Injectable } from '@nestjs/common';
import { IArticleRepository } from '../domain/article.repository.interface';
import { Article } from '../domain/article.entity';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class PrismaArticleRepository implements IArticleRepository {
    constructor(private prisma: PrismaService) { }

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
            }
        });
        return new Article(created);
    }

    async findBySlug(slug: string): Promise<Article | null> {
        const found = await this.prisma.article.findUnique({ where: { slug } });
        return found ? new Article(found) : null;
    }

    async findAll(): Promise<Article[]> {
        const all = await this.prisma.article.findMany();
        return all.map(a => new Article(a));
    }
}
