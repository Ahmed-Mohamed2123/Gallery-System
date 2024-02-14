import { FollowerDto } from "./follower.dto";
import { PickType } from "@nestjs/swagger";

export class UnfollowUserDto extends PickType(FollowerDto,
  ["followingUserId", "followerUserId"]) {

}