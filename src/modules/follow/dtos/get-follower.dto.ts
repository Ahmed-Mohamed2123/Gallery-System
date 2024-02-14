import { IsNotEmpty, IsNumber, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidUUID } from "../../../shared/validators/uuid-validator";

export class GetFollowerDto {
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
    name: "page",
    title: "Page Number",
    description: "Page Number",
    required: true,
    type: Number
  })
  @IsNotEmpty()
  @IsNumber()
  page: number;
}
