import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Validate } from "class-validator";
import { IsValidUUID } from "../../../../shared/validators/uuid-validator";

export class GetGalleryPhotoDto {
  @ApiProperty({
    name: "page",
    title: "Page",
    description: "Page Number",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty({
    name: "limit",
    title: "Limit",
    description: "Limit",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @ApiProperty({
    name: "galleryId",
    title: "Gallery Id",
    description: "Gallery Id",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @Validate(IsValidUUID)
  galleryId: string;
}