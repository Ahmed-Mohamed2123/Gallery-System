import { Column, Entity, ManyToOne } from "typeorm";
import { Room } from "./room.entity";
import { BaseDocument } from "../../../shared/database/base-document";
import { User } from "../../user/entities/user.entity";

@Entity("room-messages")
export class RoomMessage extends BaseDocument {
  @Column()
  content: string;

  @ManyToOne(() => User, user => user.groupSentMessages)
  sender: User;

  @Column()
  senderUserId: string;

  @ManyToOne(() => Room, room => room.messages)
  room: Room;

  @Column()
  roomId: string;
}
