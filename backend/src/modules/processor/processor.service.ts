import { Injectable, Logger } from '@nestjs/common';
import { google } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Article } from '../article/domain/article.entity';

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);

  constructor(private readonly prisma: PrismaService) { }

  async processArticle(article: Article): Promise<void> {
    this.logger.log(`🤖 Processing article: ${article.title}`);

    try {
      const { output: object } = await generateText({
        model: google('gemini-2.0-flash'),
        output: Output.object({
          schema: z.object({
            tags: z.array(z.string()).max(5),
            summary: z.string(),
            relevanceScore: z.number().min(0).max(100),
          }),
        }),
        prompt: `
          Analise o seguinte artigo e extraia as informações solicitadas.
          Título: ${article.title}
          Conteúdo: ${article.content || article.summary}

          Gerar:
          - tags em Português (máx. 5) relacionadas ao tema de tecnologia;
          - um resumo jornalístico conciso em Português, com cerca de 2 parágrafos;
          - uma nota de relevância de 0 a 100 para um público de tecnologia (Desenvolvedores/Tech Leads).
        `,
      });

      this.logger.log(`🆗 AI Analysis complete for: ${article.title}. Score: ${object.relevanceScore}`);

      await this.prisma.article.update({
        where: { id: article.id },
        data: {
          summary: object.summary,
          relevanceScore: object.relevanceScore,
        },
      });

      if (object.tags && object.tags.length > 0) {
        for (const tagName of object.tags) {
          // Normalized tag name for consistency
          const normalizedTagName = tagName.trim();

          // Upsert Tag: create if not exists, do nothing if exists (we just need the ID to connect)
          // Since Prisma doesn't have a direct "findOrCreate" that returns the ID easily in one go without unique constraint error handling for race conditions,
          // upsert is the safe bet.
          const tag = await this.prisma.tag.upsert({
            where: { name: normalizedTagName },
            update: {}, // No updates if it exists
            create: { name: normalizedTagName },
          });

          // Connect tag to article
          await this.prisma.article.update({
            where: { id: article.id },
            data: {
              tags: {
                connect: { id: tag.id },
              },
            },
          });
        }
      }

      this.logger.log(`✅ Article updated successfully: ${article.title}`);

    } catch (error) {
      this.logger.error(`❌ Failed to process article ${article.id}: ${error}`);
      //Log error, do not break application.
    }
  }
}
