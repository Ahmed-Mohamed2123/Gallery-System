import {PickType} from "@nestjs/swagger";
import {FavoriteDto} from "./favorite.dto";

export class SavePhotoInFavoriteListDto extends PickType(FavoriteDto, ["favoriteId", "galleryPhotoId"]) {
}