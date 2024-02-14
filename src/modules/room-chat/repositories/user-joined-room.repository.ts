import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UserJoinedRoom } from "../entities/user-joined-room.entity";
import { IJoinUserToRoom } from "../interfaces/user-joined-room/join-user-to-room.interface";

@Injectable()
export class UserJoinedRoomRepository extends Repository<UserJoinedRoom> {

  constructor(dataSource: DataSource) {
    super(UserJoinedRoom, dataSource.createEntityManager());
  }

  public async getUserRoomCount(roomId: string, userId: string) {
    return this.count({
      where: {
        roomId,
        userId
      }
    });
  }

  public async getUsersIntoRoom(roomId: string) {
    return this.find({
      where: {
        roomId
      }
    });
  }

  public async joinUserToRoom(joinUserToRoom: IJoinUserToRoom) {
    const createdUserJoinedRoom = this.create(joinUserToRoom);
    return createdUserJoinedRoom.save();
  }
}