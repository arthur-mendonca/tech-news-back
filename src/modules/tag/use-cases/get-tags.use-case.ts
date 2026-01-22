import { Inject, Injectable } from "@nestjs/common";
import { ITagRepository } from "../domain/tag.repository.interface";
import { Tag } from "../domain/tag.entity";

@Injectable()
export class GetTagsUseCase {
  constructor(
    @Inject(ITagRepository)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(): Promise<Tag[]> {
    return this.tagRepository.findAll();
  }
}
