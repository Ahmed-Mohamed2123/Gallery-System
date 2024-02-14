import {
  Column,
  Entity,
  ManyToOne, OneToMany
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { StoryView } from "./story-view.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("stories")
export class Story extends BaseDocument {
  @Column()
  content: string;

  @Column()
  imageUrl: string;

  @Column()
  createdAt: Date;

  @ManyToOne(type => User, user => user.story)
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => StoryView, StoryView => StoryView.story, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  storyViews: StoryView[];
}
