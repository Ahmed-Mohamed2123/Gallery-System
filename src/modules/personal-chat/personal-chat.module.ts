import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PersonalChatGateway } from "./gateways/personal-chat.gateway";
import { PersonalChatService } from "./personal-chat.service";
import { PersonalChatRepository } from "./repositories/personal-chat.repository";
import { UserModule } from "../user/user.module";
import { NotificationModule } from "../notification/notification.module";
import { PersonalChatController } from "./personal-chat.controller";
import { PersonalChat } from "./entities/personal-chat.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonalChat
    ]),
    UserModule,
    NotificationModule,
  ],
  providers: [
    PersonalChatGateway,
    PersonalChatService,
    PersonalChatRepository
  ],
  controllers: [
    PersonalChatController
  ]
})
export class PersonalChatModule {
}