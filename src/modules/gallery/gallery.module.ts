import {forwardRef, Module} from "@nestjs/common";
import {GalleryService} from "./services/gallery.service";
import {GalleryController} from "./controllers/gallery.controller";
import {UserModule} from "../user/user.module";
import {MulterModule} from "@nestjs/platform-express";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Gallery} from "./entities/gallery.entity";
import {GalleryRepository} from "./repositories/gallery.repository";
import {ImagePath} from "../../shared/enums/image-path.enum";
import {GalleryPhoto} from "./entities/gallery-photo.entity";
import {GatewaysModule} from "../../gateways/gateways.module";
import {NotificationModule} from "../notification/notification.module";
import {FollowModule} from "../follow/follow.module";
import {GalleryPhotoController} from "./controllers/gallery-photo.controller";
import {GalleryPhotoService} from "./services/gallery-photo.service";
import {GalleryPhotoRepository} from "./repositories/gallery-photo.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([Gallery, GalleryPhoto]),
        MulterModule.register({
            dest: ImagePath.GALLERY
        }),
        MulterModule.register({
            dest: ImagePath.GALLERY_PHOTO
        }),
        forwardRef(() => UserModule),
        GatewaysModule,
        NotificationModule,
        forwardRef(() => FollowModule)
    ],
    providers: [
        GalleryService,
        GalleryRepository,
        GalleryPhotoService,
        GalleryPhotoRepository
    ],
    controllers: [
        GalleryController,
        GalleryPhotoController
    ],
    exports: [GalleryService, GalleryPhotoService]
})
export class GalleryModule {
}
