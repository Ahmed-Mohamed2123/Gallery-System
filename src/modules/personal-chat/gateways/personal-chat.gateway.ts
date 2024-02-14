import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { concatMap, forkJoin, from, lastValueFrom, of } from "rxjs";
import { tap } from "rxjs/operators";
import { Socket } from "socket.io";
import { UserService } from "../../user/services/user.service";
import { PersonalChatService } from "../personal-chat.service";
import { ICreatePersonalChatMessage } from "../interfaces/create-personal-chat-message.interface";
import { User } from "../../user/entities/user.entity";
import { NotificationService } from "../../notification/notification.service";
import { OnlineUserService } from "../../user/services/online-user.service";
import { IFilterConnectedUser } from "../../user/interfaces/filter-connected-user.interface";
import { ICreateNotification } from "../../notification/interfaces/create-notification.interface";
import { UserSubscriptionDetail } from "../../user/entities/user-subscription-detail.entity";
import { ISubscriptionDetail } from "../../../shared/interfaces/subscription-detail.interface";
import { INotificationData } from "../../../shared/interfaces/notification-data.interface";
import { WebPushUtil } from "../../../shared/utils/web-push-util";
import {
  UserSubscriptionDetailService
} from "../../user/services/user-subscription-detail.service";

@WebSocketGateway({
  cors: {
    origin: "*"
  },
  path: "/gallery-system-api/personal-chat",
  transports: [
    "websocket",
    "flashsocket",
    "htmlfile",
    "xhr-polling",
    "jsonp-polling",
    "polling"
  ]
})
export class PersonalChatGateway {
  @WebSocketServer() private server: any;

  constructor(private personalChatService: PersonalChatService,
              private userService: UserService,
              private onlineUserService: OnlineUserService,
              private userSubscriptionDetailsService: UserSubscriptionDetailService,
              private notificationService: NotificationService) {
  }

  @SubscribeMessage("join-personal-room")
  handleJoinRoom(client: Socket, payload: any): void {
    const { senderId, receiverId } = payload;
    client.join(`personal-room:${senderId}-${receiverId}`);
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(client: Socket, payload: any) {
    const { senderUserId, receiverUserId, content } = payload;
    let senderUser: User;
    let receiverUser: User;
    let userSubscriptionDetails: UserSubscriptionDetail;
    let notificationData: { title: string; body: string };

    const usersStream$ = forkJoin([
      from(this.userService.getUserById(senderUserId)),
      from(this.userService.getUserById(receiverUserId))
    ]).pipe(
      tap(([senderUserData, receiverUserData]) => {
        senderUser = senderUserData;
        receiverUser = receiverUserData;
      })
    );

    const createMessageStream$ = () => concatMap(() => {
      const payload: ICreatePersonalChatMessage = {
        content,
        sender: senderUser,
        receiver: receiverUser
      };

      return from(this.personalChatService.createMessage(payload));
    });

    const sendSocketMessageStream$ = () => tap(() => {
      this.server.to(`personal-room:${senderUserId}-${receiverUserId}`).emit("personalMessage", {
        content,
        senderUser
      });
    });

    const sendSocketNotificationStream$ = () => tap(() => {
      this.server.to(`notification-${receiverUser.id}`, notificationData);
    });

    const createNotificationStream$ = () => concatMap(() => {
      const payload: ICreateNotification = {
        title: notificationData.title,
        content: notificationData.body,
        user: receiverUser
      };

      return from(this.notificationService.createNotification(payload));
    });

    const getReceiverUserSubscriptionDetailsStream$ = () => concatMap(() =>
      from(this.userSubscriptionDetailsService.getUserSubscriptionDetails(receiverUser.id)).pipe(
        tap((foundUserSubscriptionDetails: UserSubscriptionDetail) => userSubscriptionDetails = foundUserSubscriptionDetails)
      )
    );

    const sendWebPushNotificationStream$ = () => concatMap(() => {
      if (!userSubscriptionDetails) of(null);

      const { endpoint, keys } = userSubscriptionDetails;
      const subscriptionDetailPayload: ISubscriptionDetail = {
        endpoint,
        keys: {
          auth: keys["auth"],
          p256dh: keys["p256dh"]
        },
        user: receiverUser
      };

      const notificationPayload: INotificationData = {
        notification: {
          ...notificationData,
          icon: "icon"
        }
      };

      WebPushUtil.configureWebPush();
      return from(WebPushUtil.sendWebPushNotification(subscriptionDetailPayload, notificationPayload));
    });

    const execution$ = usersStream$.pipe(
      concatMap(() => {
        if (!senderUser && !receiverUser) return of(null);
        notificationData = {
          title: "Chat",
          body: `${receiverUser.username} sent a new message.`
        };

        const connectedUserPayload: IFilterConnectedUser = {
          userId: receiverUserId.toString()
        };

        const isConnectedUser = this.onlineUserService.isUserConnected(connectedUserPayload);

        if (isConnectedUser) {
          return of({}).pipe(
            createMessageStream$(),
            sendSocketMessageStream$(),
            sendSocketNotificationStream$()
          );
        }

        return of({}).pipe(
          createMessageStream$(),
          createNotificationStream$(),
          getReceiverUserSubscriptionDetailsStream$(),
          sendWebPushNotificationStream$()
        );
      })
    );

    return lastValueFrom(execution$);
  }
}
