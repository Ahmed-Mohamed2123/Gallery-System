import { User } from "../../user/entities/user.entity";

export interface ICreateFollower {
  followerUser: User;
  followingUser: User;
}