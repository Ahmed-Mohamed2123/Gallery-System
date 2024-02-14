import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("personal-chats")
export class PersonalChat extends BaseDocument {
  @Column()
  content: string;

  @ManyToOne(() => User, user => user.personalSentMessages)
  @JoinColumn({ name: "senderUserId" })
  senderUser: User;

  @Column()
  senderUserId: string;

  @ManyToOne(() => User, user => user.personalReceivedMessages)
  @JoinColumn({ name: "receiverUserId" })
  receiverUser: User;

  @Column()
  receiverUserId: string;
}