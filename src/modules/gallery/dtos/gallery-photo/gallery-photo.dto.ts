import { IsNotEmpty, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidUUID } from "../../../../shared/validators/uuid-validator";

export class GalleryPhotoDto {
  @ApiProperty({
    name: "galleryPhotoId",
    title: "Gallery Photo Id",
    description: "Gallery Photo Id",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @Validate(IsValidUUID)
  galleryPhotoId: string;

  @ApiProperty({
    name: "information",
    title: "Information",
    description: "Information",
    required: false,
    type: String
  })
  information: string;

  @ApiProperty({
    name: "name",
    title: "Name",
    description: "Name",
    required: false,
    type: String
  })
  name: string;
}