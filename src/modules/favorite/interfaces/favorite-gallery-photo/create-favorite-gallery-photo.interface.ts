import {GalleryPhoto} from "../../../gallery/entities/gallery-photo.entity";
import {Favorite} from "../../entities/favorite.entity";

export interface ICreateFavoriteGalleryPhoto {
    name?: string;
    information?: string;
    link?: string;
    galleryPhoto: GalleryPhoto;
    favorite: Favorite;
}