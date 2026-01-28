import { Injectable } from "@nestjs/common";
import Parser from "rss-parser";
import { FeedItem, IFeedParserGateway } from "../../domain/gateways/feed-parser.gateway.interface";

@Injectable()
export class RssParserAdapter implements IFeedParserGateway {
  private readonly parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  async parseURL(url: string): Promise<FeedItem[]> {
    const feed = await this.parser.parseURL(url);
    return feed.items.map((item) => ({
      title: item.title || "",
      link: item.link || "",
      contentSnippet: item.contentSnippet,
      isoDate: item.isoDate,
      pubDate: item.pubDate,
    }));
  }
}
