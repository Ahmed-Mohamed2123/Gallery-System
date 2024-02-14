import { Column, Entity, OneToMany } from "typeorm";
import { BaseDocument } from "../../../shared/database/base-document";
import { RoomMessage } from "./room-message.entity";
import { UserJoinedRoom } from "./user-joined-room.entity";

@Entity("rooms")
export class Room extends BaseDocument {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(type => RoomMessage, roomMessage => roomMessage.room, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  messages: RoomMessage[];

  @OneToMany(type => UserJoinedRoom, userJoinedRoom => userJoinedRoom.room, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  usersJoinedRooms: UserJoinedRoom[];
}
