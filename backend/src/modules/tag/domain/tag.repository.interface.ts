import { Tag } from "./tag.entity";

export interface ITagRepository {
  create(tag: Partial<Tag>): Promise<Tag>;
  findAll(): Promise<Tag[]>;
  findByName(name: string): Promise<Tag | null>;
}

export const ITagRepository = Symbol("ITagRepository");
