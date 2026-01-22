import { Injectable, Logger } from "@nestjs/common";
import { searchNews, SafeSearchType, SearchTimeType, NewsSearchResults } from "duck-duck-scrape";

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  async findRelatedArticles(title: string, originalUrl?: string): Promise<string[]> {
    try {
      let query = title;

      // Exclusão de domínio (mesma lógica anterior)
      if (originalUrl) {
        try {
          const domain = new URL(originalUrl).hostname.replace("www.", "");
          query = `${title} -site:${domain}`;
        } catch (e) {
          this.logger.error(`Error parsing URL ${originalUrl}: ${e}`);
        }
      }

      this.logger.debug(`Searching DDG for: ${query}`);

      const results = await this.searchWithRetry(query);

      if (!results.results || results.results.length === 0) {
        return [];
      }

      const blacklistDomains = [
        "facebook.com",
        "twitter.com",
        "instagram.com",
        "reddit.com",
        "youtube.com",
        "wikipedia.org",
        "x.com",
        "tiktok.com",
      ];

      const aggregatorDomains = ["msn.com"];

      const originalHostname = originalUrl ? this.safeHostname(originalUrl) : null;
      const originalPublisherKey = originalHostname
        ? this.publisherKeyFromHostname(originalHostname)
        : null;

      const filteredResults = results.results.filter((result) => {
        if (!result.url) return false;
        const hostname = this.safeHostname(result.url);
        if (!hostname) return false;

        if (blacklistDomains.some((domain) => hostname.includes(domain))) {
          return false;
        }

        if (originalHostname && hostname === originalHostname) {
          return false;
        }

        if (originalPublisherKey && this.isAggregatorDomain(hostname, aggregatorDomains)) {
          const syndicate = (result.syndicate || "").toLowerCase();
          if (syndicate.includes(originalPublisherKey)) {
            return false;
          }
        }

        return true;
      });

      const urls = filteredResults
        .map((result) => result.url)
        .filter((url): url is string => !!url)
        .slice(0, 3);

      return urls;
    } catch (error) {
      this.logger.error(`Search failed: ${error}`);
      return [];
    }
  }

  private async searchWithRetry(query: string, retries = 3): Promise<NewsSearchResults> {
    for (let i = 0; i < retries; i++) {
      this.logger.debug(`🟢 Search attempt ${i + 1} for query: ${query}`);
      try {
        return await searchNews(
          query,
          {
            safeSearch: SafeSearchType.OFF,
            time: SearchTimeType.YEAR,
          },
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
            },
          },
        );
      } catch (error) {
        const isLastAttempt = i === retries - 1;
        if (isLastAttempt) throw error;

        const delay = 1000 * Math.pow(2, i); // Exponential backoff: 1s, 2s, 4s
        this.logger.warn(
          `Search attempt ${i + 1} failed. Retrying in ${delay}ms... Error: ${error}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error(`Failed to search after ${retries} attempts`);
  }

  private safeHostname(rawUrl: string): string | null {
    try {
      const url = new URL(rawUrl);
      return url.hostname.toLowerCase();
    } catch {
      return null;
    }
  }

  private publisherKeyFromHostname(hostname: string): string {
    const parts = hostname.split(".").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0];
    return parts[parts.length - 2];
  }

  private isAggregatorDomain(hostname: string, aggregators: string[]): boolean {
    return aggregators.some((domain) => hostname.includes(domain));
  }
}
