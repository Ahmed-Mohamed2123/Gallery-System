import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { concatMap, forkJoin, from, lastValueFrom, of } from "rxjs";
import { tap } from "rxjs/operators";
import { Socket } from "socket.io";
import { UserJoinedRoomService } from "../services/user-joined-room.service";
import { UserService } from "../../user/services/user.service";
import { ICheckUserInRoomExistence } from "../interfaces/user-joined-room/check-user-in-room-existence.interface";
import { User } from "../../user/entities/user.entity";
import { IJoinUserToRoom } from "../interfaces/user-joined-room/join-user-to-room.interface";
import { ICreateRoomMessage } from "../interfaces/room-message/create-room-message.interface";
import { RoomChatService } from "../services/room-chat.service";
import { Room } from "../entities/room.entity";

@WebSocketGateway({
  cors: {
    origin: "*"
  },
  path: "/gallery-system-api/room-chat",
  transports: [
    "websocket",
    "flashsocket",
    "htmlfile",
    "xhr-polling",
    "jsonp-polling",
    "polling"
  ]
})
export class RoomChatGateway {
  @WebSocketServer() private server: any;

  constructor(private roomChatService: RoomChatService,
              private userJoinedRoomService: UserJoinedRoomService,
              private userService: UserService) {
  }

  @SubscribeMessage("enter-chat-room")
  async enterChatRoom(client: Socket, data: Record<string, any>) {
    const { userId, roomId } = data;
    let userData: User;
    let roomData: Room;

    const userLookupStream$ = from(this.userService.getUserById(userId)).pipe(
      tap((foundUserData: User) => userData = foundUserData)
    );

    const getRoomDataStream$ = () => concatMap(() =>
      from(this.roomChatService.getRoomById(roomId)).pipe(
        tap((foundRoomData: Room) => roomData = foundRoomData)
      )
    );

    const checkUserInRoomExistenceStream$ = () => concatMap(() => {
      const payload: ICheckUserInRoomExistence = {
        userId,
        roomId
      };

      return from(this.userJoinedRoomService.checkUserInRoomExistence(payload));
    });

    const registerUserToRoomStream$ = () => concatMap(() => {
      const payload: IJoinUserToRoom = {
        room: roomData,
        user: userData
      };

      return from(this.userJoinedRoomService.joinUserToRoom(payload));
    });

    const handleUserJoinRoomStream$ = () => tap(() => {
      client.join(roomId.toString());
      this.server.broadcast.to(roomId.toString()
      ).emit("users-change", { userData, event: "joined" });
    });

    const execution$ = userLookupStream$.pipe(
      concatMap(() => {
        if (!userData) return of(null);
        return of({}).pipe(
          getRoomDataStream$(),
          checkUserInRoomExistenceStream$(),
          concatMap((isUserJoined: boolean) => {
            if (isUserJoined) {
              return of({}).pipe(
                handleUserJoinRoomStream$()
              );
            }

            return of({}).pipe(
              registerUserToRoomStream$(),
              handleUserJoinRoomStream$()
            );
          })
        );
      })
    );

    return lastValueFrom(execution$);
  }

  @SubscribeMessage("leave-room")
  async leaveRoom(client: Socket, data: Record<string, any>) {
    const { userId, roomId } = data;
    let userData: User;

    const userStream$ = from(this.userService.getUserById(userId)).pipe(
      tap((foundUserData: User) => userData = foundUserData)
    );
    const handleUserLeaveRoomStream$ = () => tap(() => {
      this.server.broadcast.to(roomId.toString()).emit("user-changed", {
        user: userData, event: "left"
      });
      client.leave(roomId.toString());
    });

    const execution$ = userStream$.pipe(
      concatMap(() => {
        if (!userData) return of(null);

        return of({}).pipe(
          handleUserLeaveRoomStream$()
        );
      })
    );

    return lastValueFrom(execution$);
  }

  @SubscribeMessage("add-room-message")
  async addMessage(client: Socket, data: Record<string, any>) {
    const { content, roomId, senderId } = data;

    const senderUserStream$ = from(this.userService.getUserById(senderId));
    const roomStream$ = from(this.roomChatService.getRoomById(roomId));

    const checkUserInRoomExistenceStream$ = () => concatMap(() => {
      const payload: ICheckUserInRoomExistence = {
        userId: senderId,
        roomId
      };

      return from(this.userJoinedRoomService.checkUserInRoomExistence(payload));
    });

    const createMessageStream$ = (senderData: User, roomData: Room) => concatMap(() => {
      const payload: ICreateRoomMessage = {
        content,
        sender: senderData,
        room: roomData
      };

      return from(this.roomChatService.createMessage(payload));
    });

    const handleSendMessageStream$ = (senderData: User) => tap(() => {
      this.server.to(roomId.toString()).emit("room-message", {
        content,
        senderData
      });
    });

    const execution$ = forkJoin([
      senderUserStream$,
      roomStream$
    ]).pipe(
      concatMap(([senderData, roomData]) => {
        if (!senderData && !roomData) return of(null);

        return of({}).pipe(
          checkUserInRoomExistenceStream$(),
          concatMap(isUserInRoom => {
            if (!isUserInRoom) return of(null);

            return of({}).pipe(
              createMessageStream$(senderData as User, roomData as Room),
              handleSendMessageStream$(senderData as User)
            );
          })
        );
      })
    );

    return lastValueFrom(execution$);
  }
}
