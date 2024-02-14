import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { RoomMessage } from "../entities/room-message.entity";
import { IGetLimitedRoomMessage } from "../interfaces/room-message/get-limited-room-message.interface";
import { ICreateRoomMessage } from "../interfaces/room-message/create-room-message.interface";

@Injectable()
export class RoomMessageRepository extends Repository<RoomMessage> {

  constructor(dataSource: DataSource) {
    super(RoomMessage, dataSource.createEntityManager());
  }

  public async getRoomMessagesCount(roomId: string): Promise<number> {
    return this.count({
      where: {
        roomId
      }
    });
  }

  public getLimitedRoomMessages(getLimitedRoomMessage: IGetLimitedRoomMessage): Promise<RoomMessage[]> {
    const { limit, roomId } = getLimitedRoomMessage;
    return this.createQueryBuilder("roomMessage")
      .where({
        roomId
      })
      .orderBy("roomMessage.createdAt", "DESC")
      .limit(limit)
      .leftJoinAndSelect("roomMessage.sender", "sender")
      .getMany();
  }

  public async createMessage(payload: ICreateRoomMessage) {
    const createdRoomMessage = this.create(payload);
    return createdRoomMessage.save();
  }
}