export class Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  originalUrl: string;
  sourceUrls: string[];
  relevanceScore: number;
  published: boolean;
  createdAt: Date;

  constructor(props: Partial<Article>) {
    Object.assign(this, props);
  }
}
