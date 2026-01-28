import { FeedSource } from "@prisma/client";

export interface IFeedSourceRepository {
  findAllActive(): Promise<FeedSource[]>;
}

export const IFeedSourceRepository = Symbol("IFeedSourceRepository");
