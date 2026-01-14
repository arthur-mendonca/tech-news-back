import { Module } from "@nestjs/common";
import { TagController } from "./interface/tag.controller";
import { CreateTagUseCase } from "./use-cases/create-tag.use-case";
import { GetTagsUseCase } from "./use-cases/get-tags.use-case";
import { PrismaTagRepository } from "./infra/prisma-tag.repository";
import { ITagRepository } from "./domain/tag.repository.interface";
import { PrismaModule } from "../../core/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [TagController],
  providers: [
    CreateTagUseCase,
    GetTagsUseCase,
    {
      provide: ITagRepository,
      useClass: PrismaTagRepository,
    },
  ],
})
export class TagModule {}
