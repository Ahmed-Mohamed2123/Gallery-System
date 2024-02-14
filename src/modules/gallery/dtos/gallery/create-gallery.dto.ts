import { IsNotEmpty, IsString, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidUUID } from "../../../../shared/validators/uuid-validator";

export class CreateGalleryDto {
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
    name: "name",
    title: "Name",
    description: "Gallery Name",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}