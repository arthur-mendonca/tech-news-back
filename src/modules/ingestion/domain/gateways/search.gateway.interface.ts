export interface ISearchGateway {
  findRelatedArticles(title: string, originalUrl?: string): Promise<string[]>;
}

export const ISearchGateway = Symbol("ISearchGateway");
