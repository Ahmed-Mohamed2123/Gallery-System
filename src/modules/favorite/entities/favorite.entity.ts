import { Entity, OneToMany, OneToOne } from "typeorm";
import { FavoriteGalleryPhoto } from "./favorite-gallery-photo.entity";
import { Profile } from "../../profile/entities/profile.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("favorite-lists")
export class Favorite extends BaseDocument {
  @OneToMany(type => FavoriteGalleryPhoto, galleriesPhotosFavorites => galleriesPhotosFavorites.favorite, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  favoriteGalleriesPhotos: FavoriteGalleryPhoto[];

  @OneToOne(type => Profile, profile => profile.favorite, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  profile: Profile;
}
