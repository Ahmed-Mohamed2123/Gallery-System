import { Injectable } from "@nestjs/common";
import { concatMap, from, lastValueFrom, map } from "rxjs";
import { tap } from "rxjs/operators";
import { NotificationRepository } from "./repositories/notification.repository";
import { ICreateNotification } from "./interfaces/create-notification.interface";
import { Notification } from "./entities/notification.entity";
import { User } from "../user/entities/user.entity";

@Injectable()
export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {
  }

  public async getLimitedUserNotifications(user: User, limit: number) {
    const userId = user.id;
    let userNotificationsCount: number;
    let userNotifications: Notification[];

    const userNotificationsCountStream$ = from(this.notificationRepository.getUserNotificationsCount(userId)).pipe(
      tap((count: number) => userNotificationsCount = count)
    );

    const getLimitedUserNotificationsStream$ = () => concatMap(() =>
      from(this.notificationRepository.getLimitedUserNotifications(userId, limit)).pipe(
        tap((foundUserNotifications: Notification[]) => userNotifications = foundUserNotifications)
      )
    );

    const execution$ = userNotificationsCountStream$.pipe(
      getLimitedUserNotificationsStream$(),
      map(() => ({
        userNotificationsCount,
        userNotifications
      }))
    );

    return lastValueFrom(execution$);
  }

  public async createNotification(createNotification: ICreateNotification) {
    return this.notificationRepository.createNotification(createNotification);
  }

  public async setUserNotificationSeen(notificationId: string) {
    return this.notificationRepository.setUserNotificationSeen(notificationId);
  }
}