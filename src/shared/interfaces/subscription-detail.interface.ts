import { User } from "../../modules/user/entities/user.entity";

export interface ISubscriptionDetail {
  keys: {
    p256dh: string;
    auth: string;
  };
  endpoint: string;
  user: User;
}