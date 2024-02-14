import { Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { AuthenticatedUser } from "../../decorators/authenticated-user.decorator";
import { User } from "../user/entities/user.entity";
import { UserAuthGuard } from "../../guards/user-auth.guard";
import { RequiredQuery } from "../../decorators/required-query.decorator";
import { RequiredParam } from "../../decorators/required-param.decorator";

@ApiSecurity("API-KEY")
@Controller("notifications")
@UseGuards(UserAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {
  }

  @ApiQuery({ name: "limit", type: Number, required: true })
  @Get("limited-user-notifications")
  getLimitedUserNotifications(
    @AuthenticatedUser() user: User,
    @RequiredQuery("limit") limit: number
  ) {
    return this.notificationService.getLimitedUserNotifications(user, limit);
  }

  @Put(":notificationId/set-user-notification-seen")
  setUserNotificationSeen(@RequiredParam("notificationId") notificationId: string) {
    return this.notificationService.setUserNotificationSeen(notificationId);
  }
}