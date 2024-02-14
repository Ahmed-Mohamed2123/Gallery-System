import { ApiProperty, PickType } from "@nestjs/swagger";
import { GalleryPhotoDto } from "./gallery-photo.dto";
import { IsNotEmpty, Validate } from "class-validator";
import { IsValidUUID } from "../../../../shared/validators/uuid-validator";

export class CreateGalleryPhotoDto extends PickType(GalleryPhotoDto, [
  "information",
  "name"
]) {
  @ApiProperty({
    name: "userId",
    title: "User Id",
    description: "User Id",
    type: String,
    required: true
  })
  @IsNotEmpty()
  @Validate(IsValidUUID)
  userId: string;
}