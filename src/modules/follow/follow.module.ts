import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {FollowService} from "./follow.service";
import {FollowController} from "./follow.controller";
import {UserModule} from "../user/user.module";
import {FollowRepository} from "./repositories/follow.repository";
import {Follow} from "./entities/follow.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Follow]),
        forwardRef(() => UserModule)
    ],
    providers: [FollowService, FollowRepository],
    controllers: [FollowController],
    exports: [FollowService]
})
export class FollowModule {
}
