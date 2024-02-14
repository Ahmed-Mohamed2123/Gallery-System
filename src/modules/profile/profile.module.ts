import {forwardRef, Module} from "@nestjs/common";
import {MulterModule} from "@nestjs/platform-express";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ProfileService} from "./profile.service";
import {ProfileController} from "./profile.controller";
import {UserModule} from "../user/user.module";
import {ProfileRepository} from "./repositories/profile.repository";
import {Profile} from "./entities/profile.entity";
import {ImagePath} from "../../shared/enums/image-path.enum";
import {RedisCacheModule} from "../../cache/redis-cache.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Profile]),
        MulterModule.register({
            dest: ImagePath.PROFILE_IMAGE
        }),
        forwardRef(() => UserModule),
        RedisCacheModule
    ],
    providers: [
        ProfileService,
        ProfileRepository
    ],
    controllers: [ProfileController],
    exports: [ProfileService]
})
export class ProfileModule {
}
