import { Inject, Injectable } from "@nestjs/common";
import { ITagRepository } from "../domain/tag.repository.interface";
import { Tag } from "../domain/tag.entity";

@Injectable()
export class CreateTagUseCase {
  constructor(
    @Inject(ITagRepository)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(data: Partial<Tag>): Promise<Tag> {
    if (!data.name) {
      throw new Error("Name is required");
    }
    const existing = await this.tagRepository.findByName(data.name);
    if (existing) {
      throw new Error("Tag with this name already exists");
    }
    return this.tagRepository.create(data);
  }
}
