import { PickType } from "@nestjs/swagger";
import { GalleryPhotoDto } from "./gallery-photo.dto";

export class UpdateGalleryPhotoDto extends PickType(GalleryPhotoDto, [
  "information",
  "name",
  "galleryPhotoId"
]) {
}