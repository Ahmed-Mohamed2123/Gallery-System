import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserService} from "./services/user.service";
import {UserRepository} from "./repositories/user.repository";
import {ProfileModule} from "../profile/profile.module";
import {FavoriteModule} from "../favorite/favorite.module";
import {GalleryModule} from "../gallery/gallery.module";
import {FollowModule} from "../follow/follow.module";
import {UserController} from "./controllers/user.controller";
import {OnlineUserService} from "./services/online-user.service";
import {User} from "./entities/user.entity";
import {UserSubscriptionDetail} from "./entities/user-subscription-detail.entity";
import {UserSubscriptionDetailService} from "./services/user-subscription-detail.service";
import {UserSubscriptionDetailRepository} from "./repositories/user-subscription-detail.repository";
import {UserSubscriptionDetailController} from "./controllers/user-subscription-detail.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserSubscriptionDetail]),
        forwardRef(() => ProfileModule),
        forwardRef(() => GalleryModule),
        forwardRef(() => FavoriteModule),
        forwardRef(() => UserModule)
    ],
    providers: [
        UserService,
        UserSubscriptionDetailService,
        OnlineUserService,
        UserRepository,
        UserSubscriptionDetailRepository
    ],
    controllers: [
        UserController,
        UserSubscriptionDetailController
    ],
    exports: [
        UserService,
        OnlineUserService,
        UserSubscriptionDetailService
    ]
})
export class UserModule {
}
