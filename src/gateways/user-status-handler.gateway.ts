import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { IUserStatusEventData } from "./interfaces/user-status-event-data.interface";
import { OnlineUserService } from "../modules/user/services/online-user.service";
import { IFilterConnectedUser } from "../modules/user/interfaces/filter-connected-user.interface";
import {forwardRef, Inject} from "@nestjs/common";

@WebSocketGateway({
  cors: {
    origin: "*"
  },
  path: "/gallery-system-api/online-users",
  transports: [
    "websocket",
    "flashsocket",
    "htmlfile",
    "xhr-polling",
    "jsonp-polling",
    "polling"
  ]
})
export class UserStatusHandlerGateway {
  @WebSocketServer() private server: Record<string, any>;

  constructor(@Inject(forwardRef(() => OnlineUserService)) private onlineUserService: OnlineUserService) {
  }

  async handleConnection(client: Socket) {
    client.on("user-joined", ({ userId }: Record<string, any>) => {
      const connectedUserPayload: IFilterConnectedUser = {
        socketId: client.id
      };

      const isUserConnected = this.onlineUserService.isUserConnected(connectedUserPayload);

      if (!isUserConnected) {
        this.onlineUserService.addUser(userId, client.id);
      }

      this.server.emit("user-status", {
        userId: userId.toString(),
        status: true
      } as IUserStatusEventData);
    });
  }

  async handleDisconnect(client: Socket) {
    const disconnectedSocketId = client.id;
    const connectedUserPayload: IFilterConnectedUser = {
      socketId: disconnectedSocketId
    };

    const isUserConnected = this.onlineUserService.isUserConnected(connectedUserPayload);

    if (isUserConnected) {
      const connectedUser = this.onlineUserService.getConnectedUser(connectedUserPayload);

      this.server.emit("user-status", {
        userId: connectedUser.userId.toString(),
        status: false
      } as IUserStatusEventData);

      this.onlineUserService.removeUser(disconnectedSocketId);
    }
  }
}
