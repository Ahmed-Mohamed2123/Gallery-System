import { FavoriteGalleryPhoto } from "../../entities/favorite-gallery-photo.entity";
import { IPaginatedBase } from "../../../../shared/interfaces/paginated-base.interface";

export interface IGetFavoriteGalleryPhoto extends IPaginatedBase {
  data: FavoriteGalleryPhoto[];
}
