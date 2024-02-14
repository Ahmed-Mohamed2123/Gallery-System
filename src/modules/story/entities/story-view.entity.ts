import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Story } from "./story.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("story-view")
export class StoryView extends BaseDocument {
  @ManyToOne(() => User, user => user.storyViews)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Story, story => story.storyViews)
  story: Story;

  @Column()
  storyId: string;
}
