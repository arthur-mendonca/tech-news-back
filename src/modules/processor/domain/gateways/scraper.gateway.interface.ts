export interface IScraperGateway {
  scrape(url: string): Promise<string | null>;
}

export const IScraperGateway = Symbol("IScraperGateway");
