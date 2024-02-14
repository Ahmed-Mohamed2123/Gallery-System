import { User } from "../../user/entities/user.entity";

export interface ICreatePersonalChatMessage {
  content: string;
  sender: User;
  receiver: User;
}