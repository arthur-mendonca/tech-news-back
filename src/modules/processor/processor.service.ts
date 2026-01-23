import { Injectable, Logger } from '@nestjs/common';
import { google } from '@ai-sdk/google';
import { generateObject, embed, generateText } from 'ai';
import { z } from 'zod';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Article } from '../article/domain/article.entity';
import { EnrichArticleUseCase } from '../ingestion/use-cases/enrich-article.use-case';
import { ScraperService } from '../ingestion/services/scraper.service';

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly enrichArticleUseCase: EnrichArticleUseCase,
    private readonly scraperService: ScraperService,
  ) { }

  async processArticle(article: Article): Promise<void> {
    this.logger.log(`🤖 Processing article: ${article.title}`);

    try {
      // 0. Enriquecimento (SearchService)
      let processingArticle = article;
      try {
        const enriched = await this.enrichArticleUseCase.execute(article.id);
        if (enriched) {
          processingArticle = enriched;
        }
      } catch (enrichError) {
        this.logger.error(`⚠️ Enrichment failed for ${article.title}, continuing...: ${enrichError}`);
      }

      // 1. Leitura (Scraping)
      // Coleta URLs: Original + Fontes encontradas (limitado a 4 para não estourar contexto/tempo)
      const urlsToScrape = [processingArticle.originalUrl, ...(processingArticle.sourceUrls || [])].slice(0, 4);
      this.logger.debug(`🕷️ Scraping ${urlsToScrape.length} URLs for context...`);

      const scrapedContents = await Promise.all(
        urlsToScrape.map(url => this.scraperService.scrape(url))
      );

      // Filtra falhas e concatena
      const fullContext = scrapedContents.filter(c => !!c).join('\n\n---\n\n');

      if (!fullContext) {
        this.logger.warn(`⚠️ No content scraped for ${article.title}. Using original summary.`);
      }

      // 2. Escrita (Writer Agent)
      this.logger.debug(`✍️ Generating article content...`);
      const { text: generatedContent } = await generateText({
        model: google('gemini-2.5-pro'),
        prompt: `
          Você é um jornalista de tecnologia sênior (TechCrunch, The Verge). 
          Com base no contexto abaixo (que pode conter múltiplas fontes sobre o mesmo assunto), 
          escreva um artigo completo, envolvente e informativo em Português do Brasil. 
          
          Diretrizes:
          - Use subtítulos, parágrafos curtos e tom profissional.
          - O artigo deve ter Introdução, Desenvolvimento e Conclusão.
          - Título deve ser criativo mas fiel aos fatos (não inclua no output, apenas o corpo do texto).
          - Se houver informações conflitantes nas fontes, mencione a divergência.
          - Mantenha o tom técnico, mas faça o artigo acessível para um público geral.
          - Mínimo de 400 palavras, máximo de 500 palavras.
          - Você deve entregar APENAS o artigo, jamais use frases de introdução como "aqui está o artigo" ou "este é o artigo".
          - Você NUNCA deve nomear as seções com nomes como "Introdução", "Desenvolvimento" ou "Conclusão".
          
          Contexto:
          ${fullContext || article.summary}
        `,
      });

      // 3. Gera Metadados (Tags, Resumo, Score) baseado no CONTEÚDO GERADO
      this.logger.debug(`🧠 Analyzing generated content for metadata...`);

      // Busca tags existentes para consistência
      const existingTags = await this.prisma.tag.findMany({
        select: { name: true },
      });
      const existingTagsMap = new Map(
        existingTags.map((t) => [t.name.toLowerCase(), t.name]),
      );

      const { object } = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: z.object({
          tags: z.array(z.string()).max(5),
          summary: z.string(),
          relevanceScore: z.number().min(0).max(100),
        }),
        prompt: `
          Analise o seguinte artigo de tecnologia JÁ ESCRITO e extraia as informações solicitadas.
          Título Original: ${article.title}
          Artigo Gerado: ${generatedContent}

          Lista de Tags Disponíveis: ${Array.from(existingTagsMap.values()).join(", ")}

          Gerar:
          - tags em Português (máx. 5) relacionadas ao tema;
          - um resumo jornalístico conciso em Português, com cerca de 2 parágrafos;
          - uma nota de relevância conforme o assunto, de 0 a 100, para um público de tecnologia (Desenvolvedores/Tech Leads/Entusiastas).

          Instruções para Tags:
          1. PRIORIDADE: Selecione tags da "Lista de Tags Disponíveis" se o assunto for o mesmo (ex: use 'Apple' se o texto diz 'Apple Inc' e 'Apple' está na lista).
          2. CRIAÇÃO: Apenas crie uma NOVA tag se o conceito for importante e NÃO existir na lista.
          3. FORMATO: Tags curtas, simples e em Title Case (ex: Startups, Typescript, AI).
        `,
      });

      this.logger.log(`🆗 AI Analysis complete for: ${article.title}. Score: ${object.relevanceScore}`);

      // Atualiza Artigo (Content, Resumo e Score)
      await this.prisma.article.update({
        where: { id: article.id },
        data: {
          content: generatedContent,
          summary: object.summary,
          relevanceScore: object.relevanceScore,
        },
      });

      // 4. Processa Tags (Upsert + Connect)
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
      // 5. Gerar Embedding (Vetorização)
      const { embedding, usage } = await embed({
        model: embeddingModel,
        value: `${article.title} \n ${object.summary}`,
      });
      this.logger.log(`-`.repeat(30));
      this.logger.log(`🆗 Embedding usage: ${JSON.stringify(usage)}`);
      this.logger.log(`-`.repeat(30));

      // 6. Salvar Embedding (SQL Puro para pgvector)
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
