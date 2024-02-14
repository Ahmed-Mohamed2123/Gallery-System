import {
  Column,
  Entity, ManyToOne, OneToMany
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { GalleryPhoto } from "./gallery-photo.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("galleries")
export class Gallery extends BaseDocument {
  @Column()
  name: string;

  @Column()
  imageUrl: string;

  @ManyToOne(type => User, user => user.gallery)
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => GalleryPhoto, galleryPhoto => galleryPhoto.gallery, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  galleryPhotos: GalleryPhoto[];

}
