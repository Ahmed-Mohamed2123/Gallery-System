import {PickType} from "@nestjs/swagger";
import {FavoriteDto} from "./favorite.dto";

export class DeletePhotoFromFavoriteListDto extends PickType(FavoriteDto, ["favoriteId", "galleryPhotoId"]) {
}