import {forwardRef, Module} from "@nestjs/common";
import { GlobalEventsGateway } from "./global-events.gateway";
import { UserStatusHandlerGateway } from "./user-status-handler.gateway";
import { UserModule } from "../modules/user/user.module";

@Module({
  imports: [
    forwardRef(() => UserModule)
  ],
  providers: [
    GlobalEventsGateway,
    UserStatusHandlerGateway
  ],
  exports: [
    GlobalEventsGateway,
    UserStatusHandlerGateway
  ]
})
export class GatewaysModule {
}
