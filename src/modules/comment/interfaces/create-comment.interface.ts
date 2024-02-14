import { User } from "../../user/entities/user.entity";
import { GalleryPhoto } from "../../gallery/entities/gallery-photo.entity";

export interface ICreateComment {
  user: User;
  galleryPhoto: GalleryPhoto;
  content: string;
}