import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("follow")
export class Follow extends BaseDocument {
  @ManyToOne(() => User, user => user.following)
  @JoinColumn()
  followerUser: User;

  @Column()
  followerUserId: string;

  @ManyToOne(() => User, user => user.followers)
  @JoinColumn()
  followingUser: User;

  @Column()
  followingUserId: string;
}
