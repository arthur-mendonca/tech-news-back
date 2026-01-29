export interface IScraperGateway {
  scrape(url: string): Promise<string>;
}

export const IScraperGateway = Symbol("IScraperGateway");
