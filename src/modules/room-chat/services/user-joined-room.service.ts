import { Injectable } from "@nestjs/common";
import { from, lastValueFrom, map } from "rxjs";
import { UserJoinedRoomRepository } from "../repositories/user-joined-room.repository";
import { IJoinUserToRoom } from "../interfaces/user-joined-room/join-user-to-room.interface";
import { ICheckUserInRoomExistence } from "../interfaces/user-joined-room/check-user-in-room-existence.interface";

@Injectable()
export class UserJoinedRoomService {
  constructor(private userJoinedRoomRepository: UserJoinedRoomRepository) {
  }

  public async getUsersIntoRoom(roomId: string) {
    return this.userJoinedRoomRepository.getUsersIntoRoom(roomId);
  }

  public async checkUserInRoomExistence(checkUserInRoomExistence: ICheckUserInRoomExistence): Promise<boolean> {
    const { roomId, userId } = checkUserInRoomExistence;
    const execution$ = from(this.userJoinedRoomRepository.getUserRoomCount(roomId, userId)).pipe(
      map((count: number) => count > 0)
    );

    return lastValueFrom(execution$);
  }

  public async joinUserToRoom(joinUserToRoom: IJoinUserToRoom) {
    return this.userJoinedRoomRepository.joinUserToRoom(joinUserToRoom);
  }
}