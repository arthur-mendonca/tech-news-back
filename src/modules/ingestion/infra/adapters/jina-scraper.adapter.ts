import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { IScraperGateway } from "../../domain/gateways/scraper.gateway.interface";

export interface JinaUsage {
  tokens: number;
}

export interface JinaContent {
  title: string;
  description: string;
  url: string;
  content: string;
  metadata?: Record<string, any>;
  external?: Record<string, any>;
  usage?: JinaUsage;
}

export interface JinaResponse {
  code: number;
  status: number;
  data: JinaContent;
  meta?: {
    usage: JinaUsage;
  };
}

@Injectable()
export class JinaScraperAdapter implements IScraperGateway {
  private readonly logger = new Logger(JinaScraperAdapter.name);
  private readonly jinaApiKey = process.env.JINA_API_KEY;

  async scrape(url: string): Promise<string> {
    try {
      this.logger.debug(`🕷️ Scraping URL: ${url}`);

      const { data } = await axios.get<JinaResponse>(`https://r.jina.ai/${url}`, {
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${this.jinaApiKey}`,
          Accept: "application/json",
          "X-Retain-Images": "none",
          "X-Target-Selector":
            ".article-content, .entry-content, .post-content, article, main, #main-content",
        },
      });

      if (data && data.code === 200 && data.data && data.data.content) {
        const cleanContent = data.data.content;
        const tokens = data.data.usage?.tokens || 0;
        this.logger.log(`✅ Scraped ${url} (${tokens} tokens). Length: ${cleanContent.length}`);
        return cleanContent;
      }

      this.logger.warn(`⚠️ Scrape success but no content found for ${url}`);
      return "";
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? "Unknown";
        const errorMessage = error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message;
        this.logger.warn(`❌ Failed to scrape ${url} [${status}]: ${errorMessage}`);
      } else {
        const err = error as Error;
        this.logger.warn(`❌ Failed to scrape ${url}: ${err.message}`);
      }
      return "";
    }
  }
}
