import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*"
  },
  path: "/gallery-system-api/events",
  transports: [
    "websocket",
    "flashsocket",
    "htmlfile",
    "xhr-polling",
    "jsonp-polling",
    "polling"
  ]
})
export class GlobalEventsGateway {
  @WebSocketServer()
  server: Server;

  public emitEvent(event: string, data: Record<string, any>) {
    this.server.emit(event, data);
  }
}
