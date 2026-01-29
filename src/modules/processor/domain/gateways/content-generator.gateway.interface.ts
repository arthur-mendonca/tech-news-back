export interface ContentGenerationResult {
  content: string;
  summary: string;
  tags: string[];
  relevanceScore: number;
}

export interface IContentGeneratorGateway {
  generateArticle(
    context: string,
    title: string,
    existingTags: string[],
  ): Promise<ContentGenerationResult>;
}

export const IContentGeneratorGateway = Symbol("IContentGeneratorGateway");
