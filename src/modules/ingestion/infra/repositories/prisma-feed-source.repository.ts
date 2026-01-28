import { Injectable } from "@nestjs/common";
import { FeedSource } from "@prisma/client";
import { PrismaService } from "../../../../core/prisma/prisma.service";
import { IFeedSourceRepository } from "../../domain/repositories/feed-source.repository.interface";

@Injectable()
export class PrismaFeedSourceRepository implements IFeedSourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<FeedSource[]> {
    return this.prisma.feedSource.findMany({
      where: { isActive: true },
    });
  }
}
