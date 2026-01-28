import { Tag } from "../../tag/domain/tag.entity";

export class Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string | null;
  originalUrl: string;
  sourceUrls: string[];
  relevanceScore: number;
  published: boolean;
  createdAt: Date;
  tags?: Tag[];

  constructor(props: Partial<Article>) {
    Object.assign(this, props);
  }
}
