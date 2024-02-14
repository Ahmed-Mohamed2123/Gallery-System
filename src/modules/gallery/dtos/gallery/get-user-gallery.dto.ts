import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Validate } from "class-validator";
import { IsValidUUID } from "../../../../shared/validators/uuid-validator";

export class GetUserGalleryDto {
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
    name: "page",
    title: "Page Number",
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
}