import { Injectable } from "@nestjs/common";
import { BehaviorSubject } from "rxjs";
import { IFilterConnectedUser } from "../interfaces/filter-connected-user.interface";

interface ConnectedUser {
  userId: string;
  socketId: string;
}

@Injectable()
export class OnlineUserService {
  private connectedUsers$: BehaviorSubject<ConnectedUser[]> = new BehaviorSubject<ConnectedUser[]>([]);

  public addUser(userId: string, socketId: string) {
    const connectedUsers = this.connectedUsers$.getValue();
    const isUserExisting = connectedUsers.some(user => user.socketId === socketId);

    if (!isUserExisting) {
      const updatedUsers = [...connectedUsers, { userId, socketId }];
      this.connectedUsers$.next(updatedUsers);
    }
  }

  public removeUser(socketId: string) {
    const connectedUsers = this.connectedUsers$.getValue();
    const userIndex = connectedUsers.findIndex(user => user.socketId === socketId);

    if (userIndex !== -1) {
      const updatedUsers = [...connectedUsers.slice(0, userIndex), ...connectedUsers.slice(userIndex + 1)];
      this.connectedUsers$.next(updatedUsers);
    }
  }

  public isUserConnected(payload: IFilterConnectedUser): boolean {
    const { userId, socketId } = payload;
    const connectedUsers = this.connectedUsers$.getValue();
    return connectedUsers.some(user => {
      if (socketId) return user.socketId = socketId;
      if (userId) return user.userId = userId;
      return false;
    });
  }

  public getConnectedUser(payload: IFilterConnectedUser): ConnectedUser {
    const { userId, socketId } = payload;
    const connectedUsers = this.connectedUsers$.getValue();
    return connectedUsers.find(user => {
      if (socketId) return user.socketId = socketId;
      if (userId) return user.userId = userId;
      return false;
    });
  }
}
