import { IsNotEmpty, IsString, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidUUID } from "../../../shared/validators/uuid-validator";

export class CreateCommentDto {
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
    name: "content",
    title: "Content",
    description: "Content",
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}