import { Body, Controller, Get, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiParam, ApiSecurity } from "@nestjs/swagger";
import { StoryViewService } from "../services/story-view.service";
import { User } from "../../user/entities/user.entity";
import { AuthenticatedUser } from "../../../decorators/authenticated-user.decorator";
import { RequiredParam } from "../../../decorators/required-param.decorator";
import { UserAuthGuard } from "../../../guards/user-auth.guard";

@ApiSecurity("API-KEY")
@Controller("story-view")
@UseGuards(UserAuthGuard)
export class StoryViewController {

  constructor(private userStoryService: StoryViewService) {
  }

  @ApiParam({ type: String, required: true, name: "storyId" })
  @Get(":storyId/view-status")
  checkIfUserViewedStory(@RequiredParam("storyId") storyId: string,
                         @AuthenticatedUser() user: User) {
    return this.userStoryService.checkIfUserViewedStory(storyId, user);
  }

  @ApiBody({ schema: { type: "object", properties: { storyId: { type: "string" } }, required: ["storyId"] } })
  @Post("register-story-view")
  createNewUserStory(@Body("storyId", ParseIntPipe) storyId: string,
                     @AuthenticatedUser() user: User) {
    return this.userStoryService.registerStoryView(storyId, user);
  }
}
