import { IsNotEmpty, IsNumber, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidUUID } from "../../../../../shared/validators/uuid-validator";

export class GetFavoriteGalleryPhotoDto {
  @ApiProperty({
    name: "page",
    title: "Page",
    description: "Page",
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
    name: "favoriteId",
    title: "Favorite Id",
    description: "Favorite Id",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @Validate(IsValidUUID)
  favoriteId: string;
}