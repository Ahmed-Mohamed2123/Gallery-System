import { Body, Controller, Delete, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiSecurity } from "@nestjs/swagger";
import { FollowService } from "./follow.service";
import { GetFollowerDto } from "./dtos/get-follower.dto";
import { CheckUserFlowExistenceDto } from "./dtos/check-user-flow-existence.dto";
import { UnfollowUserDto } from "./dtos/unfollow-user.dto";
import { FollowUserDto } from "./dtos/follow-user.dto";
import { UserAuthGuard } from "../../guards/user-auth.guard";

@ApiSecurity("API-KEY")
@Controller("follow")
@UseGuards(UserAuthGuard)
export class FollowController {
  constructor(private followerService: FollowService) {
  }

  @ApiBody({ type: CheckUserFlowExistenceDto, required: true })
  @Get("check-user-flow-existence")
  checkUserFlowExistence(@Body() checkUserFlowExistenceDto: CheckUserFlowExistenceDto) {
    return this.followerService.checkUserFlowExistence(checkUserFlowExistenceDto);
  }

  @ApiBody({ type: GetFollowerDto, required: true })
  @Post("followers")
  getFollowers(@Body() followerDto: GetFollowerDto) {
    return this.followerService.getPaginatedFollowers(followerDto);
  }

  @ApiBody({ type: FollowUserDto, required: true })
  @Post("follow-user")
  followUser(@Body() followUserDto: FollowUserDto) {
    return this.followerService.followUser(followUserDto);
  }

  @ApiBody({ type: UnfollowUserDto, required: true })
  @Delete("unfollow-user")
  unfollowUser(@Body() unfollowUserDto: UnfollowUserDto) {
    return this.followerService.unfollowUser(unfollowUserDto);
  }
}
