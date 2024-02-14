import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiSecurity } from "@nestjs/swagger";
import { AuthenticatedUser } from "../../../decorators/authenticated-user.decorator";
import { User } from "../entities/user.entity";
import { UserService } from "../services/user.service";
import { UserAuthGuard } from "../../../guards/user-auth.guard";

@ApiSecurity("API-KEY")
@Controller("user")
export class UserController {
  constructor(private userService: UserService) {
  }

  @Get("user-main-data")
  @UseGuards(UserAuthGuard)
  getUserData(@AuthenticatedUser() user: User) {
    return this.userService.getUserMainData(user);
  }
}