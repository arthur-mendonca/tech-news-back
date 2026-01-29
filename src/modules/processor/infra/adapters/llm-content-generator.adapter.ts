import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { LLMService } from "../../../../core/llm/llm.service";
import {
  ContentGenerationResult,
  IContentGeneratorGateway,
} from "../../domain/gateways/content-generator.gateway.interface";

@Injectable()
export class LLMContentGeneratorAdapter implements IContentGeneratorGateway {
  constructor(private readonly llmService: LLMService) { }

  async generateArticle(
    context: string,
    title: string,
    existingTags: string[],
  ): Promise<ContentGenerationResult> {
    const { text: generatedContent } = await this.llmService.generateText({
      capability: "high-quality",
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
          - NUNCA responda nada além do artigo em si, não inclua frases além do artigo como "claro, aqui está o artigo".
          - Você NUNCA deve nomear as seções com nomes como "Introdução", "Desenvolvimento" ou "Conclusão".
          
          Contexto:
          ${context}
        `,
    });

    const { object } = await this.llmService.generateObject({
      capability: "fast",
      schema: z.object({
        tags: z.array(z.string()).max(5),
        summary: z.string(),
        relevanceScore: z.number().min(0).max(100),
      }),
      prompt: `
          Analise o seguinte artigo de tecnologia JÁ ESCRITO e extraia as informações solicitadas em um formato JSON estrito.
          Título Original: ${title}
          Artigo Gerado: ${generatedContent}

          Lista de Tags Disponíveis: ${existingTags.join(", ")}

          Você deve retornar OBRIGATORIAMENTE um objeto JSON com as seguintes chaves:
          - "tags": Um array de strings (máximo 5) com as categorias do artigo.
          - "summary": Uma string contendo um resumo jornalístico conciso em Português (cerca de 2 parágrafos).
          - "relevanceScore": Um número de 0 a 100 indicando a relevância para o público tech.

          Instruções para as chaves:
          1. "tags": PRIORIDADE para selecionar da "Lista de Tags Disponíveis". Se não houver, crie novas em Title Case.
          2. "summary": Deve ser profissional e informativo.
          3. "relevanceScore": Seja criterioso na pontuação.
        `,
    });

    return {
      content: generatedContent,
      summary: object.summary,
      tags: object.tags,
      relevanceScore: object.relevanceScore,
    };
  }
}
