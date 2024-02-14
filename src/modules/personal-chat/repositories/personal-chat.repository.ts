import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { PersonalChat } from "../entities/personal-chat.entity";
import { ICreatePersonalChatMessage } from "../interfaces/create-personal-chat-message.interface";
import {
  IGetPersonalChatMessage
} from "../interfaces/get-personal-chat-message.interface";

@Injectable()
export class PersonalChatRepository extends Repository<PersonalChat> {

  constructor(dataSource: DataSource) {
    super(PersonalChat, dataSource.createEntityManager());
  }

  public async getPersonalChatMessagesCount(payload: IGetPersonalChatMessage) {
    const { senderUserId, receiverUserId } = payload;
    return this.count({
      where: {
        senderUserId,
        receiverUserId
      }
    });
  }

  public async getLimitedPersonalChatMessages(payload: IGetPersonalChatMessage) {
    const { limit, senderUserId, receiverUserId } = payload;
    return this.find({
      where: {
        senderUserId,
        receiverUserId
      },
      take: limit,
      order: { createdAt: "ASC" },
      relations: ["senderUser", "receiver"]
    });
  }

  public async createMessage(payload: ICreatePersonalChatMessage): Promise<PersonalChat> {
    const createdPrivateMessage = this.create(payload);
    return createdPrivateMessage.save();
  }
}