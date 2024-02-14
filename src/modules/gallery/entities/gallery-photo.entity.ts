import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Comment } from "../../comment/entities/comment.entity";
import { Gallery } from "./gallery.entity";
import { FavoriteGalleryPhoto } from "../../favorite/entities/favorite-gallery-photo.entity";
import { BaseDocument } from "../../../shared/database/base-document";
import { User } from "../../user/entities/user.entity";

@Entity("galleries-photos")
export class GalleryPhoto extends BaseDocument {

  @Column()
  name: string;

  @Column()
  information: string;

  @Column()
  image: string;

  @ManyToOne(() => Gallery, gallery => gallery.galleryPhotos)
  gallery: Gallery;

  @Column()
  galleryId: string;

  @ManyToOne(() => User, user => user.galleryPhotos)
  user: User;

  @Column()
  userId: string;

  @OneToMany(type => Comment, comments => comments.galleryPhoto, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  comments: Comment[];

  @OneToMany(type => FavoriteGalleryPhoto, favoriteGalleryPhoto => favoriteGalleryPhoto.galleryPhoto, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  favoriteGalleriesPhotos: FavoriteGalleryPhoto[];
}
