import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiSecurity } from "@nestjs/swagger";
import { UserSubscriptionDetailService } from "../services/user-subscription-detail.service";
import { RegisterUserSubscriptionDetailDto } from "../dtos/register-user-subscription-detail.dto";
import { AuthenticatedUser } from "../../../decorators/authenticated-user.decorator";
import { User } from "../entities/user.entity";
import { UserAuthGuard } from "../../../guards/user-auth.guard";

@ApiSecurity("API-KEY")
@Controller("user-subscription-details")
@UseGuards(UserAuthGuard)
export class UserSubscriptionDetailController {
  constructor(private userSubscriptionDetailService: UserSubscriptionDetailService) {
  }

  @ApiBody({ type: RegisterUserSubscriptionDetailDto, required: true })
  @Post("register-user-subscription-details")
  registerUserSubscriptionDetails(
    @AuthenticatedUser() user: User,
    @Body() registerUserSubscriptionDetailDto: RegisterUserSubscriptionDetailDto
  ) {
    return this.userSubscriptionDetailService.registerUserSubscriptionDetails(user, registerUserSubscriptionDetailDto);
  }
}