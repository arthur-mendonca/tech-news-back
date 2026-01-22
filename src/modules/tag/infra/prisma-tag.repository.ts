import { Injectable } from "@nestjs/common";
import { ITagRepository } from "../domain/tag.repository.interface";
import { Tag } from "../domain/tag.entity";
import { PrismaService } from "../../../core/prisma/prisma.service";

@Injectable()
export class PrismaTagRepository implements ITagRepository {
  constructor(private prisma: PrismaService) {}

  async create(tagData: Partial<Tag>): Promise<Tag> {
    const created = await this.prisma.tag.create({
      data: {
        name: tagData.name!,
      },
    });
    return new Tag(created);
  }

  async findAll(): Promise<Tag[]> {
    const all = await this.prisma.tag.findMany();
    return all.map((t) => new Tag(t));
  }

  async findByName(name: string): Promise<Tag | null> {
    const found = await this.prisma.tag.findUnique({ where: { name } });
    return found ? new Tag(found) : null;
  }
}
