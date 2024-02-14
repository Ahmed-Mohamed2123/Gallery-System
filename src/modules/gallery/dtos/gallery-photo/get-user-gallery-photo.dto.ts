import { ApiProperty, PickType } from "@nestjs/swagger";
import { GetGalleryPhotoDto } from "./get-gallery-photo.dto";
import { IsNotEmpty, Validate } from "class-validator";
import { IsValidUUID } from "../../../../shared/validators/uuid-validator";

export class GetUserGalleryPhotoDto extends PickType(GetGalleryPhotoDto, ["page", "limit"]) {
  @ApiProperty({
    name: "userId",
    title: "User Id",
    description: "User Id",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @Validate(IsValidUUID)
  userId: string;
}