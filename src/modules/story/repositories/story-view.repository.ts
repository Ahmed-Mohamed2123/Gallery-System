import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { StoryView } from "../entities/story-view.entity";
import { IRegisterStoryView } from "../interfaces/register-story-view.interface";
import { IFilterUserStoryViewCount } from "../interfaces/filter-user-story-view-count.interface";

@Injectable()
export class StoryViewRepository extends Repository<StoryView> {

  constructor(dataSource: DataSource) {
    super(StoryView, dataSource.createEntityManager());
  }

  public async getUserStoryViewsCount(payload: IFilterUserStoryViewCount) {
    const { userId, storyId } = payload;
    return this.count({
      where: {
        storyId,
        userId
      }
    });
  }

  public async registerStoryView(payload: IRegisterStoryView) {
    const storyViewer = this.create(payload);
    return storyViewer.save();
  }

  public async deleteStoryViewersByStoryId(storyId: string) {
    return this.createQueryBuilder("storyViewer")
      .where("storyId = :storyId", { storyId })
      .delete()
      .execute();
  }

}