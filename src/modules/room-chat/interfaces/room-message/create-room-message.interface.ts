import { User } from "../../../user/entities/user.entity";
import { Room } from "../../entities/room.entity";

export interface ICreateRoomMessage {
  content: string;
  sender: User;
  room: Room;
}