import {PickType} from "@nestjs/swagger";
import {FollowerDto} from "./follower.dto";

export class FollowUserDto extends PickType(FollowerDto,
    ["followingUserId", "followerUserId"]) {
}