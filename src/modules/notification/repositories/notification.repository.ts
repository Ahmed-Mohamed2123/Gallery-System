import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Notification } from "../entities/notification.entity";
import { ICreateNotification } from "../interfaces/create-notification.interface";

@Injectable()
export class NotificationRepository extends Repository<Notification> {

  constructor(dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }

  public async getUserNotificationsCount(userId: string) {
    return this.count({ where: { userId } });
  }

  public async getLimitedUserNotifications(userId: string, limit: number) {
    return this.createQueryBuilder("notification")
      .where({
        userId
      })
      .orderBy("notification.createdAt", "DESC")
      .limit(limit)
      .getMany();
  }

  public async createNotification(payload: ICreateNotification) {
    const createdNotification = this.create(payload);
    return createdNotification.save();
  }

  public async setUserNotificationSeen(notificationId: string) {
    return this.update(notificationId, {
      isSeen: true
    });
  }
}