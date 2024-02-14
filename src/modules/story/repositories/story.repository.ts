import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Story } from "../entities/story.entity";
import { ICreateUserStory } from "../interfaces/create-user-story.interface";

@Injectable()
export class StoryRepository extends Repository<Story> {

  constructor(dataSource: DataSource) {
    super(Story, dataSource.createEntityManager());
  }

  public async getStoryById(storyId: string): Promise<Story> {
    return this.findOne({
      where: {
        id: storyId
      }
    });
  }

  public async getUserStory(storyId: string, userId: string): Promise<Story> {
    return this.findOne({
      where: {
        id: storyId,
        userId
      }
    });
  }

  public async getStoriesDetailsByUserId(userId: string) {
    return this.createQueryBuilder("story")
      .where("userId = :userId", { userId })
      .leftJoinAndSelect("story.storyViews", "storyView")
      .leftJoinAndSelect("storyView.user", "user")
      .getMany();
  }

  public async createUserStory(createUserStory: ICreateUserStory): Promise<Story> {
    const story = this.create(createUserStory);
    return story.save();
  }

  public async deleteStory(storyId: string) {
    return this.delete(storyId);
  }
}