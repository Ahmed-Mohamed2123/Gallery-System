import { Column, Entity, ManyToOne } from "typeorm";
import { GalleryPhoto } from "../../gallery/entities/gallery-photo.entity";
import { Favorite } from "./favorite.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("favorite-galleries-photos")
export class FavoriteGalleryPhoto extends BaseDocument {
  @Column()
  name: string;

  @Column()
  link: string;

  @Column()
  information: string;

  @ManyToOne(type => GalleryPhoto, galleryPhoto => galleryPhoto.favoriteGalleriesPhotos)
  galleryPhoto: GalleryPhoto;

  @Column()
  galleryPhotoId: string;

  @ManyToOne(type => Favorite, favorite => favorite.favoriteGalleriesPhotos)
  favorite: Favorite;

  @Column()
  favoriteId: string;

}
