import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("notifications")
export class Notification extends BaseDocument {

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({
    default: true
  })
  isSeen: boolean;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @Column()
  userId: string;
}