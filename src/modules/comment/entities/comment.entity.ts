import { Column, Entity, ManyToOne } from "typeorm";
import { GalleryPhoto } from "../../gallery/entities/gallery-photo.entity";
import { User } from "../../user/entities/user.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("comments")
export class Comment extends BaseDocument {

  @Column()
  content: string;

  @ManyToOne(type => GalleryPhoto, galleryPhoto => galleryPhoto.comments)
  galleryPhoto: GalleryPhoto;

  @Column()
  galleryPhotoId: string;

  @ManyToOne(type => User, user => user.comments)
  user: User;

  @Column()
  userId: string;
}
