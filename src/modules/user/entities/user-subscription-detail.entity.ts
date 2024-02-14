import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("user-subscription-details")
export class UserSubscriptionDetail extends BaseDocument {
  @Column()
  endpoint: string;

  @Column({ type: "json" })
  keys: object;

  @OneToOne(() => User, (user) => user.userSubscriptionDetails, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;
}