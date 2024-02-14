import {PickType} from "@nestjs/swagger";
import {FollowerDto} from "./follower.dto";

export class CheckUserFlowExistenceDto extends PickType(FollowerDto,
    ["followingUserId", "followerUserId"]) {
}