import { Injectable } from "@nestjs/common";
import { PersonalChatRepository } from "./repositories/personal-chat.repository";
import { concatMap, from, lastValueFrom, map } from "rxjs";
import { tap } from "rxjs/operators";
import { GetLimitedPersonalChatMessageDto } from "./dtos/get-limited-personal-chat-message.dto";
import {
  IGetPersonalChatMessage
} from "./interfaces/get-personal-chat-message.interface";
import { PersonalChat } from "./entities/personal-chat.entity";
import { ICreatePersonalChatMessage } from "./interfaces/create-personal-chat-message.interface";

@Injectable()
export class PersonalChatService {
  constructor(private personalChatRepository: PersonalChatRepository) {
  }

  public async getLimitedPersonalChatMessages(getLimitedPersonalChatMessageDto: GetLimitedPersonalChatMessageDto) {
    const { limit, senderUserId, receiverUserId } = getLimitedPersonalChatMessageDto;
    let personalChatMessagesCount: number;
    let personalChatMessages: PersonalChat[];

    const personalChatMessagesPayload: IGetPersonalChatMessage = {
      senderUserId,
      receiverUserId,
      limit
    };

    const personalChatMessagesCountStream$ = from(this.personalChatRepository.getPersonalChatMessagesCount(personalChatMessagesPayload)).pipe(
      tap((foundPersonalChatMessagesCount: number) => personalChatMessagesCount = foundPersonalChatMessagesCount)
    );

    const getPersonalChatMessagesStream$ = () => concatMap(() =>
      from(this.personalChatRepository.getLimitedPersonalChatMessages(personalChatMessagesPayload)).pipe(
        tap((foundPersonalChatMessages: PersonalChat[]) => personalChatMessages = foundPersonalChatMessages)
      ));

    const execution$ = personalChatMessagesCountStream$.pipe(
      getPersonalChatMessagesStream$(),
      map(() => ({
        personalChatMessagesCount,
        personalChatMessages
      }))
    );

    return lastValueFrom(execution$);
  }

  public async createMessage(payload: ICreatePersonalChatMessage) {
    return this.personalChatRepository.createMessage(payload);
  }
}