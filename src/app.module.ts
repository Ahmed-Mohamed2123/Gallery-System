import {Module} from "@nestjs/common";
import {TypeOrmModule, TypeOrmModuleOptions} from "@nestjs/typeorm";
import {NodemailerDrivers, NodemailerModule, NodemailerOptions} from "@crowdlinker/nestjs-mailer";
import {ScheduleModule} from "@nestjs/schedule";
import {ConfigModule} from "@nestjs/config";
import {APP_GUARD} from "@nestjs/core";
import {HttpModule} from "@nestjs/axios";
import {CONFIG} from "./config/config";
import {FavoriteModule} from "./modules/favorite/favorite.module";
import {ProfileModule} from "./modules/profile/profile.module";
import {AuthModule} from "./modules/auth/auth.module";
import {GalleryModule} from "./modules/gallery/gallery.module";
import {RoomChatModule} from "./modules/room-chat/room-chat.module";
import {FollowModule} from "./modules/follow/follow.module";
import {StoryModule} from "./modules/story/story.module";
import {UserModule} from "./modules/user/user.module";
import {NotificationModule} from "./modules/notification/notification.module";
import {GatewaysModule} from "./gateways/gateways.module";
import {PersonalChatModule} from "./modules/personal-chat/personal-chat.module";
import {AppController} from "./app.controller";
import {CommentModule} from "./modules/comment/comment.module";
import {APICheckGuard} from "./guards/api-check.guard";
import {HealthModule} from "./health/health.module";
import {RedisCacheModule} from "./cache/redis-cache.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV || "local"}.env`
        }),
        TypeOrmModule.forRoot(CONFIG.DATABASE as TypeOrmModuleOptions),
        NodemailerModule.forRoot(CONFIG.NODE_MAILER_OPTIONS as NodemailerOptions<NodemailerDrivers.SMTP>),
        ScheduleModule.forRoot(),
        RedisCacheModule,
        HttpModule,
        HealthModule,
        FavoriteModule,
        ProfileModule,
        GalleryModule,
        UserModule,
        StoryModule,
        AuthModule,
        RoomChatModule,
        FollowModule,
        NotificationModule,
        GatewaysModule,
        PersonalChatModule,
        CommentModule
    ],
    controllers: [
        AppController
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: APICheckGuard
        },
    ]
})
export class AppModule {
}
