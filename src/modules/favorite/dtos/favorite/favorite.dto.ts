import { IsNotEmpty, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidUUID } from "../../../../shared/validators/uuid-validator";

export class FavoriteDto {
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
}