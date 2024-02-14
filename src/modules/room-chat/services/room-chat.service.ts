import { Injectable } from "@nestjs/common";
import { concatMap, from, lastValueFrom, map } from "rxjs";
import { tap } from "rxjs/operators";
import { RoomRepository } from "../repositories/room.repository";
import { GetRoomDto } from "../dtos/room/get-room.dto";
import { Room } from "../entities/room.entity";
import { IGetRoom } from "../interfaces/room/get-room.interface";
import { CreateRoomDto } from "../dtos/room/create-room.dto";
import { ICreateRoom } from "../interfaces/room/create-room.interface";
import { RoomMessageRepository } from "../repositories/room-message.repository";
import { ICreateRoomMessage } from "../interfaces/room-message/create-room-message.interface";
import { RoomMessage } from "../entities/room-message.entity";
import { IGetLimitedRoomMessage } from "../interfaces/room-message/get-limited-room-message.interface";
import { GetLimitedRoomMessageDto } from "../dtos/room-message/get-limited-room-message.dto";

@Injectable()
export class RoomChatService {
  constructor(private roomRepository: RoomRepository,
              private roomMessageRepository: RoomMessageRepository) {
  }

  public async getRoomById(roomId: string): Promise<Room> {
    return this.roomRepository.getRoomById(roomId);
  }

  public async getRooms(getRoomDto: GetRoomDto) {
    const { page, limit } = getRoomDto;
    let roomsCount: number;
    let rooms: Room[];

    const roomsCountStream$ = from(this.roomRepository.getRoomsCount());
    const getRoomsStream$ = () => concatMap(() => {
      const payload: IGetRoom = {
        page,
        limit
      };

      return from(this.roomRepository.getRooms(payload));
    });

    const execution$ = roomsCountStream$.pipe(
      getRoomsStream$(),
      map(() => ({
        roomsCount,
        rooms
      }))
    );

    return lastValueFrom(execution$);
  }

  public async getLimitedRoomMessages(getLimitedRoomMessageDto: GetLimitedRoomMessageDto) {
    const { roomId, limit } = getLimitedRoomMessageDto;
    let roomMessagesCount: number;
    let roomMessages: RoomMessage[];

    const roomMessagesCountStream$ = from(this.roomMessageRepository.getRoomMessagesCount(roomId)).pipe(
      tap((foundRoomMessagesCount: number) => roomMessagesCount = foundRoomMessagesCount)
    );
    const getLimitedRoomMessagesStream$ = () => concatMap(() => {
      const payload: IGetLimitedRoomMessage = {
        roomId,
        limit
      };

      return from(this.roomMessageRepository.getLimitedRoomMessages(payload)).pipe(
        tap((foundRoomMessages: RoomMessage[]) => roomMessages = foundRoomMessages)
      );
    });

    const execution$ = roomMessagesCountStream$.pipe(
      getLimitedRoomMessagesStream$(),
      map(() => ({
        roomMessagesCount,
        roomMessages
      }))
    );

    return lastValueFrom(execution$);
  }

  public async createRoom(createRoomDto: CreateRoomDto) {
    const { name, description } = createRoomDto;
    const payload: ICreateRoom = {
      name,
      description
    };

    return this.roomRepository.createRoom(payload);
  }

  public async createMessage(payload: ICreateRoomMessage) {
    return this.roomMessageRepository.createMessage(payload);
  }
}