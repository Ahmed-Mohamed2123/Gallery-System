import { Column, Entity, ManyToOne } from "typeorm";
import { BaseDocument } from "../../../shared/database/base-document";
import { Room } from "./room.entity";
import { User } from "../../user/entities/user.entity";

@Entity("users-joined-rooms")
export class UserJoinedRoom extends BaseDocument {
  @ManyToOne(type => Room, room => room.usersJoinedRooms)
  room: Room;

  @Column()
  roomId: string;

  @ManyToOne(type => User, user => user.usersJoinedRooms)
  user: User;

  @Column()
  userId: string;
}