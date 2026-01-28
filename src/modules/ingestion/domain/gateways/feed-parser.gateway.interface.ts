export interface FeedItem {
  title: string;
  link: string;
  contentSnippet?: string;
  isoDate?: string;
  pubDate?: string;
}

export interface IFeedParserGateway {
  parseURL(url: string): Promise<FeedItem[]>;
}

export const IFeedParserGateway = Symbol("IFeedParserGateway");
