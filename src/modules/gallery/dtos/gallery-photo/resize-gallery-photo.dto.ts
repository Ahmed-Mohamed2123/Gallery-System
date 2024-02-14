import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ResizeGalleryPhotoDto {
  @ApiProperty({
    name: "galleryPhotoUrl",
    title: "Gallery Photo Url",
    description: "Gallery Photo Url",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  galleryPhotoUrl: string;

  @ApiProperty({
    name: "width",
    title: "With",
    description: "Image With",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  @IsString()
  width: number;

  @ApiProperty({
    name: "photoId",
    title: "Photo Id",
    description: "Gallery Photo Id",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  @IsString()
  height: number;
}