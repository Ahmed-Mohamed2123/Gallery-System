import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {FavoriteService} from "./services/favorite/favorite.service";
import {FavoriteController} from "./controllers/favorite/favorite.controller";
import {Favorite} from "./entities/favorite.entity";
import {FavoriteRepository} from "./repositories/favorite.repository";
import {FavoriteGalleryPhoto} from "./entities/favorite-gallery-photo.entity";
import {FavoriteGalleryPhotoController} from "./controllers/favorite-gallery-photo/favorite-gallery-photo.controller";
import {FavoriteGalleryPhotoService} from "./services/favorite-gallery-photo/favorite-gallery-photo.service";
import {FavoritePhotoRepository} from "./repositories/favorite-photo.repository";
import {GalleryModule} from "../gallery/gallery.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Favorite,
            FavoriteGalleryPhoto
        ]),
        GalleryModule,
    ],
    controllers: [
        FavoriteController,
        FavoriteGalleryPhotoController
    ],
    providers: [
        FavoriteService,
        FavoriteGalleryPhotoService,
        FavoriteRepository,
        FavoritePhotoRepository
    ],
    exports: [
        FavoriteService,
        FavoriteGalleryPhotoService
    ]
})
export class FavoriteModule {
}
