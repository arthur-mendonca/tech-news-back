import { Injectable, Logger } from '@nestjs/common';
import { google } from '@ai-sdk/google';
import { generateObject, embed } from 'ai';
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
      // 1. Gera Tags, Resumo e Score
      const { object } = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: z.object({
          tags: z.array(z.string()).max(5),
          summary: z.string(),
          relevanceScore: z.number().min(0).max(100),
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

      // Atualiza Artigo (Resumo e Score)
      await this.prisma.article.update({
        where: { id: article.id },
        data: {
          summary: object.summary,
          relevanceScore: object.relevanceScore,
        },
      });

      // 2. Processa Tags (Upsert + Connect)
      if (object.tags && object.tags.length > 0) {
        for (const tagName of object.tags) {
          const normalizedTagName = tagName.trim();

          const tag = await this.prisma.tag.upsert({
            where: { name: normalizedTagName },
            update: {},
            create: { name: normalizedTagName },
          });

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

      const embeddingModel = google.embedding("text-embedding-004")

      this.logger.debug(` ▶️ Starting embedding`);
      // 3. Gerar Embedding (Vetorização)
      const { embedding, usage, response } = await embed({
        model: embeddingModel, // Modelo novo + chamada correta
        value: `${article.title} \n ${object.summary}`,
      });
      this.logger.log(`🆗 Embedding usage: ${JSON.stringify(usage)}`);
      this.logger.log(`🆗 Embedding response: ${JSON.stringify(response).slice(0, 100)}`);
      this.logger.debug(` ▶️ Embedding generated`);

      // 4. Salvar Embedding (SQL Puro para pgvector)
      this.logger.debug(` ▶️ Saving embedding for article: ${article.title}`);
      await this.prisma.$executeRaw`
        UPDATE "Article"
        SET embedding = ${JSON.stringify(embedding)}::vector
        WHERE id = ${article.id}
      `;
      this.logger.log(`🧬 Embedding generated and saved for: ${article.title}`);

      this.logger.log(`✅ Article updated successfully: ${article.title}`);

    } catch (error) {
      this.logger.error(`❌ Failed to process article ${article.id}: ${error}`);
    }
  }
}