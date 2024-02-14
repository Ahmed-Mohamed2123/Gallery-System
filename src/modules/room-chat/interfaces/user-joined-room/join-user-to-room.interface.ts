import { User } from "../../../user/entities/user.entity";
import { Room } from "../../entities/room.entity";

export interface IJoinUserToRoom {
  user: User;
  room: Room;
}