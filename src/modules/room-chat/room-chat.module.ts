import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoomChatGateway } from "./gateways/room-chat.gateway";
import { UserModule } from "../user/user.module";
import { UserJoinedRoomService } from "./services/user-joined-room.service";
import { RoomChatService } from "./services/room-chat.service";
import { RoomRepository } from "./repositories/room.repository";
import { RoomMessageRepository } from "./repositories/room-message.repository";
import { UserJoinedRoomRepository } from "./repositories/user-joined-room.repository";
import { RoomChatController } from "./room-chat.controller";
import { Room } from "./entities/room.entity";
import { RoomMessage } from "./entities/room-message.entity";
import { UserJoinedRoom } from "./entities/user-joined-room.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Room,
      RoomMessage,
      UserJoinedRoom
    ]),
    UserModule
  ],
  providers: [
    RoomChatGateway,
    RoomChatService,
    UserJoinedRoomService,
    RoomRepository,
    RoomMessageRepository,
    UserJoinedRoomRepository
  ],
  controllers: [RoomChatController]
})
export class RoomChatModule {
}
