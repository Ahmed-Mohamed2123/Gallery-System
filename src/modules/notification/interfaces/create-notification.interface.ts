import { User } from "../../user/entities/user.entity";

export class ICreateNotification {
  title: string;
  content: string;
  user: User;
}