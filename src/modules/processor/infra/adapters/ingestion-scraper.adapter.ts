import { Inject, Injectable } from "@nestjs/common";
import { IScraperGateway as IngestionScraperGateway } from "../../../ingestion/domain/gateways/scraper.gateway.interface";
import { IScraperGateway } from "../../domain/gateways/scraper.gateway.interface";

@Injectable()
export class IngestionScraperAdapter implements IScraperGateway {
  constructor(
    @Inject(IngestionScraperGateway)
    private readonly scraperGateway: IngestionScraperGateway,
  ) { }

  async scrape(url: string): Promise<string | null> {
    try {
      return await this.scraperGateway.scrape(url);
    } catch {
      return null;
    }
  }
}
