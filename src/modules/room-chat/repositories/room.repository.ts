import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Room } from "../entities/room.entity";
import { IGetRoom } from "../interfaces/room/get-room.interface";
import { ICreateRoom } from "../interfaces/room/create-room.interface";

@Injectable()
export class RoomRepository extends Repository<Room> {

  constructor(dataSource: DataSource) {
    super(Room, dataSource.createEntityManager());
  }

  public async getRoomById(roomId: string) {
    return this.findOne({
      where: {
        id: roomId
      }
    });
  }

  public async getRooms(payload: IGetRoom): Promise<Room[]> {
    const { limit, page } = payload;
    const skippedItems = limit * (page - 1);
    return this.createQueryBuilder("room")
      .orderBy("room.createdAt", "DESC")
      .offset(skippedItems)
      .limit(limit)
      .getMany();
  }

  public async getRoomsCount(): Promise<number> {
    return this.count();
  }

  public async createRoom(payload: ICreateRoom): Promise<Room> {
    const room = this.create({
      ...payload,
      messages: []
    });

    return room.save();
  }
}
