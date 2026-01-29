import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CreateTagUseCase } from "../use-cases/create-tag.use-case";
import { GetTagsUseCase } from "../use-cases/get-tags.use-case";
import { Tag } from "../domain/tag.entity";
import { JwtAuthGuard } from "../../auth/infra/jwt-auth.guard";

@Controller("tags")
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(
    private readonly createTagUseCase: CreateTagUseCase,
    private readonly getTagsUseCase: GetTagsUseCase,
  ) {}

  @Post()
  async create(@Body() body: Partial<Tag>) {
    return this.createTagUseCase.execute(body);
  }

  @Get()
  async findAll() {
    return this.getTagsUseCase.execute();
  }
}
