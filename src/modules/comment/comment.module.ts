import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {CommentService} from "./comment.service";
import {CommentRepository} from "./repositories/comment.repository";
import {UserModule} from "../user/user.module";
import {CommentController} from "./comment.controller";
import {Comment} from "./entities/comment.entity";
import {GalleryModule} from "../gallery/gallery.module";
import {RedisCacheModule} from "../../cache/redis-cache.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment]),
        GalleryModule,
        UserModule,
        RedisCacheModule
    ],
    providers: [CommentService, CommentRepository],
    controllers: [CommentController]
})
export class CommentModule {
}
