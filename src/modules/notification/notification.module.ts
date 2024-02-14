import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationRepository } from "./repositories/notification.repository";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { Notification } from "./entities/notification.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification])
  ],
  controllers: [
    NotificationController
  ],
  providers: [
    NotificationService,
    NotificationRepository
  ],
  exports: [
    NotificationService
  ]
})
export class NotificationModule {
}